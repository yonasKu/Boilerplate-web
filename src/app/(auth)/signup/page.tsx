'use client';

import { useState } from 'react';
import { X, Sprout, EyeOff } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import styles from './page.module.css';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signUp(email, password, name);
      router.push('/verify-email');
    } catch (error: any) {
      let userMessage = 'Unable to create account. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          userMessage = 'This email is already registered. Try signing in instead.';
          break;
        case 'auth/invalid-email':
          userMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          userMessage = 'Password should be at least 6 characters long.';
          break;
        case 'auth/network-request-failed':
          userMessage = 'Network error. Please check your connection and try again.';
          break;
        default:
          userMessage = error.message || 'Something went wrong. Please try again.';
      }
      
      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithGoogle();
      
      // If redirect is used, result will have user: null
      if (result.user === null) {
        // Redirect is in progress, let it complete
        return;
      }
      
      if (result.isNewUser) {
        router.push('/pricing');
      } else {
        router.push('/download');
      }
    } catch (error: any) {
      let userMessage = 'Unable to sign in with Google. Please try again.';
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          userMessage = 'Sign-in was cancelled. Please try again.';
          break;
        case 'auth/cancelled-popup-request':
          userMessage = 'Sign-in was cancelled. Please try again.';
          break;
        case 'auth/network-request-failed':
          userMessage = 'Network error. Please check your connection and try again.';
          break;
        case 'auth/unauthorized-domain':
          userMessage = 'This domain is not authorized for Google sign-in.';
          break;
        default:
          userMessage = error.message || 'Google sign-in failed. Please try again.';
      }
      
      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>


      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Create your account</h1>

          <div className={styles.socialButtons}>
            <button className={styles.socialButton} onClick={handleGoogleSignIn} disabled={loading}>
              <Image src="/assets/Google.png" alt="Google" width={20} height={20} style={{ width: 'auto', height: 'auto' }} />
              <span>Google</span>
            </button>
            <button className={styles.socialButton}>
              <Image src="/assets/Apple.png" alt="Apple" width={20} height={20} style={{ width: 'auto', height: 'auto' }} />
              <span>Apple</span>
            </button>
          </div>

          <div className={styles.separator}>Or</div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}
            
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>Name*</label>
              <div className={styles.inputContainer}>
                <Image src="/assets/user.png" alt="Full Name" width={20} height={20} className={styles.inputIcon} />
                <input 
                  id="name" 
                  name="name" 
                  type="text" 
                  placeholder="Name" 
                  className={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>Email*</label>
              <div className={styles.inputContainer}>
                <Image src="/assets/sms.png" alt="Email" width={20} height={20} className={styles.inputIcon} />
                <input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="Email" 
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>Password*</label>
              <div className={styles.inputContainer}>
                <Image src="/assets/password-check.png" alt="Password" width={20} height={20} className={styles.inputIcon} />
                <input 
                  id="password" 
                  name="password" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Password" 
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className={styles.passwordToggle} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} /> : <Image src="/assets/eye.png" alt="Show password" width={20} height={20} />}
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className={styles.footer}>
            <p className={styles.terms}>
              By clicking continue you agree to our <Link href="/terms">Terms of Use</Link> and <Link href="/privacy">Privacy Policy</Link>
            </p>
            <p className={styles.signIn}>
              Already have an account? <Link href="/login">Sign In</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
