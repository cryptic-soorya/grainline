"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  getSwatch,
  updateSwatch,
  deleteSwatch,
  DRAPE_LABEL,
  OPACITY_LABEL,
  type Swatch,
  type Drape,
  type Opacity,
} from "@/lib/swatches";
import { resizeImageToDataUrl } from "@/lib/imageResize";
import { triggerHaptic } from "@/lib/haptics";
import { FormField, inputClass } from "@/components/FormField";

export default function SwatchDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [swatch, setSwatch] = useState<Swatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editable field state, seeded once the swatch loads.
  const [name, setName] = useState("");
  const [fiberContent, setFiberContent] = useState("");
  const [gsm, setGsm] = useState("");
  const [stretchPercent, setStretchPercent] = useState("");
  const [drape, setDrape] = useState<Drape | "">("");
  const [opacity, setOpacity] = useState<Opacity | "">("");
  const [care, setCare] = useState("");
  const [notes, setNotes] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.replace("/");
      else setUser(u);
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!user || !params.id) return;
    getSwatch(user.uid, params.id)
      .then((s) => {
        if (!s) {
          setNotFound(true);
          return;
        }
        setSwatch(s);
        setName(s.name);
        setFiberContent(s.fiberContent);
        setGsm(s.gsm != null ? String(s.gsm) : "");
        setStretchPercent(s.stretchPercent != null ? String(s.stretchPercent) : "");
        setDrape(s.drape);
        setOpacity(s.opacity);
        setCare(s.care);
        setNotes(s.notes);
        setPhotoDataUrl(s.photoDataUrl);
      })
      .catch(() => setError("Couldn't load that swatch."))
      .finally(() => setLoading(false));
  }, [user, params.id]);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPhotoDataUrl(await resizeImageToDataUrl(file));
    } catch {
      setError("Couldn't process that photo — try a different one.");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !swatch) return;
    setSaving(true);
    setError(null);
    const updated = {
      name: name.trim(),
      fiberContent: fiberContent.trim(),
      gsm: gsm ? Number(gsm) : null,
      stretchPercent: stretchPercent ? Number(stretchPercent) : null,
      drape,
      opacity,
      care: care.trim(),
      notes: notes.trim(),
      photoDataUrl,
    };
    try {
      await updateSwatch(user.uid, swatch.id, updated);
      triggerHaptic("success");
      setSwatch({ ...swatch, ...updated });
      setEditing(false);
    } catch {
      triggerHaptic("error");
      setError("Couldn't save your changes. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!user || !swatch) return;
    if (!window.confirm(`Delete "${swatch.name}"? This can't be undone.`)) return;
    try {
      await deleteSwatch(user.uid, swatch.id);
      triggerHaptic("medium");
      router.push("/hub/fabric-library");
    } catch {
      triggerHaptic("error");
      setError("Couldn't delete that swatch. Try again.");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-sm text-parchment/50">loading…</p>
      </main>
    );
  }

  if (notFound || !swatch) {
    return (
      <main className="min-h-screen px-6 py-10 max-w-xl mx-auto">
        <Link href="/hub/fabric-library" className="font-mono text-xs uppercase text-parchment/50 hover:text-parchment">
          ← Back to library
        </Link>
        <p className="font-body text-parchment/70 mt-6">Couldn&apos;t find that swatch.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-xl mx-auto">
      <div className="flex items-center justify-between">
        <Link href="/hub/fabric-library" className="font-mono text-xs uppercase text-parchment/50 hover:text-parchment">
          ← Back to library
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
          {photoDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoDataUrl} alt="" className="w-full max-h-56 object-cover rounded-sm cut-line" />
          )}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoChange}
            className="block w-full text-sm font-mono text-parchment/70 file:mr-3 file:py-2 file:px-3 file:rounded-sm file:border-0 file:bg-muslin file:text-ink file:font-display file:uppercase file:text-xs file:tracking-wide file:cursor-pointer"
          />

          <FormField label="Name" required>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </FormField>
          <FormField label="Fiber content">
            <input type="text" value={fiberContent} onChange={(e) => setFiberContent(e.target.value)} className={inputClass} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="GSM (weight)">
              <input type="number" min="0" value={gsm} onChange={(e) => setGsm(e.target.value)} className={inputClass} />
            </FormField>
            <FormField label="Stretch %">
              <input type="number" min="0" max="100" value={stretchPercent} onChange={(e) => setStretchPercent(e.target.value)} className={inputClass} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Drape">
              <select value={drape} onChange={(e) => setDrape(e.target.value as Drape | "")} className={inputClass}>
                <option value="">—</option>
                <option value="structured">Structured</option>
                <option value="medium">Medium drape</option>
                <option value="fluid">Fluid</option>
              </select>
            </FormField>
            <FormField label="Opacity">
              <select value={opacity} onChange={(e) => setOpacity(e.target.value as Opacity | "")} className={inputClass}>
                <option value="">—</option>
                <option value="sheer">Sheer</option>
                <option value="semi-opaque">Semi-opaque</option>
                <option value="opaque">Opaque</option>
              </select>
            </FormField>
          </div>
          <FormField label="Care instructions">
            <textarea value={care} onChange={(e) => setCare(e.target.value)} rows={2} className={inputClass} />
          </FormField>
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
          {swatch.photoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={swatch.photoDataUrl} alt={swatch.name} className="w-full max-h-72 object-cover rounded-sm cut-line mb-5" />
          ) : (
            <div className="w-full h-40 bg-parchment/5 rounded-sm cut-line mb-5 flex items-center justify-center">
              <span className="font-mono text-xs text-parchment/30 uppercase tracking-widest">No photo</span>
            </div>
          )}

          <h1 className="font-display uppercase tracking-wide text-3xl mb-1">{swatch.name}</h1>
          {swatch.fiberContent && <p className="font-mono text-sm text-parchment/60 mb-4">{swatch.fiberContent}</p>}

          <dl className="grid grid-cols-2 gap-4 mb-5 font-mono text-sm">
            {swatch.gsm != null && (
              <div>
                <dt className="text-parchment/40 text-xs uppercase">Weight</dt>
                <dd>{swatch.gsm} gsm</dd>
              </div>
            )}
            {swatch.stretchPercent != null && (
              <div>
                <dt className="text-parchment/40 text-xs uppercase">Stretch</dt>
                <dd>{swatch.stretchPercent}%</dd>
              </div>
            )}
            {swatch.drape && (
              <div>
                <dt className="text-parchment/40 text-xs uppercase">Drape</dt>
                <dd>{DRAPE_LABEL[swatch.drape]}</dd>
              </div>
            )}
            {swatch.opacity && (
              <div>
                <dt className="text-parchment/40 text-xs uppercase">Opacity</dt>
                <dd>{OPACITY_LABEL[swatch.opacity]}</dd>
              </div>
            )}
          </dl>

          {swatch.care && (
            <div className="mb-4">
              <h2 className="font-mono text-xs uppercase text-parchment/40 mb-1">Care</h2>
              <p className="font-body text-sm text-parchment/80 whitespace-pre-wrap">{swatch.care}</p>
            </div>
          )}
          {swatch.notes && (
            <div>
              <h2 className="font-mono text-xs uppercase text-parchment/40 mb-1">Notes</h2>
              <p className="font-body text-sm text-parchment/80 whitespace-pre-wrap">{swatch.notes}</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
