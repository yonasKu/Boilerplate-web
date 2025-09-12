# Google Sign‑In (Web) Setup — SproutBook

This guide configures Google Sign-In for the SproutBook web app using Firebase Authentication.

Related code:
- Auth hook: `sproutbook-web/src/hooks/useAuth.ts`
- Signup page: `sproutbook-web/src/app/(auth)/signup/page.tsx`

Behavior implemented in code:
- Email/password: creates Firebase Auth user, sends verification email, then redirects to `/(auth)/verify-email`. Firestore user document is created only after the email is verified.
- Google: identity is verified by Google; Firestore user document is created immediately and user is redirected to `/pricing`.

---

## 1) Prerequisites

- Firebase project: `sproutbook-d0c8f`
- Firebase Console access: https://console.firebase.google.com/

---

## 2) Enable Google Sign-In in Firebase

1. Firebase Console → Authentication → Sign-in method → Google → Enable.
2. Project support email: pick an email (e.g., owner/admin) that appears on Google consent screens.
3. Save.

Authorized domains (same page → Settings → Authorized domains):
- Add these at minimum:
  - `sproutbook-d0c8f.firebaseapp.com`
  - `sproutbook-d0c8f.web.app`
  - `localhost` (for local development)
  - Your production domain (e.g., Vercel custom domain)

---

## 3) OAuth Consent Screen (if required)

For Google Cloud projects, ensure the OAuth consent screen is configured:
- Go to https://console.cloud.google.com/apis/credentials
- Select the Firebase-linked project.
- Configure OAuth consent screen:
  - App name, user support email
  - Developer contact info
  - Add authorized domains if requested (must match Firebase Authorized Domains)
  - If the app is external and in testing, add test users (emails) until you publish the app

This step is often auto-handled by Firebase, but verify if you see `auth/unauthorized-domain` or consent issues.

---

## 4) How the Web App Handles Google Sign‑In

- `useAuth.ts` uses `new GoogleAuthProvider()` with `signInWithPopup` and fallback to `signInWithRedirect`.
- On success, it ensures a Firestore user document exists immediately with:
  - `emailVerified: true`
  - `source: 'web-google'`
  - A trial subscription placeholder.
- The signup page redirects Google users straight to `/pricing`.

Email/password flow recap:
- After email/password signup, user goes to `/(auth)/verify-email`.
- That page creates the Firestore user document only after `emailVerified` is true, then redirects to `/pricing`.

---

## 5) Local Development & Testing

- Run the web app (Next.js): `npm run dev` or `yarn dev` in `sproutbook-web/`.
- Popup blockers: the code falls back to `signInWithRedirect` automatically.
- Ensure `localhost` is in Firebase Authorized domains.

---

## 6) Common Errors & Fixes

- `auth/unauthorized-domain`
  - Add your domain (localhost, Firebase Hosting, production domain) to Firebase Authorized Domains.

- Popup blocked
  - Browser blocked popups; our code falls back to `signInWithRedirect`. Try again.

- Consent screen issues / “app not verified”
  - Configure or publish the OAuth consent screen in Google Cloud Console. Add test users if still in testing mode.

---

## 7) Quick Checklist

- Firebase
  - [ ] Google provider enabled
  - [ ] Authorized domains include localhost, Firebase hosting domain(s), and your production domain

- App
  - [ ] Google redirect to `/pricing`
  - [ ] Email/password redirect to `/(auth)/verify-email`
  - [ ] Firestore user created after Google sign-in (or after email verification for password flow)

---

## 8) References

- Firebase Auth with Google: https://firebase.google.com/docs/auth/web/google-signin
- Google Cloud Console (OAuth): https://console.cloud.google.com/apis/credentials
