/**
 * lib/firebaseAdmin.ts
 *
 * Server-only Firebase Admin SDK setup — never import this from a "use
 * client" component. This is the first place the project uses admin
 * credentials instead of the client SDK: the deadline-reminders cron
 * (app/api/cron/deadline-reminders/route.ts) needs to read every user's
 * deadlines, which the client SDK's owner-only security rules correctly
 * refuse to allow. The Admin SDK authenticates as a service account and
 * bypasses Firestore rules entirely, so it must only ever run server-side.
 *
 * Credentials come from a Firebase Console service account (Project
 * Settings -> Service Accounts -> Generate new private key), not the
 * public web config in lib/firebase.ts.
 */
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function getAdminApp(): App {
  if (getApps().length) return getApps()[0];

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  // Env vars can't hold literal newlines, so the downloaded key's \n
  // escapes survive as the two-character sequence "\n" and need
  // unescaping back into real newlines before the SDK will accept it.
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin credentials missing — set FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY"
    );
  }

  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

// Lazily initialized so importing this module (as Next.js does for every
// API route while collecting page data at build time) doesn't throw just
// because admin credentials aren't set — only calling adminDb() does, and
// that only happens when the cron route actually runs.
let db: Firestore | null = null;
export function adminDb(): Firestore {
  if (!db) db = getFirestore(getAdminApp());
  return db;
}
