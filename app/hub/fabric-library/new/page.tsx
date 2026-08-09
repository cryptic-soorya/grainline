"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createSwatch, type Drape, type Opacity } from "@/lib/swatches";
import { resizeImageToDataUrl } from "@/lib/imageResize";
import { triggerHaptic } from "@/lib/haptics";
import { FormField, inputClass } from "@/components/FormField";

export default function NewSwatchPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const [name, setName] = useState("");
  const [fiberContent, setFiberContent] = useState("");
  const [gsm, setGsm] = useState("");
  const [stretchPercent, setStretchPercent] = useState("");
  const [drape, setDrape] = useState<Drape | "">("");
  const [opacity, setOpacity] = useState<Opacity | "">("");
  const [care, setCare] = useState("");
  const [notes, setNotes] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.replace("/");
      else setUser(u);
    });
    return () => unsub();
  }, [router]);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    try {
      setPhotoDataUrl(await resizeImageToDataUrl(file));
    } catch {
      setPhotoError("Couldn't process that photo — try a different one.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setSaving(true);
    try {
      const id = await createSwatch(user.uid, {
        name: name.trim(),
        fiberContent: fiberContent.trim(),
        gsm: gsm ? Number(gsm) : null,
        stretchPercent: stretchPercent ? Number(stretchPercent) : null,
        drape,
        opacity,
        care: care.trim(),
        notes: notes.trim(),
        photoDataUrl,
      });
      triggerHaptic("success");
      router.push(`/hub/fabric-library/${id}`);
    } catch {
      triggerHaptic("error");
      setError("Couldn't save that swatch. Try again.");
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-xl mx-auto">
      <Link href="/hub/fabric-library" className="font-mono text-xs uppercase text-parchment/50 hover:text-parchment">
        ← Back to library
      </Link>
      <h1 className="font-display uppercase tracking-wide text-3xl mt-4 mb-6">Add swatch</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-parchment/60 mb-2">
            Photo
          </label>
          {photoDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoDataUrl} alt="" className="w-full max-h-56 object-cover rounded-sm mb-2 cut-line" />
          )}
          {/* capture="environment" hints mobile browsers to open the back
              camera directly instead of just a file picker. */}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoChange}
            className="block w-full text-sm font-mono text-parchment/70 file:mr-3 file:py-2 file:px-3 file:rounded-sm file:border-0 file:bg-muslin file:text-ink file:font-display file:uppercase file:text-xs file:tracking-wide file:cursor-pointer"
          />
          {photoError && <p className="text-pin-red text-xs font-mono mt-1">{photoError}</p>}
        </div>

        <FormField label="Name" required>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Navy cotton twill"
            className={inputClass}
          />
        </FormField>

        <FormField label="Fiber content">
          <input
            type="text"
            value={fiberContent}
            onChange={(e) => setFiberContent(e.target.value)}
            placeholder="e.g. 98% cotton, 2% elastane"
            className={inputClass}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="GSM (weight)">
            <input
              type="number"
              min="0"
              value={gsm}
              onChange={(e) => setGsm(e.target.value)}
              placeholder="e.g. 220"
              className={inputClass}
            />
          </FormField>
          <FormField label="Stretch %">
            <input
              type="number"
              min="0"
              max="100"
              value={stretchPercent}
              onChange={(e) => setStretchPercent(e.target.value)}
              placeholder="e.g. 15"
              className={inputClass}
            />
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
          <textarea
            value={care}
            onChange={(e) => setCare(e.target.value)}
            placeholder="e.g. Machine wash cold, line dry"
            rows={2}
            className={inputClass}
          />
        </FormField>

        <FormField label="Notes">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything else worth remembering about this fabric"
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
          {saving ? "Saving…" : "Save swatch"}
        </button>
      </form>
    </main>
  );
}
