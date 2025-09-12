'use client';

import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
// Reuse the exact same styles as signup to match UI 1:1
import styles from '../signup/page.module.css';
import PrimaryButton from '@/components/PrimaryButton';
import SecondaryButton from '@/components/SecondaryButton';
import { db } from '@/lib/firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { signInWithGoogle, signInWithApple, signInWithEmail } = useAuth();
  const { user, isAdmin, loading: adminLoading } = useAdmin();
  const [docData, setDocData] = useState<any>(null);
  const [docExists, setDocExists] = useState<boolean>(false);
  const debug = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG_ADMIN === '1';

  // Redirect admins to /admin
  useEffect(() => {
    if (!adminLoading && user && isAdmin) {
      router.replace('/admin');
    }
  }, [adminLoading, user, isAdmin, router]);

  // If a non-admin signs in, sign them out and show an error
  useEffect(() => {
    if (!adminLoading && user && !isAdmin) {
      signOut(auth);
      setError('Access restricted: Admins only');
    }
  }, [adminLoading, user, isAdmin]);

  const onGoogle = async () => {
    setError('');
    try {
      await signInWithGoogle();
      // useAdmin effect will handle routing or sign-out
    } catch (e: any) {
      setError(e?.message || 'Google sign-in failed');
    }
  };

  // Debug: live-subscribe to users/{uid} when enabled
  useEffect(() => {
    if (!debug || !user?.uid) {
      setDocData(null);
      setDocExists(false);
      return;
    }
    const ref = doc(db, 'users', user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      setDocExists(snap.exists());
      setDocData(snap.exists() ? snap.data() : null);
    });
    return () => unsub();
  }, [debug, user?.uid]);

  const onApple = async () => {
    setError('');
    try {
      await signInWithApple();
    } catch (e: any) {
      setError(e?.message || 'Apple sign-in failed');
    }
  };

  // Temporarily enable email/password login
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmail(email, password);
      // useAdmin effect handles redirect/sign-out based on admin status
    } catch (error: any) {
      const code = error?.code as string | undefined;
      let msg = 'Login failed. Please try again.';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') msg = 'Invalid email or password.';
      else if (code === 'auth/user-not-found') msg = 'No account found with this email.';
      else if (code === 'auth/too-many-requests') msg = 'Too many attempts. Please wait and try again later.';
      else if (code === 'auth/network-request-failed') msg = 'Network error. Check your connection and try again.';
      setError(msg);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Sign in</h1>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Email address*"
              />
            </div>
          </div>
          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password*"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className={styles.passwordToggle}>
                <Image src={showPassword ? "/assets/eye-slash_icon.png" : "/assets/eye.png"} alt="Toggle password visibility" width={20} height={20} />
              </button>
            </div>
          </div>
          {/* Hidden submit for Enter key */}
          <button type="submit" style={{ display: 'none' }} />
        </form>

        {error && (
          <div style={{ color: '#b91c1c', background: '#fee2e2', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
            {error}
          </div>
        )}
        <PrimaryButton onClick={handleLogin} type="submit" fullWidth>
          {submitting ? 'Please wait…' : 'Continue'}
        </PrimaryButton>

        <div className={styles.divider}>or</div>

        <div className={styles.socialLogins}>
          <SecondaryButton provider="apple" onClick={onApple} />
          <SecondaryButton provider="google" onClick={onGoogle} />
        </div>

        <p className={styles.legalText}>
          By continuing, you agree to Sproutbook’s{' '}
          <Link href="/terms">Terms of use</Link> and{' '}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>

        {debug && (
          <div style={{ marginTop: 16, padding: 12, border: '1px dashed #9ca3af', borderRadius: 8, background: '#f9fafb', color: '#111827' }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Admin Debug</div>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 12 }}>
{JSON.stringify({
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  authUser: user ? { uid: user.uid, email: user.email } : null,
  admin: { isAdmin, adminLoading },
  usersDoc: { exists: docExists, role: docData?.role, isAdmin: docData?.isAdmin, email: docData?.email, name: docData?.name },
  computedRoleFlag: !!(docData?.role === 'admin' || docData?.isAdmin === true)
}, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
