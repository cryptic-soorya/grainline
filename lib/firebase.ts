/**
 * lib/firebase.ts
 *
 * One shared Firebase connection for the whole app. We initialize it once
 * here and import `auth`/`db` wherever they're needed, instead of
 * re-initializing Firebase in every file that needs it.
 *
 * Credentials come from environment variables (see .env.local.example) —
 * never hardcode them in this file. They're not secret in the traditional
 * sense (Firebase web config is meant to be public-ish, security comes from
 * Firestore rules, not from hiding this config), but keeping them in env
 * vars means you can point at a different Firebase project for local dev
 * vs. production without changing code.
 */
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// getApps().length check avoids "Firebase app already initialized" errors
// that happen with Next.js hot-reload during development.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
