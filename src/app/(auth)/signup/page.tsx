'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import PrimaryButton from '@/components/PrimaryButton';
import SecondaryButton from '@/components/SecondaryButton';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { signUp, signInWithGoogle, signInWithApple } = useAuth();
  const router = useRouter();

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await signUp(email, password, name);
      router.push('/verify-email');
    } catch (error) {
      // Map Firebase error codes to friendly messages
      const code = (error as any)?.code as string | undefined;
      let msg = 'Sign up failed. Please try again.';
      if (code === 'auth/email-already-in-use') msg = 'This email is already in use. Try logging in or use a different email.';
      else if (code === 'auth/invalid-email') msg = 'Please enter a valid email address.';
      else if (code === 'auth/weak-password') msg = 'Password is too weak. Please use at least 6 characters.';
      else if (code === 'auth/network-request-failed') msg = 'Network error. Check your connection and try again.';
      setError(msg);
    }
    finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      router.push('/pricing');
    } catch (error) {
      const code = (error as any)?.code as string | undefined;
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        // Silent: user dismissed popup
        return;
      }
      let msg = 'Google sign in failed. Please try again.';
      if (code === 'auth/unauthorized-domain') msg = 'This domain is not authorized for Google sign-in.';
      else if (code === 'auth/network-request-failed') msg = 'Network error. Check your connection and try again.';
      setError(msg);
    }
    finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithApple();
      router.push('/pricing');
    } catch (error) {
      const code = (error as any)?.code as string | undefined;
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return;
      }
      let msg = 'Apple sign in failed. Please try again.';
      if (code === 'auth/unauthorized-domain') msg = 'This domain is not authorized for Apple sign-in.';
      else if (code === 'auth/network-request-failed') msg = 'Network error. Check your connection and try again.';
      setError(msg);
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Create an account</h1>

        <form onSubmit={handleSignUp} className={styles.form}>
          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Name*"
              />
            </div>
          </div>
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
          {/* This button is hidden but allows form submission on enter */}
          <button type="submit" style={{ display: 'none' }} />
        </form>
        {error && (
          <div style={{ color: '#b91c1c', background: '#fee2e2', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
            {error}
          </div>
        )}
        <PrimaryButton onClick={handleSignUp} type="submit" fullWidth>
          {loading ? 'Please wait…' : 'Continue'}
        </PrimaryButton>

        <div className={styles.divider}>or</div>

        <div className={styles.socialLogins}>
          <SecondaryButton provider="apple" onClick={handleAppleSignIn} />
          <SecondaryButton provider="google" onClick={handleGoogleSignIn} />
        </div>

        {/* <p className={styles.signInText}>
          Already have an account? <Link href="/login">Sign in</Link>
        </p> */}

        <p className={styles.legalText}>
          By continuing, you agree to Sproutbook’s{' '}
          <Link href="/terms">Terms of use</Link> and{' '}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
