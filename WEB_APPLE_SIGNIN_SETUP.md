# Apple Sign‑In (Web) Setup — SproutBook

This guide configures Sign in with Apple for the SproutBook web app using Firebase Authentication.

Related code:
- Auth hook: `sproutbook-web/src/hooks/useAuth.ts`
- Signup page: `sproutbook-web/src/app/(auth)/signup/page.tsx`
- Email verification page: `sproutbook-web/src/app/(auth)/verify-email/page.tsx`

Behavior implemented in code:
- Email/password: creates Firebase Auth user, sends verification email, then redirects to `/(auth)/verify-email`. Firestore user document is created only after the email is verified.
- Google/Apple: identity is verified by the provider; Firestore user document is created immediately and user is redirected to `/pricing`.

---

## 1) Prerequisites

- Apple Developer Program access: https://developer.apple.com/account/
- Firebase project: `sproutbook-d0c8f`
- Firebase Console access: https://console.firebase.google.com/

---

## 2) Apple Developer — Create Service ID (Client ID)

1. Apple Developer → Certificates, Identifiers & Profiles → Identifiers → “+” → Service IDs.
2. Description: SproutBook Web
3. Identifier (Client ID): `com.palex.sproutbook.web` (recommended — must match exactly later in Firebase)
4. Enable “Sign in with Apple”. Save.

Add Return URL(s) on the Service ID details:
- Primary Return URL (Firebase handler):
  - `https://sproutbook-d0c8f.firebaseapp.com/__/auth/handler`
- If you also use the web.app hosting domain, add:
  - `https://sproutbook-d0c8f.web.app/__/auth/handler`

Note: These URLs come from Firebase → Authentication → Sign-in method → Apple (shown after enabling). They must match exactly.

---

## 3) Apple Developer — Create Sign in with Apple Key

1. Apple Developer → Keys → “+”.
2. Name: SproutBook Apple Sign-In
3. Enable: “Sign in with Apple”.
4. Continue and download the `.p8` private key. Keep it safe.

Record the following:
- Team ID: shown on your Apple Developer account (e.g., `XUW3VL9XHM`).
- Key ID: the ID of the key you just created.
- Private Key: the contents of the `.p8` file.

---

## 4) Firebase Console — Enable Apple Provider

1. Firebase Console → Authentication → Sign-in method → Apple → Enable.
2. Fill in:
   - Services ID (Client ID): `com.palex.sproutbook.web`
   - Team ID: your Apple Team ID (e.g., `XUW3VL9XHM`)
   - Key ID: the Apple key’s ID
   - Private key: paste the `.p8` file contents
3. Save.

Authorized domains (same page → Settings → Authorized domains):
- Add these at minimum:
  - `sproutbook-d0c8f.firebaseapp.com`
  - `sproutbook-d0c8f.web.app`
  - `localhost` (for local development)
  - Your production domain (e.g., Vercel custom domain)

---

## 5) How the Web App Handles Apple Sign‑In

- `useAuth.ts` uses `new OAuthProvider('apple.com')` with `signInWithPopup` and fallback to `signInWithRedirect`.
- On success, it ensures a Firestore user document exists immediately with:
  - `emailVerified: true`
  - `source: 'web-apple'`
  - A trial subscription placeholder.
- The signup page redirects Apple users straight to `/pricing`.

Email/password flow:
- After email/password signup, user goes to `/(auth)/verify-email`.
- That page polls for `user.emailVerified`; once true, it creates the Firestore user document and redirects to `/pricing`.

---

## 6) Local Development & Testing

- Run the web app (e.g., Next.js dev server): `npm run dev` or `yarn dev` in `sproutbook-web/`.
- The Apple popup may be blocked; the code falls back to redirect automatically.
- Ensure `localhost` is in Firebase Authorized domains.
- For the Apple Service ID, you only configure the Firebase handler URLs; your app’s domain (localhost) does not need to be on Apple’s side.

---

## 7) Common Errors & Fixes

- `invalid_client` or `redirect_uri_mismatch`
  - The Return URL on the Apple Service ID must match Firebase’s handler exactly. Copy it from the Firebase Apple provider config and paste into Apple.

- `auth/unauthorized-domain`
  - Add your domain (localhost, Firebase Hosting, production domain) to Firebase Authorized Domains.

- Popup blocked
  - Browser blocked popups; our code falls back to `signInWithRedirect`. Try again.

- Apple "private relay" email / missing name
  - Apple may hide the real email; you’ll get a relay address. Name is only provided on first sign-in. Consider a post-login profile completion step if you require a name.

---

## 8) Optional Variations

- Enforce email verification for all providers:
  - Change social sign-in redirect in `signup/page.tsx` from `/pricing` to `/verify-email` and move Firestore user creation to `/(auth)/verify-email` only.

- Track first-time social sign-in:
  - On the first Apple/Google login (no existing user doc), mark a flag like `isNewUser: true` or `createdAt` to drive onboarding steps.

---

## 9) Quick Checklist

- Apple Developer
  - [ ] Service ID (Client ID) `com.palex.sproutbook.web` with Return URL(s) set to Firebase handler(s)
  - [ ] Sign in with Apple key created and downloaded (`.p8`), with Key ID noted
  - [ ] Team ID noted

- Firebase
  - [ ] Apple provider enabled with Client ID, Team ID, Key ID, `.p8` contents
  - [ ] Authorized domains include localhost, Firebase hosting domain(s), and your production domain

- App
  - [ ] Google/Apple redirect to `/pricing`
  - [ ] Email/password redirect to `/(auth)/verify-email`
  - [ ] Firestore user created after provider sign-in, or after email verification (password flow)

---

## 10) References

- Firebase Auth with Apple: https://firebase.google.com/docs/auth/web/apple
- Apple Sign in with Apple (web): https://developer.apple.com/sign-in-with-apple/
