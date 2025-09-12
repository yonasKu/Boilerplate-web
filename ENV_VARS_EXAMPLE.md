# Environment variables for SproutBook Web

Create a `.env.local` file in `sproutbook-web/` with these keys. For Vercel, add the same keys in Project Settings → Environment Variables.

```
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sproutbook-d0c8f
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID

# Optional: turn on debug panel on /login
NEXT_PUBLIC_DEBUG_ADMIN=0
```
