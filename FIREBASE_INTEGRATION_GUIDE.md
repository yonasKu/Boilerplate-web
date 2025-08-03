# 🔥 SproutBook Web App - Simple Firebase Integration

## Quick Setup (5 Steps)

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create Project" → Name it "sproutbook-web"
3. Enable **Authentication** → Email/Password
4. Enable **Firestore Database** → Start in production mode

### 2. Install Firebase
```bash
npm install firebase@^12.0.0
```

### 3. Add Environment Variables
Create `.env.local` file:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Basic Firebase Setup
Create `src/lib/firebase/config.ts`:
```typescript
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
```

---

## 🔧 Step 1: Environment Configuration

### Create Environment Variables
Create `.env.local` in project root:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Optional: For development/testing
NEXT_PUBLIC_FIREBASE_EMULATOR_AUTH=false
NEXT_PUBLIC_FIREBASE_EMULATOR_FIRESTORE=false
NEXT_PUBLIC_FIREBASE_EMULATOR_HOST=localhost
```

### TypeScript Environment Types
Update `src/types/env.d.ts`:

```typescript
declare namespace NodeJS {
  interface ProcessEnv {
    readonly NEXT_PUBLIC_FIREBASE_API_KEY: string;
    readonly NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
    readonly NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
    readonly NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
    readonly NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
    readonly NEXT_PUBLIC_FIREBASE_APP_ID: string;
  }
}
```

---

## 📦 Step 2: Install Firebase Dependencies

```bash
npm install firebase@^12.0.0
npm install --save-dev @types/firebase
```

---

## 🔥 Step 3: Firebase Configuration

### Create Firebase Configuration File
Create `src/lib/firebase/config.ts`:

```typescript
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  if (process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_AUTH === 'true') {
    connectAuthEmulator(auth, `http://${process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST}:9099`);
  }
  if (process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_FIRESTORE === 'true') {
    connectFirestoreEmulator(db, process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST!, 8080);
  }
}

