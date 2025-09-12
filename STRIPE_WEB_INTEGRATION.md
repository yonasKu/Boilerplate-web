# Stripe Web Integration Guide

This document describes how to integrate Stripe for web subscriptions in Sproutbook with Next.js + Firebase.

## Goals
- Centralize subscription state in Firestore at `users/{uid}.subscription`.
- Use Stripe Checkout and Customer Portal for purchase/management.
- Update Firestore only from trusted server (Firebase Functions via webhooks).
- Keep client simple: call endpoints, redirect to Stripe, react to Firestore changes.

## Recommendation: When to create the user doc
- Create `users/{uid}` immediately at signup (as implemented in `src/hooks/useAuth.ts::signUp`).
- Initialize minimal subscription state, e.g. `{ plan: 'trial', status: 'active', startDate: now }` or `{ plan: 'none', status: 'inactive' }` if you don’t use trials.
- Never delay user doc creation until after payment. The UI (`useSubscription`) and onboarding rely on this document. Stripe metadata also links to `uid`.
- Update subscription fields after payment via Stripe webhooks (server-side).

## Data Model (Firestore)
- Doc: `users/{uid}`
  - subscription:
    - plan: 'trial' | 'monthly' | 'annual' | 'none'
    - status: 'active' | 'trial' | 'cancelled' | 'expired' | 'incomplete' | 'past_due'
    - startDate: Timestamp
    - trialEndDate: Timestamp (optional but recommended)
    - currentPeriodEnd: Timestamp (from Stripe)
    - stripeCustomerId: string
    - stripeSubscriptionId: string
    - priceId: string (e.g. `price_...`)
  - other fields unchanged (name, email, onboarded, children, etc.)
- Optional subcollections:
  - `users/{uid}/subscriptions/{stripeSubscriptionId}` (raw Stripe payload snapshot)
  - `users/{uid}/payments/{paymentIntentId}`

## Environment Variables
Set these in your Functions and Web envs. Do NOT expose secrets in client.
- Functions (.env or config):
  - STRIPE_SECRET_KEY
  - STRIPE_WEBHOOK_SECRET
- Web (.env):
  - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  - NEXT_PUBLIC_API_BASE (if calling Functions HTTPS endpoints)

## Dependencies
- Web: `@stripe/stripe-js`
- Server (Functions): `stripe`

```
npm i @stripe/stripe-js
# in functions/
npm i stripe
```

## Backend: Firebase Functions (Recommended)
Implement HTTPS endpoints and webhooks in `functions/` to share logic across mobile and web.

Suggested files:
- `functions/functions/http/stripeCheckout.js`:
  - POST `/createCheckoutSession`
    - Body: `{ priceId, successUrl, cancelUrl }`
    - Create/find Stripe Customer for `uid` (from Firebase Auth via ID token or callable context).
    - Create Checkout Session (mode=subscription) with `client_reference_id=uid`, store `uid` and `priceId` in `metadata`.
    - Return `session.url`.
  - POST `/createPortalSession`
    - Body: `{ returnUrl }`
    - Create portal session for customer.
- `functions/functions/http/stripeWebhook.js`:
  - Verify signature with `STRIPE_WEBHOOK_SECRET`.
  - Handle events:
    - `checkout.session.completed`: fetch subscription, map fields, update `users/{uid}.subscription`.
    - `customer.subscription.updated` / `deleted`: update status, `current_period_end`, `price`, etc.
    - Optional: `invoice.payment_failed`, `customer.subscription.trial_will_end` for email/notification.
  - Use idempotency with `event.id` (store processed IDs, skip duplicates).

Mapping example (server-side):
- Stripe `status` -> Firestore `subscription.status`:
  - active -> active
  - trialing -> trial
  - past_due -> past_due
  - canceled -> cancelled
  - incomplete/incomplete_expired -> incompete/expired
- Set `currentPeriodEnd` from `subscription.current_period_end` (unix).

## Frontend Flow (Web)
- On `src/app/(auth)/pricing/page.tsx` or equivalent:
  - When user clicks “Pay”, POST to Functions endpoint `/createCheckoutSession` with chosen `priceId` and success/cancel URLs.
  - Redirect browser to the returned `session.url`.
  - After success, Stripe redirects to `successUrl`.
- Do NOT trust `successUrl` to set active status. Wait for Firestore `users/{uid}.subscription.status` to become `active`/`trial` via your `useSubscription()` listener.
- Manage billing: Call `/createPortalSession` and redirect to portal URL.

## Security Notes
- Authenticate client requests to Functions using Firebase Auth (ID token). Reject unauthenticated.
- Never write subscription state from the client. Only webhooks/Functions update it.
- Use Stripe webhooks to drive truth. Ensure signature verification and idempotency.

## Testing Locally
- Install Stripe CLI: https://stripe.com/docs/stripe-cli
- In Functions dev, run:
```
stripe login
stripe listen --forward-to localhost:5001/YOUR-PROJECT/us-central1/stripeWebhook
```
- Create a test session from your web UI and complete payment with test cards.
- Inspect Firestore updates under `users/{uid}.subscription`.

## RevenueCat Parity
- Mobile may use RevenueCat. For web, Stripe is primary.
- Keep Firestore as the unified source of truth for entitlement checks.
- Your app reads `users/{uid}.subscription.status` agnostically.
- If you later connect Stripe to RevenueCat (optional), continue driving Firestore via a single pipeline to avoid double-writes.

## Rollout Checklist
- [ ] Prices created in Stripe dashboard (monthly/annual) with IDs captured.
- [ ] Functions endpoints deployed and protected.
- [ ] Webhook endpoint live and verified.
- [ ] Web pricing page wired to call `/createCheckoutSession`.
- [ ] Success/Cancel URLs configured.
- [ ] Portal link wired to `/createPortalSession`.
- [ ] Firestore security rules ensure only server updates `subscription` fields.
- [ ] QA plan with test cards and edge cases (cancellations, renewals, past_due).
