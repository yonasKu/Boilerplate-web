# Admin Login & Dashboard Integration (Web)

This guide explains how to enforce admin-only access for the web login and admin routes, analyzes the current admin dashboard (which uses static demo data), and provides a plan to replace demo data with real backend data, including Firestore collections and security rules.

## Scope
- Admin-only authentication and route protection
- Inventory of current admin pages using static data
- Firestore data model for admin dashboard features
- Firestore security rules for admin data
- Backend functions plan (minimal endpoints) to support the admin panel
- Step-by-step migration plan and testing checklist

---

## Current State Snapshot
- UI components
  - `src/components/admin/AdminLayout.tsx`: Sidebar layout and header for admin.
  - `src/app/(dashboard)/admin/layout.tsx`: Wraps admin pages with the admin layout.
- Pages (all using static demo data)
  - `src/app/(dashboard)/admin/page.tsx`: Dashboard cards, user growth chart, recent signups.
  - `src/app/(dashboard)/admin/users/page.tsx`: User list with actions (demo array).
  - `src/app/(dashboard)/admin/subscriptions/page.tsx`: Subscription list and actions (demo array).
  - `src/app/(dashboard)/admin/analytics/page.tsx`: Metrics and distribution (demo arrays/charts).
  - `src/app/(dashboard)/admin/promo-codes/page.tsx`: Promo management (demo array).
  - `src/app/(dashboard)/admin/moderation/page.tsx`: Reported content (demo array).
- Auth utilities
  - `src/hooks/useAuth.ts`: Handles Firebase web auth and ensures a `users/{uid}` doc exists.

---

## Admin-Only Authentication Model
Use either custom claims (recommended) or a Firestore role flag as the source of truth.

- Preferred: Firebase custom claims
  - Server-only using Admin SDK. Example callable/CLI function:
  ```ts
  // functions example (Node Admin SDK)
  import * as admin from 'firebase-admin';
  // await admin.auth().setCustomUserClaims(uid, { admin: true });
  ```
  - Clients check with `getIdTokenResult(user, true)` and read `token.claims.admin === true`.

- Fallback: Firestore role flag
  - `users/{uid}.role = 'admin'` or `users/{uid}.isAdmin = true`.
  - Clients read the user doc and check the field.

Frontend enforcement points:
- Route guard (layout-level)
  - Wrap admin routes (e.g., `src/app/(dashboard)/admin/layout.tsx`) with a guard that:
    - Redirects unauthenticated users to `/login`.
    - Redirects authenticated non-admin users to `/` (or an error page).
  - Guard logic should consider both: `token.claims.admin` and/or `users/{uid}.role`.

- Login gating (admin-only)
  - Allow sign-in methods you support (Google/Apple SSO). After sign-in, if not admin:
    - Immediately sign out and show "Admins only" message.
  - If admin, redirect to `/admin`.

- Backend protection
  - For callable/HTTP Cloud Functions, check `context.auth.token.admin === true` (custom claims) server-side.

---

## Firestore Data Model (Collections & Schemas)
Below is a minimal schema to support the admin dashboard. Adjust names if you prefer singular/plural.

- `users/{uid}`
  - `name: string`
  - `email: string`
  - `role?: 'admin' | 'user'` or `isAdmin?: boolean`
  - `status?: 'active' | 'inactive' | 'suspended' | ...`
  - `subscription?: { plan: 'trial'|'monthly'|'annual'|'free'; status: 'active'|'canceled'|'past_due'; startDate?: Timestamp; currentPeriodEnd?: Timestamp; }`
  - `createdAt: Timestamp`
  - `lastActiveAt?: Timestamp`

- `subscriptions/{uid}` (optional separate collection if you prefer decoupling)
  - `stripeCustomerId: string`
  - `stripeSubscriptionId: string`
  - `plan: 'monthly'|'annual'`
  - `status: 'active'|'canceled'|'incomplete'|'trialing'|'past_due'`
  - `currentPeriodStart: Timestamp`
  - `currentPeriodEnd: Timestamp`
  - `cancelAtPeriodEnd?: boolean`
  - `updatedAt: Timestamp`

- `promo_codes/{code}` (document ID equals the code)
  - `active: boolean`
  - `discountType: 'percent'|'amount'`
  - `discountValue: number`
  - `maxRedemptions?: number`
  - `redemptionCount: number`
  - `metadata?: { createdBy: string; createdAt: Timestamp; notes?: string }`

- `reports/{reportId}` (moderation)
  - `contentRef: string` (path to offending content)
  - `reason: string`
  - `status: 'open'|'reviewing'|'resolved'|'removed'`
  - `reportedBy: string`
  - `createdAt: Timestamp`
  - `resolvedBy?: string`
  - `resolvedAt?: Timestamp`
  - `notes?: string`

- `analytics/daily/{yyyy-mm-dd}`
  - `totalUsers: number`
  - `activeSubscriptions: number`
  - `mau?: number`
  - `dau?: number`
  - `revenue?: number`
  - plus any time-series you need for charts

- `admin_audit_logs/{logId}`
  - `action: string` (e.g., 'disable_user', 'create_promo')
  - `actorUid: string`
  - `target?: string`
  - `timestamp: Timestamp`
  - `details?: object`

---

