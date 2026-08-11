/**
 * lib/measurements.ts
 *
 * Firestore access for the Phase 5 measurement tracker. Every profile
 * lives at users/{uid}/measurementProfiles/{profileId} — same nested
 * shape as swatches (see lib/swatches.ts), so it's already covered by
 * firestore.rules' owner-only rule with no rules changes needed.
 *
 * A "profile" is one person (Soorya's girlfriend herself, or a client) —
 * pattern-making measurements are reused across many projects for the
 * same body, which is the whole point of tracking them separately from
 * any one garment.
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

export type MeasurementUnit = "cm" | "in";

// The standard pattern-drafting measurement set covered by nearly every
// garment sloper — anything more specific (a hem circumference for one
// particular skirt, say) belongs in `custom` instead of growing this list.
export const STANDARD_FIELDS = [
  "bust",
  "underbust",
  "waist",
  "hip",
  "shoulderWidth",
  "neck",
  "armLength",
  "bicep",
  "wrist",
  "backWaistLength",
  "inseam",
  "thigh",
] as const;

export type StandardField = (typeof STANDARD_FIELDS)[number];

export const FIELD_LABEL: Record<StandardField, string> = {
  bust: "Bust/Chest",
  underbust: "Underbust",
  waist: "Waist",
  hip: "Hip",
  shoulderWidth: "Shoulder width",
  neck: "Neck",
  armLength: "Arm length",
  bicep: "Bicep",
  wrist: "Wrist",
  backWaistLength: "Back waist length",
  inseam: "Inseam",
  thigh: "Thigh",
};

export interface CustomMeasurement {
  label: string;
  value: number | null;
}

export type StandardMeasurements = Record<StandardField, number | null>;

export interface MeasurementProfile extends StandardMeasurements {
  id: string;
  name: string;
  unit: MeasurementUnit;
  notes: string;
  custom: CustomMeasurement[];
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export type MeasurementProfileInput = Omit<
  MeasurementProfile,
  "id" | "createdAt" | "updatedAt"
>;

export function emptyStandardMeasurements(): StandardMeasurements {
  return Object.fromEntries(STANDARD_FIELDS.map((f) => [f, null])) as StandardMeasurements;
}

function profilesRef(uid: string) {
  return collection(db, "users", uid, "measurementProfiles");
}

export async function listProfiles(uid: string): Promise<MeasurementProfile[]> {
  const snap = await getDocs(query(profilesRef(uid), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MeasurementProfile, "id">) }));
}

export async function getProfile(uid: string, id: string): Promise<MeasurementProfile | null> {
  const snap = await getDoc(doc(db, "users", uid, "measurementProfiles", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<MeasurementProfile, "id">) };
}

export async function createProfile(
  uid: string,
  input: MeasurementProfileInput
): Promise<string> {
  const ref = await addDoc(profilesRef(uid), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProfile(
  uid: string,
  id: string,
  input: MeasurementProfileInput
): Promise<void> {
  await updateDoc(doc(db, "users", uid, "measurementProfiles", id), {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProfile(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "measurementProfiles", id));
}
