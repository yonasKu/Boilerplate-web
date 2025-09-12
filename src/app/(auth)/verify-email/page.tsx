'use client';

import { useState, useEffect } from 'react';
import { Check, Mail, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase/config';
import { sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import styles from './page.module.css';

export default function VerifyEmailPage() {
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkVerification = async () => {
      const user = auth.currentUser;
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          // Ensure Firestore user doc exists with schema required by firestore.rules
          try {
            const userRef = doc(db, 'users', user.uid);
            const snap = await getDoc(userRef);
            if (!snap.exists()) {
              const name = user.displayName || (user.email ? user.email.split('@')[0] : 'User');
              await setDoc(userRef, {
                name,
                email: user.email,
                onboarded: false,
                lifestage: null,
                subscription: {
                  plan: 'trial',
                  status: 'trial',
                  startDate: new Date(),
                },
                children: [],
                createdAt: new Date(),
              });
            }
            setVerified(true);
            setTimeout(() => {
              router.push('/pricing');
            }, 1500);
          } catch (error) {
            console.error('Error saving user to Firestore:', error);
            setMessage('You are verified, but we could not complete account setup. Please reload or try again.');
          }
        }
      }
      setLoading(false);
    };

    checkVerification();
    const interval = setInterval(checkVerification, 3000);
    return () => clearInterval(interval);
  }, [router]);

  const resendEmail = async () => {
    setLoading(true);
    setMessage('');
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        setMessage('Verification email sent! Check your inbox.');
      }
    } catch (error: any) {
      let userMessage = 'Failed to send verification email.';
      
      switch (error.code) {
        case 'auth/too-many-requests':
          userMessage = 'Too many requests. Please wait a few minutes and try again.';
          break;
        case 'auth/network-request-failed':
          userMessage = 'Network error. Please check your connection.';
          break;
        default:
          userMessage = 'Unable to send email. Please try again.';
      }
      
      setMessage(userMessage);
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <div className={styles.successCard}>
            <Check className={styles.successIcon} />
            <h1 className={styles.successTitle}>Email Verified!</h1>
            <p className={styles.successText}>
              Your email has been successfully verified. Redirecting to pricing...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.iconWrapper}>
            <Mail className={styles.icon} />
          </div>
          
          <h1 className={styles.title}>Verify Your Email</h1>
          
          <p className={styles.description}>
            We've sent a verification email to your inbox. Please check your email and click the verification link to continue.
          </p>
          
          <div className={styles.status}>
            <RefreshCw className={`${styles.spinner} ${loading ? styles.spinning : ''}`} />
            <span>{loading ? 'Checking verification status...' : 'Waiting for email verification'}</span>
          </div>
          
          {message && (
            <div className={`${styles.message} ${message.includes('Failed') || message.includes('Unable') ? styles.error : styles.success}`}>
              {message}
            </div>
          )}
          
          <button 
            onClick={resendEmail} 
            disabled={loading}
            className={styles.button}
          >
            {loading ? 'Sending...' : 'Resend Verification Email'}
          </button>

          <p className={styles.help}>
            Didn't receive the email? Check your spam folder or try resending.
          </p>
        </div>
      </div>
    </div>
  );
}
