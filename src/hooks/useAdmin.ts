import { useEffect, useState } from 'react';
import { onAuthStateChanged, getIdTokenResult, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';

export type AdminCheck = {
  user: User | null;
  loading: boolean; // overall loading state for auth + admin check
  isAdmin: boolean;
  error: string | null;
};

// Determines admin via either:
// - Custom claims: token.claims.admin === true
// - Firestore: users/{uid}.role === 'admin' OR users/{uid}.isAdmin === true
export function useAdmin(): AdminCheck {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let docUnsub: (() => void) | null = null;
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setError(null);
      setIsAdmin(false);
      try {
        console.log('[useAdmin] projectId:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
        console.log('[useAdmin] auth user:', u ? { uid: u.uid, email: u.email, provider: u.providerData?.[0]?.providerId } : null);
      } catch {}

      if (!u) {
        setLoading(false);
        if (docUnsub) { docUnsub(); docUnsub = null; }
        return;
      }

      try {
        // 1) Check custom claims first (fast if already minted)
        const token = await getIdTokenResult(u, true);
        try {
          console.log('[useAdmin] custom claims:', token?.claims);
        } catch {}
        if (token?.claims?.admin === true) {
          setIsAdmin(true);
          setLoading(false);
          if (docUnsub) { docUnsub(); docUnsub = null; }
          return;
        }

        // 2) Fallback to Firestore user doc role flags (live subscription)
        const ref = doc(db, 'users', u.uid);
        setLoading(true);
        if (docUnsub) { docUnsub(); }
        docUnsub = onSnapshot(ref, (snap) => {
          try {
            console.log('[useAdmin] users doc exists:', snap.exists());
            if (snap.exists()) {
              const data = snap.data() as any;
              console.log('[useAdmin] users doc data (subset):', { role: data?.role, isAdmin: data?.isAdmin, email: data?.email, name: data?.name });
            }
          } catch {}
          if (!snap.exists()) {
            setIsAdmin(false);
          } else {
            const data = snap.data() as any;
            const roleNormalized = typeof data?.role === 'string' ? data.role.trim().toLowerCase() : data?.role;
            const roleFlag = roleNormalized === 'admin' || data?.isAdmin === true;
            try { console.log('[useAdmin] normalizedRole:', roleNormalized, 'computed roleFlag:', roleFlag); } catch {}
            setIsAdmin(!!roleFlag);
          }
          setLoading(false);
        }, (err) => {
          try { console.error('[useAdmin] snapshot error:', err); } catch {}
          setError(err?.message || 'Failed to check admin permissions');
          setLoading(false);
        });
      } catch (e: any) {
        try { console.error('[useAdmin] admin check error:', e); } catch {}
        setError(e?.message || 'Failed to check admin permissions');
      } finally {
        // loading will be handled by the snapshot above once it fires
      }
    });

    return () => { if (docUnsub) { docUnsub(); } unsubscribe(); };
  }, []);

  return { user, loading, isAdmin, error };
}
