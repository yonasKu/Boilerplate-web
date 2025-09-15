# Web Promo Code Integration Guide (Pricing Page)

This guide adds a “Have a code?” promo/referral modal to the web Pricing page and calls the same backend Functions used by the mobile app.

Project: `sproutbook-web/`
Route: `src/app/(auth)/pricing/page.tsx`
Backend endpoints: `functions/functions/http/referrals.js` (redeemPromoCode, processReferral, generateReferralCode, getReferralStats)

Prerequisites
- Ensure Firebase project env variables exist for the web app (Next.js):
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`
- Allow Anonymous Auth in Firebase Console → Authentication → Sign-in method → Anonymous (ON) (used to obtain an ID token before full login, same as mobile).
- Cloud Functions deployed (region `us-central1`): `redeemPromoCode`, `processReferral`, etc.

Step 1 — Create a tiny referrals client for web
File: `sproutbook-web/src/lib/referralsClient.ts`

```ts
import { auth } from './firebase/config';
import { signInAnonymously } from 'firebase/auth';

const buildFunctionUrl = (name: string) => {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error('Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  return `https://us-central1-${projectId}.cloudfunctions.net/${name}`;
};

const getIdTokenOrAnon = async (): Promise<string> => {
  const user = auth.currentUser || (await signInAnonymously(auth)).user;
  return await user.getIdToken();
};

const safeJson = async (resp: Response) => {
  try { return await resp.json(); } catch { return undefined; }
};

export const referralsClient = {
  redeemPromoCode: async (code: string) => {
    const token = await getIdTokenOrAnon();
    const resp = await fetch(buildFunctionUrl('redeemPromoCode'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ code: code.trim().toUpperCase() }),
    });
    if (!resp.ok) {
      const err = await safeJson(resp);
      throw new Error(err?.error || 'Failed to redeem code');
    }
    return await resp.json();
  },

  processReferral: async (code: string) => {
    const token = await getIdTokenOrAnon();
    const resp = await fetch(buildFunctionUrl('processReferral'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ referralCode: code.trim().toUpperCase() }),
    });
    if (!resp.ok) {
      const err = await safeJson(resp);
      throw new Error(err?.error || 'Failed to process referral');
    }
    return await resp.json();
  },
};
```

Step 2 — Add a reusable Promo Code modal
File: `sproutbook-web/src/components/ui/PromoCodeModal.tsx`

```tsx
'use client';
import React from 'react';
import styles from './PromoCodeModal.module.css';
import { referralsClient } from '@/lib/referralsClient';

interface Props {
  open: boolean;
  onClose: () => void;
  onApplied?: (result: any & { code: string }) => void;
}

export default function PromoCodeModal({ open, onClose, onApplied }: Props) {
  const [code, setCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setCode('');
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleApply = async () => {
    if (!code.trim()) return;
    try {
      setLoading(true);
      setError(null);
      // Use redeemPromoCode (covers promo/gifts and pending referrals). You can swap to processReferral if desired.
      const result = await referralsClient.redeemPromoCode(code);
      onApplied?.({ ...result, code: code.trim().toUpperCase() });
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Failed to apply code');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>Have a code?</h3>
        <input
          ref={inputRef}
          className={styles.input}
          placeholder="Enter promo or referral code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={loading}
        />
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose} disabled={loading}>Cancel</button>
          <button className={styles.apply} onClick={handleApply} disabled={loading || !code.trim()}>
            {loading ? 'Applying…' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

File: `sproutbook-web/src/components/ui/PromoCodeModal.module.css` (basic styles)

```css
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  width: 92%;
  max-width: 420px;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}
.title {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 600;
}
.input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
}
.error {
  color: #c62828;
  font-size: 13px;
  margin-top: 8px;
}
.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 14px;
}
.cancel {
  background: #f3f3f3;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  padding: 8px 12px;
}
.apply {
  background: #2F4858;
  color: white;
  border-radius: 8px;
  padding: 8px 12px;
  border: 0;
}
```

Step 3 — Wire into Pricing page
File to edit: `sproutbook-web/src/app/(auth)/pricing/page.tsx`

- Add client-side state, a “Have a code?” button/link, and render `<PromoCodeModal />`.
- On success, show a small banner like “Code applied – free until <date>”.

Pseudo-diff (where appropriate in the component):

```tsx
'use client'
import React from 'react';
import PromoCodeModal from '@/components/ui/PromoCodeModal';

export default function PricingPage() {
  const [showPromo, setShowPromo] = React.useState(false);
  const [applied, setApplied] = React.useState<{ code: string; compUntil?: string; compDays?: number } | null>(null);

  return (
    <div>
      {/* ... existing pricing UI ... */}

      {applied && (
        <div style={{ margin: '10px 0', padding: 10, background: '#E6F4EA', border: '1px solid #C7E8D1', borderRadius: 8 }}>
          Code {applied.code} applied{applied.compUntil ? ` – free until ${new Date(applied.compUntil).toLocaleDateString()}` : ''}
        </div>
      )}

      <button onClick={() => setShowPromo(true)} style={{ marginTop: 8 }}>Have a code?</button>

      <PromoCodeModal
        open={showPromo}
        onClose={() => setShowPromo(false)}
        onApplied={(result) => setApplied(result)}
      />
    </div>
  );
}
```

Notes
- This web client uses the same Function endpoints as mobile and follows the same auth model (anonymous allowed). No extra backend changes are needed.
- Successful redemption updates `users/{uid}.subscription.compUntil` in Firestore. Your existing gating should treat the user as active while `Date.now() < compUntil`.

Testing checklist
- Open `/pricing` → click “Have a code?” → enter a known code.
- Expect a success response and an applied banner.
- Verify Firestore: `users/{uid}.subscription.compUntil` set in the future.
- If you then sign in, ensure the web auth flow links credentials when anonymous (to preserve the UID and comp). If your web flow does a fresh sign-in instead of link, we can adjust it similarly to mobile.

Troubleshooting
- 401 “Missing or invalid Authorization header”: ensure Anonymous auth is enabled; refresh page and try again.
- 412/400 “Invalid or expired code”: verify code exists in `promoCodes` or a pending `referrals` doc matches this user.
- CORS: HTTP v2 onRequest functions are proxied by the Google endpoint and work from browser by default with correct method/headers; no extra CORS config is needed here since we use POST with JSON.
