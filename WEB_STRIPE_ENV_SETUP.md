# Web Stripe ENV setup (Firebase Hosting or Local)

Your Pricing page needs two PUBLIC env vars at build time to know which Stripe prices to use:

- `NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID`
- `NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID`

These are client-side build variables for the web app (Next.js). They are different from Firebase Functions Secrets like `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` which are server-only.

Price IDs are not sensitive (they begin with `price_...`).

---

## Local development
1) Create `sproutbook-web/.env.local` with:

```
# Firebase (examples)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sproutbook-d0c8f
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com

# Stripe (public)
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_xxx_month
NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=price_yyy_year
```

2) Restart your Next.js dev server (Next reads env at startup).

---

## Firebase Hosting (production)
If you deploy the web app to Firebase Hosting (not Vercel), you still need these variables available at build time. You have two common options:

### Option A — `.env.production.local`
- Create `sproutbook-web/.env.production.local` with the same keys:

```
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_xxx_month
NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=price_yyy_year
```

- Ensure your CI/build step runs inside `sproutbook-web/` so Next picks them up, e.g.:

```
cd sproutbook-web
npm install
npm run build
firebase deploy --only hosting --project sproutbook-d0c8f
```

### Option B — Set variables in the build environment
- Export the variables in your CI or local shell before `next build`:

On macOS/Linux bash:
```
export NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_xxx_month
export NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=price_yyy_year
npm run build
```

On Windows PowerShell:
```
$env:NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID = 'price_xxx_month'
$env:NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID = 'price_yyy_year'
npm run build
```

Then deploy to Firebase Hosting.

---

## Where to find the Price IDs
Stripe Dashboard → Products → select your product → Prices → copy the ID that starts with `price_`.

- Monthly recurring → `NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID`
- Yearly recurring → `NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID`

---

## Why you saw: “Billing is not configured. Missing Stripe price ID.”
In `sproutbook-web/src/app/(auth)/pricing/page.tsx`, the button checks the selected plan’s Price ID. If it’s missing (env not set at build time), it shows that red error and stops.

This is unrelated to the Stripe webhook. Webhooks handle subscription updates after checkout; they do not supply price IDs to the web client.

---

## Backend reminders (separate)
- Functions Secret `STRIPE_SECRET_KEY` must be set for backend calls to Stripe (Test or Live).
- Deploy the functions you’re using:
```
firebase deploy --only functions:getStripePrices,functions:createStripeCheckoutSession --project sproutbook-d0c8f
```
