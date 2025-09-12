import { auth } from '@/lib/firebase/config';

const REGION = 'us-central1';
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

function getBaseUrl() {
  if (!PROJECT_ID) throw new Error('Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  return `https://${REGION}-${PROJECT_ID}.cloudfunctions.net`;
}

async function getIdToken(): Promise<string> {
  const u = auth.currentUser;
  if (!u) throw new Error('Not signed in');
  return u.getIdToken(true);
}

async function post<T>(path: string, body: any): Promise<T> {
  const token = await getIdToken();
  const res = await fetch(`${getBaseUrl()}/${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body ?? {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

// Admin role management
export async function adminSetAdminRole(params: { targetUid: string; makeAdmin: boolean }): Promise<{ success: boolean; targetUid: string; admin: boolean }> {
  return post('adminSetAdminRole', params);
}

// Promo code management
export type CreatePromoPayload = {
  code?: string;
  type?: 'promo' | 'gift';
  compDays?: number;
  maxUses?: number | null;
  validFrom?: string; // ISO date
  validUntil?: string; // ISO date
  isActive?: boolean;
};

export async function adminCreatePromoCode(payload: CreatePromoPayload): Promise<{ success: boolean; id: string; code: string }> {
  return post('adminCreatePromoCode', payload);
}

export async function adminDisablePromoCode(code: string): Promise<{ success: boolean; code: string }> {
  return post('adminDisablePromoCode', { code });
}

// Moderation
export type AdminModerationAction =
  | 'approve'
  | 'remove'
  | 'ban-user'
  | 'mark-reviewed'
  | 'mark-resolved';

export async function adminModerationAction(params: {
  reportId: string;
  action: AdminModerationAction;
  notes?: string;
}): Promise<{ success: boolean; reportId: string; action: AdminModerationAction }> {
  return post('adminModerationAction', params);
}
