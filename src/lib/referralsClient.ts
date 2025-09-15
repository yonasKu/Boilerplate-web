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
