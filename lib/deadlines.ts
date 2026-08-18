/**
 * lib/deadlines.ts
 *
 * Firestore access for the Phase 5 deadline/project tracker. Every deadline
 * lives at users/{uid}/deadlines/{id} — same nested shape as swatches and
 * measurement profiles, already covered by firestore.rules' owner-only rule
 * with no rules changes needed.
 *
 * Ordered by due date ascending (not createdAt like the other Phase 2/5
 * collections) since "what's due soonest" is the whole point of this list.
 */
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface ChecklistItem {
  label: string;
  done: boolean;
}

export interface Deadline {
  id: string;
  title: string;
  course: string;
  // ISO date string (yyyy-mm-dd), matches <input type="date"> directly —
  // stored as a plain string rather than a Firestore Timestamp since there's
  // no time-of-day component to a submission date.
  dueDate: string;
  notes: string;
  checklist: ChecklistItem[];
  completed: boolean;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  // Reminder tags already sent for this deadline (e.g. "1d"), written by
  // the Phase 6 cron (app/api/cron/deadline-reminders) so it never sends
  // the same reminder twice. Absent on deadlines created before Phase 6.
  remindersSent?: string[];
}

export type DeadlineInput = Omit<Deadline, "id" | "createdAt" | "updatedAt">;

function deadlinesRef(uid: string) {
  return collection(db, "users", uid, "deadlines");
}

export async function listDeadlines(uid: string): Promise<Deadline[]> {
  const snap = await getDocs(query(deadlinesRef(uid), orderBy("dueDate", "asc")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Deadline, "id">) }));
}

export async function getDeadline(uid: string, id: string): Promise<Deadline | null> {
  const snap = await getDoc(doc(db, "users", uid, "deadlines", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Deadline, "id">) };
}

export async function createDeadline(uid: string, input: DeadlineInput): Promise<string> {
  const ref = await addDoc(deadlinesRef(uid), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateDeadline(uid: string, id: string, input: DeadlineInput): Promise<void> {
  await updateDoc(doc(db, "users", uid, "deadlines", id), {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDeadline(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "deadlines", id));
}

// Day-granularity comparison against "today" — dueDate has no time
// component, so this treats a deadline as overdue starting the day after,
// not partway through its own due date.
export function daysUntil(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + "T00:00:00");
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((due.getTime() - today.getTime()) / msPerDay);
}
