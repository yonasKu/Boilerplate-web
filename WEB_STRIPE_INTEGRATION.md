# Web Subscriptions with Stripe (Next.js + Firebase)

This document shows how to let users create accounts and subscribe on the web using Stripe, while keeping subscription state authoritative on the backend (Firestore via webhooks). It complements the existing mobile flow (RevenueCat) without conflict.

- Mobile (iOS/Android): RevenueCat handles App Store/Play Store purchases.
- Web: Stripe handles card/Apple Pay/Google Pay.
- Backend: Firestore `users/{uid}.subscription` is the single source of truth, updated by webhooks (Stripe or RevenueCat). Clients never write subscription status directly.

## Architecture
- Next.js (Vercel):
  - UI pages: `/pricing`, `/checkout`, `/billing` (optional)
  - API route to create Checkout sessions: `/api/stripe/create-checkout-session`
  - Uses publishable key only on the client
- Firebase Functions:
  - `stripeWebhook` to process events and update `users/{uid}.subscription`
  - Stores Stripe webhook signing secret in Secret Manager

You can also move the Checkout session creation to Firebase Functions if you prefer one backend. The flow and env management remain the same.

## Stripe dashboard setup
1) Create products and prices
- Product: Sproutbook Premium
  - Price A: monthly, recurring (e.g., USD 5.99)
  - Price B: yearly, recurring (e.g., USD 48.99)
- Save the Price IDs (e.g., `price_123_monthly`, `price_456_yearly`) for use in the web app.

2) Webhook
- Add endpoint (Test mode first):
  - URL (Firebase Functions): `https://us-central1-<PROJECT_ID>.cloudfunctions.net/stripeWebhook`
  - Events to listen:
    - `checkout.session.completed`
    - `customer.subscription.created`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
    - `invoice.payment_succeeded`
    - `invoice.payment_failed`
- Copy the Signing secret (starts with `whsec_...`) and store it as a Firebase Functions secret: `STRIPE_WEBHOOK_SECRET`.

3) Customer Portal (optional)
- Enable Stripe Billing customer portal for self-serve upgrades/cancellations.
- You can create a function or an API route to generate a portal session and redirect users there.

## Environment variables

Add the following (values differ in Test vs Production):

Vercel (Next.js project → Settings → Environment Variables)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_test_... / pk_live_...)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- For serverless API route on Vercel (server-side only):
  - `STRIPE_SECRET_KEY` (sk_test_... / sk_live_...) — DO NOT prefix with NEXT_PUBLIC

Firebase Functions (Secrets via Secret Manager)
- `STRIPE_WEBHOOK_SECRET` (from Stripe Webhooks → Signing secret)
- Optionally `STRIPE_SECRET_KEY` if you choose to create Checkout sessions in Functions instead of Next.js API.

NEVER put secret keys under `NEXT_PUBLIC_`. Those are client-visible.

## Data model (Firestore)
Normalize Stripe events into a shape consistent with RevenueCat updates. Example:

```
users/{uid}.subscription = {
  status: 'active' | 'trial' | 'inactive' | 'cancelled',
  plan: 'pro_monthly' | 'pro_yearly',
  productId: 'price_123',
  platform: 'stripe',
  willRenew: true | false | null,
  expirationDate: Timestamp | null,
  originalPurchaseDate: Timestamp | null,
  updatedAt: serverTimestamp(),
}
```

Notes:
- When `checkout.session.completed` lands, mark the subscription as active once the underlying subscription is created.
- Prefer to use `customer.subscription.*` events for the true lifecycle and renewal state.

## Frontend flow (Next.js)
1) Pricing page (`/pricing`)
- User selects plan (monthly/yearly)
- Click Continue → calls `/api/stripe/create-checkout-session` with the chosen `priceId`
- Server returns a Checkout URL → redirect the browser to Stripe

2) Return URLs
- success_url: `https://<your-domain>/checkout/success?session_id={CHECKOUT_SESSION_ID}`
- cancel_url: `https://<your-domain>/pricing`

3) Success page (`/checkout/success`)
- Show a success state. Do NOT trust client to set subscription. Await webhook to actually flip the Firestore state.

## Sample endpoints (skeletons)

Option A — Next.js API route (Vercel)
- File: `sproutbook-web/src/app/api/stripe/create-checkout-session/route.ts`
- Server-side only, uses `STRIPE_SECRET_KEY`

```ts
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export async function POST(req: NextRequest) {
  try {
    const { priceId, uid } = await req.json();
    if (!priceId || !uid) return NextResponse.json({ error: 'Missing priceId or uid' }, { status: 400 });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
      client_reference_id: uid,
      customer_email: undefined, // optional; use if you want Stripe to prefill from auth
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (e: any) {
    console.error('create-checkout-session error', e);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
```

Option B — Firebase Function (if you prefer one backend)
- Create `functions/functions/createStripeCheckoutSession.js`
- Use `STRIPE_SECRET_KEY` via Functions Secrets
- Return the `session.url`

## Webhook (Firebase Functions)
Create `functions/functions/stripeWebhook.js` that:
- Verifies the Stripe signature using `STRIPE_WEBHOOK_SECRET`
- Parses events and updates `users/{uid}.subscription` to the normalized shape
- Uses `client_reference_id` (or `metadata.uid`) from the checkout session / subscription to link back to the user

Events to handle:
- `checkout.session.completed` — store a pending/active state
- `customer.subscription.created/updated/deleted` — the authoritative lifecycle
- `invoice.payment_succeeded/payment_failed` — optional UI signals

## UI hooks/services (web)
Create a small client service to call the API route and redirect:
- File: `sproutbook-web/src/services/stripeService.ts`
  - `createCheckoutSession({ priceId, uid }): Promise<string /* url */>`
  - Fetch `POST /api/stripe/create-checkout-session`
  - Redirect window.location to returned URL

Optional helper hook:
- `useStripeCheckout(plan: 'monthly' | 'yearly')` to encapsulate button handling

## Testing checklist
- Stripe Test mode: create test products/prices, use test cards (4242 4242 4242 4242)
- Confirm Checkout redirects and returns to `/checkout/success`
- Verify webhook updates `users/{uid}.subscription`
- Check Firestore rules: ensure only backend can update `subscription` fields
- Try promo codes and cancellation from the Stripe Customer Portal (if enabled)

## Going live
- Create Live products/prices and switch keys/secrets to Live in Vercel and Functions
- Add production domain in success/cancel URLs and in Firebase Auth authorized domains
- Keep RevenueCat for mobile; both flows update the same Firestore field via their own webhooks

---

If you want, I can scaffold the API route and the Firebase webhook file next, and add the minimal UI glue on `/pricing` to start a Checkout session.
