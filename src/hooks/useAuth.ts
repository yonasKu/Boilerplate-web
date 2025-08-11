import { useState, useEffect } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  updateProfile, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  OAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    setLoading(false);
    return unsubscribe;
  }, []);

  // Handle redirect results
  useEffect(() => {
    const handleRedirectResult = async () => {
      console.log('Checking for redirect result...');
      try {
        const result = await getRedirectResult(auth);
        console.log('Redirect result:', result);

        if (result && result.user) {
          const user = result.user;
          console.log('User found from redirect:', user.uid);

          try {
            const userDocRef = doc(db, 'users', user.uid);
            console.log('Checking for user document...');
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
              console.log('User document does not exist, creating new one...');
              await setDoc(userDocRef, {
                name: user.displayName,
                email: user.email,
                onboarded: false,
                lifestage: null,
                subscription: {
                  plan: 'trial',
                  status: 'active',
                  startDate: new Date(),
                },
                children: [],
                createdAt: new Date(),
              });
              console.log('User document created successfully.');
            } else {
              console.log('User document already exists.');
            }
          } catch (firestoreError: any) {
            console.error('Firestore error during redirect handling:', firestoreError);
          }
        } else {
          console.log('No redirect result or user found.');
        }
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
    
    // Return user without saving to Firestore yet
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

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            name: user.displayName,
            email: user.email,
            onboarded: false,
            lifestage: null,
            subscription: {
              plan: 'trial',
              status: 'active',
              startDate: new Date(),
            },
            children: [],
            createdAt: new Date(),
          });
          return { isNewUser: true, user };
        }

        return { isNewUser: false, user };
      } catch (firestoreError: any) {
        if (firestoreError.code === 'permission-denied') {
          console.error('Firestore permission denied. Check security rules:', firestoreError);
          throw new Error('Database permission denied. Please contact support.');
        }
        throw firestoreError;
      }
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

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            name: user.displayName,
            email: user.email,
            onboarded: false,
            lifestage: null,
            subscription: {
              plan: 'trial',
              status: 'active',
              startDate: new Date(),
            },
            children: [],
            createdAt: new Date(),
          });
          return { isNewUser: true, user };
        }

        return { isNewUser: false, user };
      } catch (firestoreError: any) {
        if (firestoreError.code === 'permission-denied') {
          console.error('Firestore permission denied. Check security rules:', firestoreError);
          throw new Error('Database permission denied. Please contact support.');
        }
        throw firestoreError;
      }
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

  return { user, loading, signUp, signInWithGoogle, signInWithApple };
};
