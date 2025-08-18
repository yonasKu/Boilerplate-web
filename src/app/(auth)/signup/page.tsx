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
  const { signUp, signInWithGoogle, signInWithApple } = useAuth();
  const router = useRouter();

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await signUp(email, password, name);
      router.push('/home');
    } catch (error) {
      console.error('Sign up failed:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.push('/home');
    } catch (error) {
      console.error('Google sign in failed:', error);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      await signInWithApple();
      router.push('/home');
    } catch (error) {
      console.error('Apple sign in failed:', error);
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
        <PrimaryButton onClick={handleSignUp} type="submit" fullWidth>
          Continue
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
