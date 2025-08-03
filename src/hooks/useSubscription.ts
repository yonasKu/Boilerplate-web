import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { User } from 'firebase/auth';

interface SubscriptionData {
  status: 'trial' | 'active' | 'cancelled' | 'expired';
  trialEndDate: Date;
  plan: 'trial' | 'monthly' | 'annual';
  isActive: boolean;
}

interface UserData {
  subscription: SubscriptionData;
  emailVerified: boolean;
  displayName: string;
  email: string;
}

export const useSubscription = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = doc(db, 'users', currentUser.uid);
        const unsubscribeDoc = onSnapshot(userDoc, (doc) => {
          if (doc.exists()) {
            setUserData(doc.data() as UserData);
          }
          setLoading(false);
        });
        return unsubscribeDoc;
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const getTrialDaysRemaining = () => {
    if (!userData?.subscription?.trialEndDate) return 0;
    const trialEnd = new Date(userData.subscription.trialEndDate);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const isTrialActive = () => {
    if (!userData?.subscription) return false;
    return userData.subscription.status === 'trial' && getTrialDaysRemaining() > 0;
  };

  return {
    user,
    userData,
    loading,
    trialDaysRemaining: getTrialDaysRemaining(),
    isTrialActive: isTrialActive(),
    subscription: userData?.subscription || null,
  };
};
