# SproutBook Web — Deploying to Vercel

This guide covers deploying the Next.js web app in `sproutbook-web/` to Vercel, adding environment variables, setting up custom domains/DNS, and configuring OAuth for Google/Apple. It also covers deploying the Firebase admin HTTP functions the website calls.

## Overview
- Framework: Next.js 15 (client-first; no custom API routes in web)
- Hosting: Vercel (recommended for Next.js)
- Backend: Firebase (Auth, Firestore, Cloud Functions)
- Monorepo: Yes — set Vercel Root Directory to `sproutbook-web/`

## Prerequisites
- Vercel account with access to your Git repository
- Firebase project: `sproutbook-d0c8f` (or your own)
- Firebase Auth: Google and Apple sign-in enabled
- Firebase Functions: admin functions deployed (details below)

## 1) Prepare environment variables
Create `.env.local` locally (and configure the same vars in Vercel → Project Settings → Environment Variables):

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` — e.g. `your-project.firebaseapp.com`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` — e.g. `sproutbook-d0c8f`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` — e.g. `your-project.appspot.com`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Optional (debug admin gate on /login):
- `NEXT_PUBLIC_DEBUG_ADMIN` — set to `1` to show the on-screen admin debug panel

See `sproutbook-web/.env.local.example` for a template and where to find values in the Firebase Console.

Tip: Use different Firebase projects per Vercel env
- Development: Dev Firebase project
- Preview: Staging Firebase project
- Production: Production Firebase project
Add the variables for each Vercel environment accordingly.

## 2) Create the Vercel project
1. Import your Git repo into Vercel.
2. When prompted, set:
   - Framework preset: Next.js
   - Root Directory: `sproutbook-web/` (critical for monorepo)
   - Build Command: `npm run build` (Vercel detects Next automatically)
   - Output: Auto-detected
3. Add Environment Variables (same keys as above) for Development/Preview/Production.
4. Deploy.

## 3) Set up OAuth allowed domains
Because the web integrates with Firebase Auth, you must allow the hosted domain(s):

Firebase Console → Authentication → Settings → Authorized Domains
- Add: `your-project.vercel.app` and your custom domain, e.g. `app.yourdomain.com`

Google Sign-In (Google Cloud Console → OAuth consent & credentials)
- Authorized JavaScript origins: add both `https://your-project.vercel.app` and productions domains
- Authorized redirect URIs: (Firebase SDK uses default; in most cases origins are enough). If you configured custom redirect flow, add those here.

Apple Sign-In
- Add your web domain and return URLs in Apple developer settings (Services → Sign In with Apple → Web)

## 4) Deploy Firebase admin functions (once per backend project)
The web calls these Cloud Functions for admin actions (e.g., promoting users).

From the repo root (not `sproutbook-web/`):
```bash
firebase deploy \
  --only functions:adminSetAdminRole,functions:adminCreatePromoCode,functions:adminDisablePromoCode,functions:adminModerationAction \
  --project sproutbook-d0c8f
```
Make sure the web’s `NEXT_PUBLIC_FIREBASE_PROJECT_ID` matches the project you deploy functions to. The web constructs the functions base URL like:
```
https://us-central1-<PROJECT_ID>.cloudfunctions.net/<functionName>
```

## 5) Add a custom domain (optional)
If you have a custom domain (e.g., `app.yourdomain.com`):
1. Vercel → Project → Settings → Domains → Add `app.yourdomain.com`
2. Follow Vercel’s DNS instructions (either add a CNAME to `cname.vercel-dns.com` or delegate nameservers to Vercel)
3. Wait for propagation and green checks
4. Add the custom domain to Firebase Auth Authorized Domains and OAuth origins

## 6) Git-based deployments
- Every push to your repo triggers a new build on Vercel.
- Production is typically your main/default branch; other branches create Preview Deployments.
- Use Preview URLs for QA; confirm OAuth allowed domains include the preview domain if testing Auth.

## 7) Testing checklist
- Sign-in with Google/Apple works on the live domain
- Email/password (if temporarily enabled) works as expected
- Firestore reads/writes work from the live site
- Admin access (role or isAdmin) redirects to `/admin`
- Calling an admin function (e.g., `adminSetAdminRole`) returns 200 with valid admin token

## 8) Troubleshooting
- 401/403 from admin functions: Your ID token is not an admin; set `users/{uid}.role = 'admin'` or `isAdmin = true`, or set a custom claim via backend
- OAuth popup blocked/unauthorized domain: Add your Vercel domain(s) to Firebase Auth and Google/Apple permitted domains/origins
- Wrong Firebase project: The site prints the projectId in the admin debug panel (if enabled) — ensure it’s the correct one
- “Access restricted: Admins only”: The web didn’t detect admin in custom claims or Firestore doc; ensure the `users/{auth.uid}` doc has `role: 'admin'` or `isAdmin: true`

## 9) Rollback
- Vercel → Deployments: Promote a previous deployment to Production to roll back instantly.

## 10) Security tips
- Prefer custom claims for admin; mirror role in Firestore for UI only
- Do not embed secrets that are not intended to be public; anything prefixed with `NEXT_PUBLIC_` is client-visible
- Keep Functions authenticated and validate admin on the server side too

---

If you’d like, we can add a Vercel badge and a GitHub Action to lint/build on PRs before Vercel previews are created.
