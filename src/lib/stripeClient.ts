import { auth } from '@/lib/firebase/config';

const REGION = 'us-central1';
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

function getBaseUrl() {
  if (!PROJECT_ID) throw new Error('Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  return `https://${REGION}-${PROJECT_ID}.cloudfunctions.net`;
}

export type StripePublicPrice = {
  id: string;
  currency: string;
  unit_amount: number; // in minor units (e.g., cents)
  interval: 'month' | 'year' | null;
  interval_count: number;
  nickname: string | null;
};

export async function fetchStripePrices(priceIds: string[]): Promise<Record<string, StripePublicPrice | null>> {
  const res = await fetch(`${getBaseUrl()}/getStripePrices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceIds }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return (data?.prices ?? {}) as Record<string, StripePublicPrice | null>;
}

export async function startCheckout(priceId: string, opts?: { successUrl?: string; cancelUrl?: string }) {
  const u = auth.currentUser;
  if (!u) throw new Error('You must be signed in');
  const token = await u.getIdToken(true);
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const successUrl = opts?.successUrl || (origin ? `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}` : undefined);
  const cancelUrl = opts?.cancelUrl || (origin ? `${origin}/pricing` : undefined);

  const res = await fetch(`${getBaseUrl()}/createStripeCheckoutSession`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ priceId, uid: u.uid, successUrl, cancelUrl }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  if (!data?.url) throw new Error('No checkout URL returned');
  window.location.href = data.url as string;
}
