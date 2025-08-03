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
  getRedirectResult
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
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          const user = result.user;
          
          try {
            // Check if user already exists in Firestore
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
              // New user, create a document in Firestore
              await setDoc(userDocRef, {
                email: user.email,
                displayName: user.displayName,
                emailVerified: user.emailVerified,
                createdAt: new Date(),
                source: 'web-google',
                subscription: {
                  status: 'trial',
                  trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                  plan: 'trial',
                  isActive: true,
                },
                onboarded: false,
                lifestage: null,
                children: []
              });
            }
          } catch (firestoreError: any) {
            console.error('Error creating user document:', firestoreError);
          }
        }
      } catch (error: any) {
        console.error('Error handling redirect result:', error);
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
        // Check if user already exists in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          // New user, create a document in Firestore
          await setDoc(userDocRef, {
            email: user.email,
            displayName: user.displayName,
            emailVerified: user.emailVerified,
            createdAt: new Date(),
            source: 'web-google',
            subscription: {
              status: 'trial',
              trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              plan: 'trial',
              isActive: true,
            },
            onboarded: false,
            lifestage: null,
            children: []
          });
          return { isNewUser: true, user };
        }

        // Existing user
        return { isNewUser: false, user };
      } catch (firestoreError: any) {
        if (firestoreError.code === 'permission-denied') {
          console.error('Firestore permission denied. Check security rules:', firestoreError);
          throw new Error('Database permission denied. Please contact support.');
        }
        throw firestoreError;
      }
    } catch (error: any) {
      console.error('Error during Google sign-in:', error);
      
      // Handle popup issues specifically
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        // Try redirect as fallback
        try {
          await signInWithRedirect(auth, provider);
          return { isNewUser: false, user: null }; // Redirect will handle the rest
        } catch (redirectError) {
          throw new Error('Google sign-in failed. Please try again.');
        }
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized for Google sign-in');
      }
      
      throw error;
    }
  };

  return { user, loading, signUp, signInWithGoogle };
};
