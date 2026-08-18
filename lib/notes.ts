/**
 * lib/notes.ts
 *
 * Firestore access for the quick-notes area — short freeform notes at
 * users/{uid}/notes/{id}, same nested shape as deadlines/swatches/etc., so
 * no firestore.rules changes are needed (the owner-only rule already
 * covers every subcollection under a user's doc).
 *
 * Search is client-side (see app/hub/notes/page.tsx) rather than a backend
 * full-text index — notes are short and per-user counts are small, so a
 * substring filter over the already-loaded list is plenty.
 */
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Note {
  id: string;
  text: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

function notesRef(uid: string) {
  return collection(db, "users", uid, "notes");
}

export async function listNotes(uid: string): Promise<Note[]> {
  const snap = await getDocs(query(notesRef(uid), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Note, "id">) }));
}

export async function createNote(uid: string, text: string): Promise<string> {
  const ref = await addDoc(notesRef(uid), {
    text,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateNote(uid: string, id: string, text: string): Promise<void> {
  await updateDoc(doc(db, "users", uid, "notes", id), {
    text,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteNote(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "notes", id));
}
