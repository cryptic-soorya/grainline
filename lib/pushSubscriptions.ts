/**
 * lib/pushSubscriptions.ts
 *
 * Firestore access for Web Push subscriptions, one doc per device a user
 * has enabled deadline reminders on. Lives at
 * users/{uid}/pushSubscriptions/{id} — same nested shape as deadlines and
 * swatches, already covered by firestore.rules' owner-only rule with no
 * rules changes needed.
 *
 * The doc ID is derived from the subscription endpoint URL (see
 * `subscriptionDocId`) rather than auto-generated, so re-subscribing the
 * same device (e.g. permission re-granted, browser storage cleared) just
 * overwrites the existing doc instead of creating a duplicate.
 */
import { doc, setDoc, deleteDoc, getDocs, collection, serverTimestamp, type Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface PushSubscriptionRecord {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  createdAt: Timestamp | null;
}

function subscriptionsRef(uid: string) {
  return collection(db, "users", uid, "pushSubscriptions");
}

// Endpoint URLs are unique per device+browser and already unwieldy as a doc
// ID, so hash-free but still Firestore-ID-safe: swap the characters
// Firestore doesn't like in a doc ID for underscores.
export function subscriptionDocId(endpoint: string): string {
  return endpoint.replace(/[^a-zA-Z0-9]/g, "_").slice(-200);
}

export async function saveSubscription(uid: string, subscription: PushSubscriptionJSON): Promise<void> {
  if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
    throw new Error("Push subscription is missing required fields");
  }
  const id = subscriptionDocId(subscription.endpoint);
  await setDoc(doc(subscriptionsRef(uid), id), {
    endpoint: subscription.endpoint,
    keys: subscription.keys,
    createdAt: serverTimestamp(),
  });
}

export async function removeSubscription(uid: string, endpoint: string): Promise<void> {
  await deleteDoc(doc(subscriptionsRef(uid), subscriptionDocId(endpoint)));
}

export async function listSubscriptions(uid: string): Promise<PushSubscriptionRecord[]> {
  const snap = await getDocs(subscriptionsRef(uid));
  return snap.docs.map((d) => d.data() as PushSubscriptionRecord);
}
