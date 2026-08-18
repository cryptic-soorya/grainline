/**
 * app/api/cron/deadline-reminders/route.ts
 *
 * Runs once a day via Vercel Cron (see vercel.json). Finds every deadline
 * due tomorrow that hasn't been reminded about yet, across all users (a
 * `collectionGroup` query — this is the reason this route needs the Admin
 * SDK instead of the client one, see lib/firebaseAdmin.ts), and sends a
 * push notification to each of that deadline's owner's subscribed devices.
 *
 * Needs the Node.js runtime (not Edge) because firebase-admin and web-push
 * both depend on Node APIs.
 */
import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REMINDER_TAG = "1d";

function tomorrowDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10); // yyyy-mm-dd, matches Deadline.dueDate's format
}

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) {
    return NextResponse.json({ error: "Push isn't configured" }, { status: 500 });
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);

  const db = adminDb();
  const dueTomorrow = await db
    .collectionGroup("deadlines")
    .where("dueDate", "==", tomorrowDateString())
    .where("completed", "==", false)
    .get();

  let sent = 0;
  let pruned = 0;

  for (const deadlineDoc of dueTomorrow.docs) {
    const data = deadlineDoc.data();
    const remindersSent: string[] = data.remindersSent || [];
    if (remindersSent.includes(REMINDER_TAG)) continue;

    // collectionGroup docs live at users/{uid}/deadlines/{id} — the owning
    // user's uid is the grandparent doc's ID.
    const uid = deadlineDoc.ref.parent.parent?.id;
    if (!uid) continue;

    const subsSnap = await db.collection("users").doc(uid).collection("pushSubscriptions").get();
    if (subsSnap.empty) continue;

    const payload = JSON.stringify({
      title: "Due tomorrow",
      body: `${data.title}${data.course ? ` — ${data.course}` : ""}`,
      url: `/hub/deadlines/${deadlineDoc.id}`,
    });

    for (const subDoc of subsSnap.docs) {
      const sub = subDoc.data();
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload
        );
        sent++;
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          // Subscription is dead (unsubscribed, browser data cleared,
          // device uninstalled) — the push service told us to stop trying.
          await subDoc.ref.delete();
          pruned++;
        }
      }
    }

    await deadlineDoc.ref.update({ remindersSent: FieldValue.arrayUnion(REMINDER_TAG) });
  }

  return NextResponse.json({ deadlinesChecked: dueTomorrow.size, notificationsSent: sent, subscriptionsPruned: pruned });
}
