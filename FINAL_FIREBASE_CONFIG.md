# 🔥 Final Firebase Configuration Plan

## Current Web App Analysis
✅ **Pages that exist:**
- `/onboarding` - Welcome flow
- `/signup` - Account creation form (UI only)
- `/download` - App download links
- `/checkout` - (exists but not needed for auth)
- `/pricing` - (exists but not needed for auth)

❌ **Pages that don't exist (and don't need them):**
- Login page
- Dashboard
- User management

## 1. Install Firebase
```bash
npm install firebase@^12.0.0
```

## 2. Get Firebase Keys
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (same as mobile app)
3. Project Settings → General → Your apps → SDK setup → Config
4. Copy these values for your `.env.local`:

## 3. Create Environment File
**File**: `.env.local`
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 4. Create Firebase Config
**File**: `src/lib/firebase/config.ts`
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

## 5. Create Auth Hook
**File**: `src/hooks/useAuth.ts`
```typescript
import { useState, useEffect } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    setLoading(false);
    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update display name
    await updateProfile(result.user, { displayName: name });
    
    // Send verification email
    await sendEmailVerification(result.user);
    
    // Save user to Firestore (same as mobile app)
    await setDoc(doc(db, 'users', result.user.uid), {
      email: result.user.email,
      displayName: name,
      emailVerified: false,
      createdAt: new Date(),
      source: 'web'
    });
    
    return result.user;
  };

  return { user, loading, signUp };
};
```

## 6. Connect Signup Form to Firebase
**File**: `src/app/(auth)/signup/page.tsx`

Add this to the existing signup form:

```typescript
// Add these imports at the top
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

// Add inside the component
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [name, setName] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const { signUp } = useAuth();
const router = useRouter();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  
  try {
    await signUp(email, password, name);
    router.push('/download');
  } catch (error: any) {
    setError(error.message || 'Failed to create account');
  } finally {
    setLoading(false);
  }
};
```

## 7. Update Signup Form Fields
**File**: `src/app/(auth)/signup/page.tsx`

Replace the form fields with Firebase-connected ones:

```typescript
<form onSubmit={handleSubmit} className={styles.form}>
  {error && <div className={styles.error}>{error}</div>}
  
  <input
    type="text"
    placeholder="Full Name"
    value={name}
    onChange={(e) => setName(e.target.value)}
    required
    className={styles.input}
  />
  
  <input
    type="email"
    placeholder="Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
    className={styles.input}
  />
  
  <input
    type="password"
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    className={styles.input}
  />
  
  <button type="submit" disabled={loading} className={styles.button}>
    {loading ? 'Creating Account...' : 'Create Account'}
  </button>
</form>
```

## 8. Test the Flow
1. **Signup**: Fill form → account created → verification email sent
2. **Verification**: Check email → click link → account verified
3. **Download**: Redirected to `/download` → download app
4. **Mobile**: Use same credentials in mobile app

## 9. Files Created/Modified
- ✅ `.env.local` - Environment variables
- ✅ `src/lib/firebase/config.ts` - Firebase setup
- ✅ `src/hooks/useAuth.ts` - Auth functionality
- 🔄 `src/app/(auth)/signup/page.tsx` - Connect form to Firebase

## 10. Testing Checklist
- [ ] User can create account via web form
- [ ] Verification email sends automatically
- [ ] User redirected to download page after signup
- [ ] Account appears in Firebase Console
- [ ] Same account works in mobile app
- [ ] No login functionality needed (as designed)

## 11. Quick Verification
After setup, test this flow:
1. Go to `/signup`
2. Fill form and submit
3. Check email for verification
4. Verify email
5. Get redirected to `/download`
6. Download app and login with same credentials

## Done! 🎉
This connects your web signup to the existing Firebase project used by your mobile app.