export { auth, db };
export default app;
```

### Create Firebase Auth Hook
Create `src/hooks/useAuth.ts`:

```typescript
import { useState, useEffect } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState({
        user,
        loading: false,
        error: null,
      });
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(result.user);
      return result.user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const resendVerificationEmail = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return {
    ...authState,
    signUp,
    signIn,
    logout,
    resendVerificationEmail,
    resetPassword,
  };
};
```

---

## 📝 Step 4: Firestore Database Schema

### Create User Document Interface
Create `src/lib/types/user.ts`:

```typescript
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  subscription: {
    status: 'free' | 'active' | 'cancelled' | 'expired';
    planId: string;
    currentPeriodEnd: Date;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  };
  children: ChildProfile[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChildProfile {
  id: string;
  name: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  photo?: string;
  createdAt: Date;
}

export interface JournalEntry {
  id: string;
  userId: string;
  childId: string;
  title: string;
  content: string;
  photos: string[];
  date: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Create Firestore Service
Create `src/lib/firebase/firestore.ts`:

```typescript
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { db } from './config';
import { UserProfile, ChildProfile, JournalEntry } from '@/lib/types/user';

export class FirestoreService {
  // User operations
  static async createUserProfile(userId: string, email: string, displayName: string) {
    const userRef = doc(db, 'users', userId);
    const userProfile: Partial<UserProfile> = {
      id: userId,
      email,
      displayName,
      emailVerified: false,
      subscription: {
        status: 'free',
        planId: 'free',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      children: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await setDoc(userRef, userProfile);
    return userProfile;
  }

  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? (userSnap.data() as UserProfile) : null;
  }

  static async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date(),
    });
  }

  // Child operations
  static async addChild(userId: string, child: Omit<ChildProfile, 'id' | 'createdAt'>) {
    const childrenRef = collection(db, 'users', userId, 'children');
    const childDoc = await addDoc(childrenRef, {
      ...child,
      createdAt: new Date(),
    });
    return childDoc.id;
  }

  static async getChildren(userId: string): Promise<ChildProfile[]> {
    const childrenRef = collection(db, 'users', userId, 'children');
    const childrenSnap = await getDocs(childrenRef);
    return childrenSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as ChildProfile));
  }

  // Journal operations
  static async addJournalEntry(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) {
    const entriesRef = collection(db, 'journalEntries');
    const entryDoc = await addDoc(entriesRef, {
      ...entry,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return entryDoc.id;
  }

  static async getJournalEntries(userId: string, childId?: string): Promise<JournalEntry[]> {
    const entriesRef = collection(db, 'journalEntries');
    let q = query(entriesRef, where('userId', '==', userId));
    
    if (childId) {
      q = query(q, where('childId', '==', childId));
    }

    const entriesSnap = await getDocs(q);
    return entriesSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as JournalEntry));
  }
}
```

---

## 🎯 Step 5: Implement Authentication Pages

### Update Signup Page
Create `src/app/(auth)/signup/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { FirestoreService } from '@/lib/firebase/firestore';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await signUp(data.email, data.password);
      await FirestoreService.createUserProfile(user.uid, data.email, data.name);
      router.push('/verify-email');
    } catch (error: any) {
      setError(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                {...register('name')}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                {...register('confirmPassword')}
                type="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

### Create Email Verification Page
Create `src/app/(auth)/verify-email/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase/config';

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { user, resendVerificationEmail, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const checkVerification = async () => {
      await user.reload();
      if (user.emailVerified) {
        router.push('/pricing');
      }
    };

    const interval = setInterval(checkVerification, 3000);
    return () => clearInterval(interval);
  }, [user, router]);

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      await resendVerificationEmail();
      setMessage('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      setMessage(error.message || 'Failed to send verification email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    await auth.currentUser?.reload();
    if (auth.currentUser?.emailVerified) {
      router.push('/pricing');
    } else {
      setMessage('Please verify your email first');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a verification email to {user?.email}
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800">
              Please check your email and click the verification link to continue.
            </p>
          </div>

          {message && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-sm text-green-800">{message}</p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleResendEmail}
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Resend Verification Email'}
            </button>

            <button
              onClick={handleContinue}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              I've Verified My Email - Continue
            </button>

            <button
              onClick={logout}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-500 bg-transparent hover:text-gray-700"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔐 Step 6: Security Rules

### Firestore Security Rules
Create `firestore.rules` in project root:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isEmailVerified() {
      return request.auth.token.email_verified == true;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated() && isOwner(userId);
      allow create: if isAuthenticated() && isOwner(userId);
      allow update: if isAuthenticated() && isOwner(userId) && isEmailVerified();
      allow delete: if false;
    }

    // Children subcollection
    match /users/{userId}/children/{childId} {
      allow read: if isAuthenticated() && isOwner(userId);
      allow create: if isAuthenticated() && isOwner(userId) && isEmailVerified();
      allow update: if isAuthenticated() && isOwner(userId) && isEmailVerified();
      allow delete: if isAuthenticated() && isOwner(userId) && isEmailVerified();
    }

    // Journal entries
    match /journalEntries/{entryId} {
      allow read: if isAuthenticated() && 
        (resource.data.userId == request.auth.uid || 
         request.auth.uid in resource.data.sharedWith);
      allow create: if isAuthenticated() && isEmailVerified() && 
        request.resource.data.userId == request.auth.uid;
      allow update: if isAuthenticated() && isEmailVerified() && 
        resource.data.userId == request.auth.uid;
      allow delete: if isAuthenticated() && isEmailVerified() && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

### Firebase Authentication Settings
1. **Email/Password Provider**: Enable in Firebase Console > Authentication > Sign-in method
2. **Email Templates**: Customize verification email template
3. **Password Policy**: Configure password requirements
4. **Account Linking**: Enable for future social login integration

---

## 🧪 Step 7: Testing & Development

### Development Environment Setup
Create `src/lib/firebase/emulator.ts`:

```typescript
// For local development with Firebase Emulator
export const useEmulator = () => {
  if (process.env.NODE_ENV === 'development') {
    return {
      auth: process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_AUTH === 'true',
      firestore: process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_FIRESTORE === 'true',
      host: process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || 'localhost',
    };
  }
  return { auth: false, firestore: false };
};
```

### Test User Creation Script
Create `scripts/create-test-user.js`:

```javascript
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, sendEmailVerification } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Initialize Firebase with test config
const firebaseConfig = {
  // Your test config here
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createTestUser() {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      'test@example.com', 
      'password123'
    );
    
    const user = userCredential.user;
    
    // Create user profile
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      displayName: 'Test User',
      emailVerified: false,
      subscription: {
        status: 'free',
        planId: 'free',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      children: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    await sendEmailVerification(user);
    console.log('Test user created:', user.email);
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

createTestUser();
```

---

## 🚀 Step 8: Deployment & Production Setup

### Build Configuration
Update `next.config.ts`:

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    // ... other env vars
  },
  // Ensure Firebase works with SSR
  experimental: {
    serverComponentsExternalPackages: ['firebase'],
  },
};

export default nextConfig;
```

### Production Checklist
- [ ] Environment variables configured in deployment platform
- [ ] Firebase production project set up
- [ ] Security rules deployed
- [ ] Email templates customized
- [ ] SSL certificate configured
- [ ] Domain authentication set up
- [ ] Error tracking configured (Sentry recommended)
- [ ] Analytics enabled

---

## 🔍 Step 9: Troubleshooting Guide

### Common Issues & Solutions

#### Email Not Sending
- Check Firebase email quotas
- Verify email configuration in Firebase Console
- Check spam/junk folders
- Ensure email address is valid

#### Authentication Errors
- Verify Firebase config matches project
- Check if email is already verified
- Ensure proper error handling in auth hooks
- Check network connectivity

#### Firestore Permission Errors
- Verify security rules are deployed
- Check if user is authenticated and email verified
- Ensure proper document paths
- Check Firestore indexes for complex queries

#### Cross-Platform Sync Issues
- Verify both apps use same Firebase project
- Check if user is properly authenticated on both platforms
- Ensure Firestore rules allow cross-platform access
- Verify real-time listeners are properly set up

### Debug Mode
Enable Firebase debug logging:

```typescript
// Add to firebase config
if (process.env.NODE_ENV === 'development') {
  window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}
```

---

## 📊 Monitoring & Analytics

### Firebase Analytics Setup
```typescript
import { getAnalytics, logEvent } from 'firebase/analytics';

export const logSignupEvent = (method: string) => {
  const analytics = getAnalytics();
  logEvent(analytics, 'sign_up', { method });
};

export const logEmailVerification = () => {
  const analytics = getAnalytics();
  logEvent(analytics, 'email_verification_complete');
};
```

### Performance Monitoring
```typescript
import { getPerformance } from 'firebase/performance';

const perf = getPerformance();
```

---

## 🔄 Continuous Integration

### GitHub Actions Workflow
Create `.github/workflows/firebase-deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-node@v2
      with:
        node-version: '18'
    - run: npm ci
    - run: npm run build
    - uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: '${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
        projectId: your-project-id
```

---

## 📝 Final Checklist

### Development Setup
- [ ] Firebase project created
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Firebase config files created
- [ ] Authentication hooks implemented
- [ ] Firestore service created
- [ ] Security rules deployed
- [ ] Test user creation script ready

### Feature Implementation
- [ ] Signup page with email verification
- [ ] Login page with proper validation
- [ ] Email verification page
- [ ] Password reset functionality
- [ ] User profile creation
- [ ] Cross-platform data sync
- [ ] Real-time updates
- [ ] Error handling and user feedback

### Testing
- [ ] Unit tests for auth hooks
- [ ] Integration tests for Firestore operations
- [ ] End-to-end testing of user flow
- [ ] Cross-platform testing
- [ ] Performance testing
- [ ] Security testing

### Production
- [ ] Production Firebase project
- [ ] Environment variables in deployment platform
- [ ] SSL certificate
- [ ] Domain configuration
- [ ] Monitoring and analytics
- [ ] Error tracking
- [ ] Performance monitoring

---

## 📞 Support & Resources

### Documentation Links
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Next.js Firebase Integration](https://firebase.google.com/docs/web/nextjs)

### Community Resources
- [Firebase Discord](https://firebase.community/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)
- [GitHub Issues](https://github.com/firebase/firebase-js-sdk/issues)

### Contact
- **Technical Support**: support@sproutbook.com
- **Firebase Support**: firebase-support@google.com

---

**Last Updated**: August 3, 2025  
**Version**: 1.0.0  
**Status**: Production Ready
