# Stripe Keys and Wallets Setup (Web)

This guide explains how to obtain all required Stripe keys/secrets, create products/prices, and enable Apple Pay & Google Pay for the Sproutbook web app. Use this as a checklist when preparing staging/production.

## Overview
- Primary flow: Stripe Checkout Session for subscriptions (recommended to ship first).
- Optional enhancement: Payment Request Button (Apple Pay/Google Pay) on your Pricing page once the domain is verified and wallets are enabled.
- Firestore remains the source of truth (updated by webhooks in Firebase Functions).

## Accounts and Modes
- Stripe has two modes: Test and Live.
- Keys, products, and webhooks are separate per mode. Always start in Test mode.

## Required Credentials and Where to Find Them
1. Publishable key (Web)
   - Stripe Dashboard → Developers → API keys → Publishable key
   - Maps to: `sproutbook-web/.env` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

2. Secret key (Functions)
   - Stripe Dashboard → Developers → API keys → Secret key (test or live)
   - Maps to Functions runtime env: `STRIPE_SECRET_KEY`

3. Webhook signing secret (Functions)
   - Stripe Dashboard → Developers → Webhooks → Select your endpoint → Signing secret
   - Maps to Functions runtime env: `STRIPE_WEBHOOK_SECRET`

4. Product & Price IDs (for subscriptions)
   - Stripe Dashboard → Products → New → Add recurring prices (Monthly, Annual)
   - Copy the generated Price IDs (e.g., `price_123`) for Checkout sessions
   - Store in your Functions config or code constants (never expose logic-only secrets in the client)

## Creating Products and Prices
1. Go to Dashboard → Products → Add product
2. Name: "Sproutbook Annual" (example) → Pricing: Recurring → Yearly → Amount (e.g., $48.00)
3. Create another: "Sproutbook Monthly" → Recurring → Monthly → Amount (e.g., $5.99)
4. Save, then copy `price_...` IDs from Pricing section.

## Environment Variables Mapping
- Web (public):
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `NEXT_PUBLIC_API_BASE` (if you call Functions HTTPS endpoints from client)
- Functions (server):
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`

Never commit real secrets to git. Use `.env` locally and deployment provider secrets in prod.

## Webhooks (Server → Firestore updates)
- In Stripe Dashboard → Developers → Webhooks → Add endpoint:
  - URL: your deployed Functions webhook URL (e.g., `https://us-central1-YOUR-PROJECT.cloudfunctions.net/stripeWebhook`)
  - Events to send:
    - `checkout.session.completed`
    - `customer.subscription.created`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
    - Optionally: `invoice.payment_failed`, `customer.subscription.trial_will_end`
- After creating, copy the Signing secret → set `STRIPE_WEBHOOK_SECRET` in Functions.

Local testing (Stripe CLI):
```
stripe login
stripe listen --forward-to localhost:5001/YOUR-PROJECT/us-central1/stripeWebhook
```

## Apple Pay (Web) Setup
Apple Pay requires domain verification with Stripe and hosting a verification file.

1. Enable Apple Pay in Stripe
   - Dashboard → Settings → Payments → Payment methods → Apple Pay → Set up
2. Add your production domain (e.g., `app.sproutbook.com`)
3. Download the `apple-developer-merchantid-domain-association` file from Stripe
4. Host it at `/.well-known/apple-developer-merchantid-domain-association` on your domain
   - In Next.js, place file at `sproutbook-web/public/.well-known/apple-developer-merchantid-domain-association`
   - Ensure it serves exactly at the path, no redirects, correct content-type (text/plain is fine)
5. Click Verify in Stripe once deployed
6. In your frontend, use Stripe’s Payment Request Button (later): it will show Apple Pay automatically in Safari when available

Notes:
- Apple Pay generally requires HTTPS and Safari with Apple Pay configured on the device.
- Apple Pay testing on desktop requires macOS + Safari + Wallet setup.

## Google Pay (Web) Setup
Google Pay via Stripe’s Payment Request Button shows automatically on supported browsers (Chrome/Android) when conditions are met.

1. Enable Google Pay in Stripe
   - Dashboard → Settings → Payments → Payment methods → Google Pay → Enable
2. No domain verification is typically required for GPay via Stripe
3. When you use the Stripe Payment Request Button, it renders a Google Pay button if the browser/device supports it
4. For unsupported environments, the button may fallback to browser-saved cards or be hidden

## Aligning the Pricing Page UI
- Near term (ship first): Use Stripe Checkout Session
  - Your button can read “Continue to Pay” (we’ll route to Stripe Checkout)
  - Users will pick card/wallet within Stripe Checkout as available
- Later (optional): Add Stripe Payment Request Button (PRB) alongside your plan selector
  - PRB will show Apple Pay/Google Pay when eligible; otherwise fallback or hide
  - Keep your current Google/Apple icons for design; wire them to PRB logic instead of custom handlers

## Quick Checklist
- [ ] Test mode keys copied: Publishable + Secret
- [ ] Webhook endpoint created and Signing secret saved
- [ ] Products and recurring Prices created; Price IDs captured
- [ ] Functions deployed: Checkout + Portal + Webhook
- [ ] Apple Pay domain file deployed and verified for production domain
- [ ] Google Pay enabled in Stripe payment methods
- [ ] Web uses Checkout first; PRB planned for later
- [ ] Firestore updates observed on subscription events

## Where to Put Files
- Verification file: `sproutbook-web/public/.well-known/apple-developer-merchantid-domain-association`
- Docs:
  - `sproutbook-web/STRIPE_WEB_INTEGRATION.md` (architecture + flows)
  - `sproutbook-web/STRIPE_KEYS_AND_WALLETS_SETUP.md` (this file)
