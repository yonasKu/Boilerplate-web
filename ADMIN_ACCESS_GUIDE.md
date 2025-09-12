# Admin Access Guide — SproutBook Web

This doc explains how to grant admin access to a user and how to reach the Admin Panel UI in the web app.

Key source files:
- Guard: `sproutbook-web/src/components/admin/AdminGuard.tsx`
- Role check hook: `sproutbook-web/src/hooks/useAdmin.ts`
- Admin layout: `sproutbook-web/src/components/admin/AdminLayout.tsx`
- Admin routes: `sproutbook-web/src/app/(dashboard)/admin/*`
- Admin HTTP APIs: `functions/functions/http/admin.js`
- Firestore rules (admin gating): `firestore.rules`

Admin check logic (frontend)
- `useAdmin()` returns `isAdmin` if EITHER of these is true:
  - Firebase custom claim: `token.claims.admin === true`, or
  - Firestore flag in `users/{uid}`: `role === 'admin'` OR `isAdmin === true`
- `AdminGuard` redirects non-admin users away from `/admin` routes.

Admin Panel entry point
- URL path: `/admin`
- Pages: Dashboard, Users, Subscriptions, Analytics, Moderation, Promo Codes
- Wrapped by `AdminGuard` in `src/app/(dashboard)/admin/layout.tsx`

## 1) Bootstrap your first admin (one-time)
You need to make your own user an admin once. The easiest way is via Firestore Console (bypasses rules). After that, you can use the backend function to promote others.

Steps:
1) Create/sign in a normal user in the web app so that `users/{uid}` exists.
2) Go to Firestore Console → `users` → open your user doc → add one of the following fields:
   - `role: "admin"` (string)
   - OR `isAdmin: true` (boolean)
3) Refresh the web app and go to `/admin`. The guard will allow you in.

Notes:
- This also satisfies the backend `isAdminDecoded()` check in `functions/functions/http/admin.js`, so you can call admin HTTP APIs.

## 2) Promote/demote others via backend function
Once you are an admin, use the `adminSetAdminRole` HTTP function to grant or revoke admin for any user. You must include an ID token of a logged-in admin in the Authorization header.

Function endpoint pattern:
- `https://us-central1-<PROJECT_ID>.cloudfunctions.net/adminSetAdminRole`
  - For this project: `https://us-central1-sproutbook-d0c8f.cloudfunctions.net/adminSetAdminRole`

Example (run in browser devtools console while logged in as admin):
```js
(async () => {
  const token = await firebase.auth().currentUser.getIdToken(true); // or import { auth } from '@/lib/firebase/config'
  const targetUid = '<UID_TO_PROMOTE>';
  const res = await fetch('https://us-central1-sproutbook-d0c8f.cloudfunctions.net/adminSetAdminRole', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ targetUid, makeAdmin: true })
  });
  console.log(await res.json());
})();
```
Demote:
```js
body: JSON.stringify({ targetUid, makeAdmin: false })
```

Alternatively (from code), use the helper in `src/lib/adminApi.ts`:
```ts
import { adminSetAdminRole } from '@/lib/adminApi';
await adminSetAdminRole({ targetUid, makeAdmin: true });
```

## 3) Deployment prerequisites
- Ensure the admin HTTP functions are deployed:
```bash
# run from repo root
firebase deploy --only functions:adminSetAdminRole,functions:adminCreatePromoCode,functions:adminDisablePromoCode,functions:adminModerationAction --project sproutbook-d0c8f
```
- Web app must have `NEXT_PUBLIC_FIREBASE_PROJECT_ID` set for `src/lib/adminApi.ts` to compute the functions base URL.

## 4) Are there sample users?
- The Admin Users page (`src/app/(dashboard)/admin/users/page.tsx`) subscribes to the live `users` collection. There are NO hardcoded sample users in code.
- The Admin Dashboard (`src/app/(dashboard)/admin/page.tsx`) reads live counts (users, active subscriptions, DAU) from Firestore. No static demo data here either.

## 5) Troubleshooting
- "Redirected from /admin" → Your account isn’t recognized as admin. Confirm either:
  - Custom claim `admin: true` (re-mint token with `getIdTokenResult(user, true)`), or
  - Firestore `users/{uid}` has `role: 'admin'` or `isAdmin: true`.
- `Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID` → set this env var for the web app so `adminApi.ts` can call the correct Functions URL.
- HTTP 403 from admin functions → Your ID token is not admin; recheck step 1.

## 6) Optional hardening
- Prefer custom claims as source of truth; mirror role in Firestore only for display.
- Add an allowlist for the bootstrap phase in the function (e.g., env var with initial admin UID) and remove it after first promotion.
- Audit logs are written to `admin_audit_logs` in the functions provided — review regularly.
