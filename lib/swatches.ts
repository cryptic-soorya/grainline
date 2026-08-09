/**
 * lib/swatches.ts
 *
 * Firestore access for the Phase 2 fabric swatch library. Every swatch
 * lives at users/{uid}/swatches/{swatchId} — nested under the owning
 * user's doc, which is exactly the shape firestore.rules already protects
 * ("anything nested under a user's doc inherits the owner-only rule"), so
 * no rules changes were needed to ship this feature.
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

export type Drape = "structured" | "medium" | "fluid";
export type Opacity = "sheer" | "semi-opaque" | "opaque";

export const DRAPE_LABEL: Record<Drape, string> = {
  structured: "Structured",
  medium: "Medium drape",
  fluid: "Fluid",
};

export const OPACITY_LABEL: Record<Opacity, string> = {
  sheer: "Sheer",
  "semi-opaque": "Semi-opaque",
  opaque: "Opaque",
};

export interface Swatch {
  id: string;
  name: string;
  fiberContent: string;
  gsm: number | null;
  stretchPercent: number | null;
  drape: Drape | "";
  opacity: Opacity | "";
  care: string;
  notes: string;
  // Base64 data URL, not a Cloud Storage URL — see lib/imageResize.ts for why.
  photoDataUrl: string | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export type SwatchInput = Omit<Swatch, "id" | "createdAt" | "updatedAt">;

function swatchesRef(uid: string) {
  return collection(db, "users", uid, "swatches");
}

export async function listSwatches(uid: string): Promise<Swatch[]> {
  const snap = await getDocs(query(swatchesRef(uid), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Swatch, "id">) }));
}

export async function getSwatch(uid: string, id: string): Promise<Swatch | null> {
  const snap = await getDoc(doc(db, "users", uid, "swatches", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Swatch, "id">) };
}

export async function createSwatch(uid: string, input: SwatchInput): Promise<string> {
  const ref = await addDoc(swatchesRef(uid), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateSwatch(uid: string, id: string, input: SwatchInput): Promise<void> {
  await updateDoc(doc(db, "users", uid, "swatches", id), {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteSwatch(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "swatches", id));
}
