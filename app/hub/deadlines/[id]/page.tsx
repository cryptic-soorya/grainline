"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  getDeadline,
  updateDeadline,
  deleteDeadline,
  daysUntil,
  type Deadline,
  type ChecklistItem,
} from "@/lib/deadlines";
import { triggerHaptic } from "@/lib/haptics";
import { FormField, inputClass } from "@/components/FormField";

export default function DeadlineDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [deadline, setDeadline] = useState<Deadline | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editable field state, seeded once the deadline loads.
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.replace("/");
      else setUser(u);
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!user || !params.id) return;
    getDeadline(user.uid, params.id)
      .then((d) => {
        if (!d) {
          setNotFound(true);
          return;
        }
        setDeadline(d);
        setTitle(d.title);
        setCourse(d.course);
        setDueDate(d.dueDate);
        setNotes(d.notes);
        setChecklist(d.checklist);
      })
      .catch(() => setError("Couldn't load that deadline."))
      .finally(() => setLoading(false));
  }, [user, params.id]);

  // Checklist toggles and the completed flag save immediately — these are
  // the actions someone reaches for constantly while working toward a
  // deadline, so they shouldn't require entering edit mode first.
  async function persist(patch: Partial<Pick<Deadline, "checklist" | "completed">>) {
    if (!user || !deadline) return;
    const updated: Deadline = { ...deadline, ...patch };
    setDeadline(updated);
    if (patch.checklist) setChecklist(patch.checklist);
    try {
      await updateDeadline(user.uid, deadline.id, {
        title: updated.title,
        course: updated.course,
        dueDate: updated.dueDate,
        notes: updated.notes,
        checklist: updated.checklist,
        completed: updated.completed,
      });
      triggerHaptic("light");
    } catch {
      triggerHaptic("error");
      setError("Couldn't save that change. Try again.");
    }
  }

  function toggleChecklistItem(i: number) {
    if (!deadline) return;
    const next = deadline.checklist.map((row, idx) => (idx === i ? { ...row, done: !row.done } : row));
    persist({ checklist: next });
  }

  function toggleCompleted() {
    if (!deadline) return;
    persist({ completed: !deadline.completed });
  }

  function addChecklistRow() {
    setChecklist((c) => [...c, { label: "", done: false }]);
  }

  function updateChecklistLabel(i: number, label: string) {
    setChecklist((c) => c.map((row, idx) => (idx === i ? { ...row, label } : row)));
  }

  function removeChecklistRow(i: number) {
    setChecklist((c) => c.filter((_, idx) => idx !== i));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !deadline) return;
    setSaving(true);
    setError(null);
    const updated = {
      title: title.trim(),
      course: course.trim(),
      dueDate,
      notes: notes.trim(),
      checklist: checklist.filter((row) => row.label.trim()),
      completed: deadline.completed,
    };
    try {
      await updateDeadline(user.uid, deadline.id, updated);
      triggerHaptic("success");
      setDeadline({ ...deadline, ...updated });
      setEditing(false);
    } catch {
      triggerHaptic("error");
      setError("Couldn't save your changes. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!user || !deadline) return;
    if (!window.confirm(`Delete "${deadline.title}"? This can't be undone.`)) return;
    try {
      await deleteDeadline(user.uid, deadline.id);
      triggerHaptic("medium");
      router.push("/hub/deadlines");
    } catch {
      triggerHaptic("error");
      setError("Couldn't delete that deadline. Try again.");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-sm text-parchment/50">loading…</p>
      </main>
    );
  }

  if (notFound || !deadline) {
    return (
      <main className="min-h-screen px-6 py-10 max-w-xl mx-auto">
        <Link href="/hub/deadlines" className="font-mono text-xs uppercase text-parchment/50 hover:text-parchment">
          ← Back to deadlines
        </Link>
        <p className="font-body text-parchment/70 mt-6">Couldn&apos;t find that deadline.</p>
      </main>
    );
  }

  const days = daysUntil(deadline.dueDate);
  const dueLabel = deadline.completed
    ? "Done"
    : days < 0
      ? `${Math.abs(days)}d overdue`
      : days === 0
        ? "Due today"
        : `${days}d left`;

  return (
    <main className="min-h-screen px-6 py-10 max-w-xl mx-auto">
      <div className="flex items-center justify-between">
        <Link href="/hub/deadlines" className="font-mono text-xs uppercase text-parchment/50 hover:text-parchment">
          ← Back to deadlines
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
          <FormField label="Title" required>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </FormField>
          <FormField label="Course/project">
            <input type="text" value={course} onChange={(e) => setCourse(e.target.value)} className={inputClass} />
          </FormField>
          <FormField label="Due date" required>
            <input type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} />
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
          <div className="flex items-start justify-between gap-4 mb-1">
            <h1 className={`font-display uppercase tracking-wide text-3xl ${deadline.completed ? "line-through opacity-60" : ""}`}>
              {deadline.title}
            </h1>
            <span
              className={`font-mono text-xs uppercase tracking-wide shrink-0 pt-1 ${
                deadline.completed ? "text-spool-teal" : days < 0 || days === 0 ? "text-pin-red" : "text-parchment/50"
              }`}
            >
              {dueLabel}
            </span>
          </div>
          {deadline.course && <p className="font-mono text-sm text-parchment/60 mb-1">{deadline.course}</p>}
          <p className="font-mono text-xs text-parchment/40 uppercase tracking-wide mb-5">Due {deadline.dueDate}</p>

          <button
            type="button"
            onClick={toggleCompleted}
            className={[
              "w-full font-display uppercase tracking-wide text-sm rounded-sm py-2.5 mb-5 transition-colors",
              deadline.completed
                ? "bg-transparent border border-parchment/20 text-parchment/60 hover:text-parchment"
                : "bg-spool-teal text-parchment hover:bg-spool-teal/80",
            ].join(" ")}
          >
            {deadline.completed ? "Mark not done" : "Mark complete"}
          </button>

          {deadline.checklist.length > 0 && (
            <div className="mb-5">
              <h2 className="font-mono text-xs uppercase text-parchment/40 mb-2">Checklist</h2>
              <div className="space-y-2">
                {deadline.checklist.map((item, i) => (
                  <label key={i} className="flex items-center gap-2 font-body text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => toggleChecklistItem(i)}
                      className="accent-chalk-gold"
                    />
                    <span className={item.done ? "line-through text-parchment/40" : "text-parchment/90"}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {deadline.notes && (
            <div>
              <h2 className="font-mono text-xs uppercase text-parchment/40 mb-1">Notes</h2>
              <p className="font-body text-sm text-parchment/80 whitespace-pre-wrap">{deadline.notes}</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
