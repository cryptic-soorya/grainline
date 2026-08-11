"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createDeadline, type ChecklistItem } from "@/lib/deadlines";
import { triggerHaptic } from "@/lib/haptics";
import { FormField, inputClass } from "@/components/FormField";

export default function NewDeadlinePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.replace("/");
      else setUser(u);
    });
    return () => unsub();
  }, [router]);

  function addChecklistRow() {
    setChecklist((c) => [...c, { label: "", done: false }]);
  }

  function updateChecklistLabel(i: number, label: string) {
    setChecklist((c) => c.map((row, idx) => (idx === i ? { ...row, label } : row)));
  }

  function removeChecklistRow(i: number) {
    setChecklist((c) => c.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setSaving(true);
    try {
      const id = await createDeadline(user.uid, {
        title: title.trim(),
        course: course.trim(),
        dueDate,
        notes: notes.trim(),
        checklist: checklist.filter((row) => row.label.trim()),
        completed: false,
      });
      triggerHaptic("success");
      router.push(`/hub/deadlines/${id}`);
    } catch {
      triggerHaptic("error");
      setError("Couldn't save that deadline. Try again.");
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-xl mx-auto">
      <Link href="/hub/deadlines" className="font-mono text-xs uppercase text-parchment/50 hover:text-parchment">
        ← Back to deadlines
      </Link>
      <h1 className="font-display uppercase tracking-wide text-3xl mt-4 mb-6">Add deadline</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Title" required>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Toile submission"
            className={inputClass}
          />
        </FormField>

        <FormField label="Course/project">
          <input
            type="text"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            placeholder="e.g. Pattern Cutting II"
            className={inputClass}
          />
        </FormField>

        <FormField label="Due date" required>
          <input
            type="date"
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputClass}
          />
        </FormField>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="block font-mono text-xs uppercase tracking-wide text-parchment/60">
              Submission checklist
            </span>
            <button
              type="button"
              onClick={addChecklistRow}
              className="font-mono text-xs uppercase text-chalk-gold hover:text-chalk-gold/70"
            >
              + Add
            </button>
          </div>
          {checklist.length === 0 && (
            <p className="font-body text-xs text-parchment/40">
              e.g. Print pattern, cut toile, stitch samples, mount board
            </p>
          )}
          <div className="space-y-2">
            {checklist.map((row, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Checklist item"
                  value={row.label}
                  onChange={(e) => updateChecklistLabel(i, e.target.value)}
                  className={`${inputClass} flex-1`}
                />
                <button
                  type="button"
                  onClick={() => removeChecklistRow(i)}
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
            placeholder="Anything else worth remembering — brief details, submission format, etc."
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
          {saving ? "Saving…" : "Save deadline"}
        </button>
      </form>
    </main>
  );
}
