# Web Stripe Troubleshooting

This guide explains the error shown on the Pricing page:

> Billing is not configured. Missing Stripe price ID.

## What this means
The Pricing page reads your Stripe Price IDs from environment variables and chooses one when you click **Continue to Checkout**:
- `NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID`
- `NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID`

If either is missing (or empty), the page cannot start a Stripe Checkout Session and shows that error. This is unrelated to the Stripe webhook events you selected.

Source: `sproutbook-web/src/app/(auth)/pricing/page.tsx` checks the selected plan and throws this error if the priceId is falsy before calling the backend.

## How to fix (Local dev)
1) Create a `.env.local` file in `sproutbook-web/` with your Firebase + Stripe variables:

```
# Firebase (example)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sproutbook-d0c8f
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com

# Stripe price IDs (from Stripe → Products → your prices)
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_XXXX_month
NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=price_YYYY_year
```

2) Restart your Next.js dev server after adding/changing `.env.local` (Next reads env at build/start).

## How to fix (Vercel)
1) Go to Vercel → Project → Settings → Environment Variables.
2) Add the two variables (for the correct Environment: Preview/Production):
- `NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_XXXX_month`
- `NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=price_YYYY_year`
3) Trigger a redeploy so the new env vars are included in the build.

## Where to find the Price IDs in Stripe
- Stripe Dashboard → Products → select your product → Prices → copy the ID (starts with `price_`).
- Use the recurring Monthly ID for `NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID`.
- Use the recurring Yearly ID for `NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID`.

## Related backend requirements
These are separate from the error, but required for the full flow:
- Functions Secret: `STRIPE_SECRET_KEY` must be set (Test or Live) so backend can call Stripe.
- Deploy functions:
  - `getStripePrices` (dynamic display): returns public-safe amounts for your Price IDs
  - `createStripeCheckoutSession` (checkout): creates the Stripe Checkout Session

Example deploy:
```
firebase deploy --only functions:getStripePrices,functions:createStripeCheckoutSession --project sproutbook-d0c8f
```

## Quick checklist
- [ ] I have created the two Stripe Prices (Monthly + Yearly) in Stripe Products.
- [ ] I copied their IDs into env vars (local `.env.local` or Vercel env).
- [ ] I restarted dev or redeployed Vercel after setting env.
- [ ] I set `STRIPE_SECRET_KEY` in Firebase Functions Secrets and deployed backend.

## FAQ
- Do I need to change the webhook to fetch prices? No. Price fetching uses the `getStripePrices` function with your Stripe secret key; webhooks are only for subscription lifecycle updates.
- I changed env vars but still see the error. Did you restart the Next.js dev server (local) or redeploy (Vercel)? Next only reads env at build/start.
- Can I use only Monthly (or only Yearly)? Yes, set the one you need. The button will fail if the selected plan’s ID is missing.
