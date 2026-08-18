"use client";

import { useState } from "react";
import { updateNote, deleteNote, type Note } from "@/lib/notes";
import { triggerHaptic } from "@/lib/haptics";
import { inputClass } from "@/components/FormField";

// Notes edit/delete inline, right in the card — a note is short enough
// that a separate detail page would just be an extra tap for no reason.
export function NoteCard({
  uid,
  note,
  onDeleted,
  onUpdated,
}: {
  uid: string;
  note: Note;
  onDeleted: (id: string) => void;
  onUpdated: (id: string, text: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(note.text);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const trimmed = text.trim();
    if (!trimmed || trimmed === note.text) {
      setEditing(false);
      setText(note.text);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateNote(uid, note.id, trimmed);
      triggerHaptic("light");
      onUpdated(note.id, trimmed);
      setEditing(false);
    } catch {
      triggerHaptic("error");
      setError("Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this note? This can't be undone.")) return;
    try {
      await deleteNote(uid, note.id);
      triggerHaptic("medium");
      onDeleted(note.id);
    } catch {
      triggerHaptic("error");
      setError("Couldn't delete. Try again.");
    }
  }

  return (
    <div className="rounded-sm p-4 bg-muslin text-ink cut-line">
      {editing ? (
        <div className="space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            autoFocus
            className={inputClass}
          />
          {error && <p className="text-pin-red text-xs font-mono">{error}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="font-mono text-xs uppercase text-chalk-gold hover:text-chalk-gold/70 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setText(note.text);
                setError(null);
              }}
              className="font-mono text-xs uppercase text-ink/50 hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="font-body text-sm whitespace-pre-wrap">{note.text}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="font-mono text-[11px] text-ink/40">
              {note.createdAt?.toDate().toLocaleDateString(undefined, { month: "short", day: "numeric" }) ?? ""}
            </span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="font-mono text-xs uppercase text-ink/50 hover:text-ink"
              >
                Edit
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
          {error && <p className="text-pin-red text-xs font-mono mt-1">{error}</p>}
        </div>
      )}
    </div>
  );
}