## Firestore Security Rules (Admin-Only Parts)
Adjust to your `firestore.rules` style. The key idea is to gate admin resources and admin operations.

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }

    // Custom claims preferred; fallback to Firestore role check
    function isAdmin() {
      return (request.auth.token.admin == true)
        || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
        || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // Users collection
    match /users/{uid} {
      allow read, update: if isSignedIn() && request.auth.uid == uid; // user self
      allow read, list: if isAdmin();
      allow update, delete: if isAdmin();
      allow create: if isSignedIn();
    }

    // Admin-only collections
    match /subscriptions/{uid} {
      allow read, list, write: if isAdmin();
    }

    match /promo_codes/{code} {
      allow read, list, write: if isAdmin();
    }

    match /reports/{reportId} {
      allow read, list, write: if isAdmin();
    }

    match /analytics/{scope}/{docId} {
      allow read, list: if isAdmin();
      allow write: if isAdmin();
    }

    match /admin_audit_logs/{logId} {
      allow read, list: if isAdmin();
      allow write: if isAdmin();
    }
  }
}
```

Notes:
- Keep PII exposure minimal. If you need non-admin analytics for marketing pages, put them in a public-okay document separate from admin-only analytics.
- Consider HTTP/Callable functions for dangerous writes (e.g., disabling users) so you can do additional server-side checks and logging.

---

## Replace Demo Data With Real Data (Per Page)

- Dashboard `src/app/(dashboard)/admin/page.tsx`
  - Replace hardcoded counts with Firestore data:
    - Use Firestore aggregation query for counts (e.g., `getCountFromServer` on `users`).
    - Read `analytics/daily/{today}` for DAU/MAU/revenue if you pre-aggregate with a scheduled function.
    - Recent signups: query `users` ordered by `createdAt` desc, limit 5.

- Users `src/app/(dashboard)/admin/users/page.tsx`
  - Query `users` with pagination (order by `createdAt` desc). Use cursor-based pagination.
  - Show fields: `name`, `email`, `status`, `role`, `subscription.plan`, `lastActiveAt`, `createdAt`.
  - Actions:
    - Disable/Enable user: update `users/{uid}.status` via function or direct admin write.
    - Delete user: Prefer a callable function that deletes auth user + Firestore docs and logs in `admin_audit_logs`.

- Subscriptions `src/app/(dashboard)/admin/subscriptions/page.tsx`
  - Source of truth: data mirrored by Stripe webhooks.
  - Read from `subscriptions/{uid}` (or `users/{uid}.subscription`).
  - Actions: extend/cancel/upgrade should be via backend function that talks to Stripe API, then updates Firestore.

- Analytics `src/app/(dashboard)/admin/analytics/page.tsx`
  - Read pre-aggregated documents under `analytics/daily/*` for time-series charts.
  - Optional: Use scheduled Cloud Functions to compute daily metrics.

- Promo Codes `src/app/(dashboard)/admin/promo-codes/page.tsx`
  - Read/write `promo_codes/{code}`.
  - Create/disable via callable/HTTP function to add validation and audit logging.

- Moderation `src/app/(dashboard)/admin/moderation/page.tsx`
  - Read `reports/{reportId}` documents.
  - Approve/remove/ban actions write back to `reports` and relevant target content path. Use functions for destructive operations.

---

## Backend Functions Plan (Minimal Set)
- Admin role management
  - `setAdminRole(uid: string, isAdmin: boolean)` — Admin-only; sets custom claims and updates `users/{uid}.role`.
- Users management
  - `disableUser(uid)`, `enableUser(uid)`, `deleteUser(uid)` — updates Auth + Firestore, writes audit logs.
- Promo codes
  - `createPromoCode(code, payload)`, `disablePromoCode(code)` — writes to `promo_codes/*`.
- Analytics aggregation (scheduled)
  - Nightly job to write `analytics/daily/{yyyy-mm-dd}`.
- Stripe (separate doc exists): ensure webhook updates `subscriptions/*` or `users/*`.

All admin-callable endpoints must verify `context.auth.token.admin === true`.

---

## Migration Plan (Step-by-Step)
1) Admin source of truth
- Choose custom claims + optional Firestore role mirror. Backfill current admins.

2) Firestore rules
- Add `isAdmin()` and admin-only rules as above. Deploy rules.

3) Backend endpoints
- Implement minimal callable functions for admin actions (role set, promo create/disable). Add audit logs.

4) Data plumbing
- Create `promo_codes`, `reports`, `analytics` collections. Backfill if needed.

5) UI wiring
- Replace demo arrays with Firestore queries + functions per page (users, subscriptions, analytics, promo, moderation).

6) Testing
- See checklist below.

---

## Testing Checklist
- Admin login
  - Non-admin sign-in is blocked (immediate sign-out + message).
  - Admin can sign in and access `/admin` routes.
- Firestore rules
  - Non-admin cannot read/list admin-only collections.
  - Admin can read/write where expected.
- Users page
  - Pagination works. Disable/enable actions reflect in Firestore and UI.
- Subscriptions page
  - Data matches Stripe state (after webhook sync). Actions go through backend functions.
- Promo codes
  - Create/disable works. Redemptions increment as expected.
- Moderation
  - Status transitions update. Dangerous actions logged in `admin_audit_logs`.
- Analytics
  - Charts render from `analytics/daily` docs. Nightly job writes next-day docs.

---

## Notes & Recommendations
- Prefer custom claims for admin checks; mirror role in Firestore for display only.
- For destructive actions, always go through callable/HTTP functions and audit.
- Use `getCountFromServer` for quick counts; for heavy analytics, pre-aggregate.
- Keep PII access minimal and ensure rules enforce least privilege.

This document aligns with `sproutbook-web/ADMIN_PANEL_PLAN.md` and focuses on making the admin panel secure and data-driven by replacing static data with Firestore + Functions.
