import { useState, useEffect } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  updateProfile, 
  signInWithEmailAndPassword,
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  OAuthProvider
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    setLoading(false);
    return unsubscribe;
  }, []);

  // Handle redirect results (do not create Firestore documents here)
  useEffect(() => {
    const handleRedirectResult = async () => {
      console.log('Checking for redirect result...');
      try {
        const result = await getRedirectResult(auth);
        console.log('Redirect result:', result);
        // Intentionally no Firestore writes here. User doc is created only after email verification.
      } catch (error: any) {
        console.error('Error processing redirect result:', error);
      }
    };

    handleRedirectResult();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update display name
    await updateProfile(result.user, { displayName: name });
    
    // Send verification email
    await sendEmailVerification(result.user);
    
    return result.user;
  };

  // Temporary email/password login for web admin
  const signInWithEmail = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    
    try {
      // Try popup first, fallback to redirect if it fails
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user) {
        throw new Error('No user returned from Google sign-in');
      }

      // Google provider emails are verified by Google, safe to create user doc immediately
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          const name = user.displayName || (user.email ? user.email.split('@')[0] : 'User');
          await setDoc(userDocRef, {
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
      } catch (e) {
        console.error('Failed to ensure user doc for Google sign-in:', e);
      }
      return { isNewUser: undefined, user };
    } catch (error: any) {
      // Handle popup-closed error specifically, as it's a user action, not a failure.
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        console.log('Popup closed by user, falling back to redirect.');
        // Fallback to redirect
        await signInWithRedirect(auth, provider);
        // Return a promise that never resolves to prevent further state changes in the UI
        return new Promise(() => {});
      }

      console.error('Error during Google sign-in:', error);

      if (error.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized for Google sign-in');
      }

      throw new Error('Google sign-in failed. Please try again.');
    }
  };

  const signInWithApple = async () => {
    const provider = new OAuthProvider('apple.com');
    
    try {
      // Try popup first, fallback to redirect if it fails
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user) {
        throw new Error('No user returned from Apple sign-in');
      }

      // Apple provider emails are verified by Apple (may be private relay). Create user doc immediately.
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          const name = user.displayName || (user.email ? user.email.split('@')[0] : 'User');
          await setDoc(userDocRef, {
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
      } catch (e) {
        console.error('Failed to ensure user doc for Apple sign-in:', e);
      }
      return { isNewUser: undefined, user };
    } catch (error: any) {
      // Handle popup-closed error specifically, as it's a user action, not a failure.
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        console.log('Popup closed by user, falling back to redirect.');
        // Fallback to redirect
        await signInWithRedirect(auth, provider);
        // Return a promise that never resolves to prevent further state changes in the UI
        return new Promise(() => {});
      }

      console.error('Error during Apple sign-in:', error);

      if (error.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized for Apple sign-in');
      }

      throw new Error('Apple sign-in failed. Please try again.');
    }
  };

  return { user, loading, signUp, signInWithEmail, signInWithGoogle, signInWithApple };
};
