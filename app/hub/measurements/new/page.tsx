"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  createProfile,
  emptyStandardMeasurements,
  FIELD_LABEL,
  STANDARD_FIELDS,
  type CustomMeasurement,
  type MeasurementUnit,
} from "@/lib/measurements";
import { triggerHaptic } from "@/lib/haptics";
import { FormField, inputClass } from "@/components/FormField";

export default function NewMeasurementProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const [name, setName] = useState("");
  const [unit, setUnit] = useState<MeasurementUnit>("cm");
  const [notes, setNotes] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [custom, setCustom] = useState<CustomMeasurement[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.replace("/");
      else setUser(u);
    });
    return () => unsub();
  }, [router]);

  function addCustomRow() {
    setCustom((c) => [...c, { label: "", value: null }]);
  }

  function updateCustomLabel(i: number, label: string) {
    setCustom((c) => c.map((row, idx) => (idx === i ? { ...row, label } : row)));
  }

  function updateCustomValue(i: number, raw: string) {
    setCustom((c) =>
      c.map((row, idx) => (idx === i ? { ...row, value: raw ? Number(raw) : null } : row))
    );
  }

  function removeCustomRow(i: number) {
    setCustom((c) => c.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setSaving(true);
    const standard = emptyStandardMeasurements();
    for (const f of STANDARD_FIELDS) {
      const raw = values[f];
      standard[f] = raw ? Number(raw) : null;
    }
    try {
      const id = await createProfile(user.uid, {
        name: name.trim(),
        unit,
        notes: notes.trim(),
        custom: custom.filter((row) => row.label.trim()),
        ...standard,
      });
      triggerHaptic("success");
      router.push(`/hub/measurements/${id}`);
    } catch {
      triggerHaptic("error");
      setError("Couldn't save that profile. Try again.");
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-xl mx-auto">
      <Link href="/hub/measurements" className="font-mono text-xs uppercase text-parchment/50 hover:text-parchment">
        ← Back to measurements
      </Link>
      <h1 className="font-display uppercase tracking-wide text-3xl mt-4 mb-6">Add profile</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Name" required>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Me, or Client: Priya"
            className={inputClass}
          />
        </FormField>

        <FormField label="Unit">
          <select value={unit} onChange={(e) => setUnit(e.target.value as MeasurementUnit)} className={inputClass}>
            <option value="cm">Centimeters</option>
            <option value="in">Inches</option>
          </select>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          {STANDARD_FIELDS.map((f) => (
            <FormField key={f} label={FIELD_LABEL[f]}>
              <input
                type="number"
                min="0"
                step="0.1"
                value={values[f] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [f]: e.target.value }))}
                className={inputClass}
              />
            </FormField>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="block font-mono text-xs uppercase tracking-wide text-parchment/60">
              Custom measurements
            </span>
            <button
              type="button"
              onClick={addCustomRow}
              className="font-mono text-xs uppercase text-chalk-gold hover:text-chalk-gold/70"
            >
              + Add
            </button>
          </div>
          {custom.length === 0 && (
            <p className="font-body text-xs text-parchment/40">
              For anything outside the standard set — a specific hem circumference, a garment-specific length, etc.
            </p>
          )}
          <div className="space-y-2">
            {custom.map((row, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Label"
                  value={row.label}
                  onChange={(e) => updateCustomLabel(i, e.target.value)}
                  className={`${inputClass} flex-1`}
                />
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="Value"
                  value={row.value ?? ""}
                  onChange={(e) => updateCustomValue(i, e.target.value)}
                  className={`${inputClass} w-28`}
                />
                <button
                  type="button"
                  onClick={() => removeCustomRow(i)}
                  className="font-mono text-xs text-pin-red/70 hover:text-pin-red px-2"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <FormField label="Notes">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything else worth remembering — posture, fit preferences, when these were taken"
            rows={3}
            className={inputClass}
          />
        </FormField>

        {error && <p className="text-pin-red text-sm font-mono">{error}</p>}

        <button
          type="submit"
          disabled={saving || !user}
          className="w-full bg-chalk-gold text-ink font-display uppercase tracking-wide text-sm rounded-sm py-2.5 hover:bg-chalk-gold/80 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
      </form>
    </main>
  );
}
