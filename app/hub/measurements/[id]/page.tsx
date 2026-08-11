"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  getProfile,
  updateProfile,
  deleteProfile,
  emptyStandardMeasurements,
  FIELD_LABEL,
  STANDARD_FIELDS,
  type MeasurementProfile,
  type MeasurementUnit,
  type CustomMeasurement,
} from "@/lib/measurements";
import { triggerHaptic } from "@/lib/haptics";
import { FormField, inputClass } from "@/components/FormField";

export default function MeasurementProfileDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<MeasurementProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editable field state, seeded once the profile loads.
  const [name, setName] = useState("");
  const [unit, setUnit] = useState<MeasurementUnit>("cm");
  const [notes, setNotes] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [custom, setCustom] = useState<CustomMeasurement[]>([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.replace("/");
      else setUser(u);
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!user || !params.id) return;
    getProfile(user.uid, params.id)
      .then((p) => {
        if (!p) {
          setNotFound(true);
          return;
        }
        setProfile(p);
        setName(p.name);
        setUnit(p.unit);
        setNotes(p.notes);
        setCustom(p.custom);
        const v: Record<string, string> = {};
        for (const f of STANDARD_FIELDS) {
          v[f] = p[f] != null ? String(p[f]) : "";
        }
        setValues(v);
      })
      .catch(() => setError("Couldn't load that profile."))
      .finally(() => setLoading(false));
  }, [user, params.id]);

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

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !profile) return;
    setSaving(true);
    setError(null);
    const standard = emptyStandardMeasurements();
    for (const f of STANDARD_FIELDS) {
      standard[f] = values[f] ? Number(values[f]) : null;
    }
    const updated = {
      name: name.trim(),
      unit,
      notes: notes.trim(),
      custom: custom.filter((row) => row.label.trim()),
      ...standard,
    };
    try {
      await updateProfile(user.uid, profile.id, updated);
      triggerHaptic("success");
      setProfile({ ...profile, ...updated });
      setEditing(false);
    } catch {
      triggerHaptic("error");
      setError("Couldn't save your changes. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!user || !profile) return;
    if (!window.confirm(`Delete "${profile.name}"? This can't be undone.`)) return;
    try {
      await deleteProfile(user.uid, profile.id);
      triggerHaptic("medium");
      router.push("/hub/measurements");
    } catch {
      triggerHaptic("error");
      setError("Couldn't delete that profile. Try again.");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-sm text-parchment/50">loading…</p>
      </main>
    );
  }

  if (notFound || !profile) {
    return (
      <main className="min-h-screen px-6 py-10 max-w-xl mx-auto">
        <Link href="/hub/measurements" className="font-mono text-xs uppercase text-parchment/50 hover:text-parchment">
          ← Back to measurements
        </Link>
        <p className="font-body text-parchment/70 mt-6">Couldn&apos;t find that profile.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-xl mx-auto">
      <div className="flex items-center justify-between">
        <Link href="/hub/measurements" className="font-mono text-xs uppercase text-parchment/50 hover:text-parchment">
          ← Back to measurements
        </Link>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="font-mono text-xs uppercase text-parchment/50 hover:text-parchment"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="font-mono text-xs uppercase text-pin-red/70 hover:text-pin-red"
          >
            Delete
          </button>
        </div>
      </div>

      {error && <p className="text-pin-red text-sm font-mono mt-4">{error}</p>}

      {editing ? (
        <form onSubmit={handleSave} className="space-y-4 mt-6">
          <FormField label="Name" required>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
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
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputClass} />
          </FormField>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-chalk-gold text-ink font-display uppercase tracking-wide text-sm rounded-sm py-2.5 hover:bg-chalk-gold/80 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      ) : (
        <div className="mt-6">
          <h1 className="font-display uppercase tracking-wide text-3xl mb-1">{profile.name}</h1>
          <p className="font-mono text-xs text-parchment/40 uppercase tracking-wide mb-5">
            Measurements in {profile.unit === "cm" ? "centimeters" : "inches"}
          </p>

          <dl className="grid grid-cols-2 gap-4 mb-5 font-mono text-sm">
            {STANDARD_FIELDS.filter((f) => profile[f] != null).map((f) => (
              <div key={f}>
                <dt className="text-parchment/40 text-xs uppercase">{FIELD_LABEL[f]}</dt>
                <dd>
                  {profile[f]}
                  {profile.unit}
                </dd>
              </div>
            ))}
          </dl>

          {profile.custom.length > 0 && (
            <div className="mb-5">
              <h2 className="font-mono text-xs uppercase text-parchment/40 mb-2">Custom</h2>
              <dl className="grid grid-cols-2 gap-4 font-mono text-sm">
                {profile.custom.map((row, i) => (
                  <div key={i}>
                    <dt className="text-parchment/40 text-xs uppercase">{row.label}</dt>
                    <dd>
                      {row.value}
                      {profile.unit}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {STANDARD_FIELDS.every((f) => profile[f] == null) && profile.custom.length === 0 && (
            <p className="font-body text-sm text-parchment/60 mb-5">
              No measurements logged yet — edit this profile to add some.
            </p>
          )}

          {profile.notes && (
            <div>
              <h2 className="font-mono text-xs uppercase text-parchment/40 mb-1">Notes</h2>
              <p className="font-body text-sm text-parchment/80 whitespace-pre-wrap">{profile.notes}</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
