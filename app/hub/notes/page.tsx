"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { listNotes, createNote, type Note } from "@/lib/notes";
import { NoteCard } from "@/components/NoteCard";
import { triggerHaptic } from "@/lib/haptics";
import { inputClass } from "@/components/FormField";

/**
 * Notes — a quick-capture area for short freeform notes (a fitting tip, a
 * term to look up, a reminder), searchable by substring since there's no
 * structure to filter on otherwise. One page, no separate add/detail
 * routes: everything happens inline because a note is short enough that
 * navigating away to write or edit one would just be friction.
 */
export default function NotesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.replace("/");
      } else {
        setUser(u);
        setChecking(false);
      }
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    listNotes(user.uid)
      .then(setNotes)
      .catch(() => setError("Couldn't load your notes. Try again."))
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((n) => n.text.toLowerCase().includes(q));
  }, [notes, search]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const text = draft.trim();
    if (!text) return;
    setAdding(true);
    setError(null);
    try {
      const id = await createNote(user.uid, text);
      setNotes((prev) => [{ id, text, createdAt: null, updatedAt: null }, ...prev]);
      setDraft("");
      triggerHaptic("success");
    } catch {
      triggerHaptic("error");
      setError("Couldn't save that note. Try again.");
    } finally {
      setAdding(false);
    }
  }

  function handleDeleted(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  function handleUpdated(id: string, text: string) {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, text } : n)));
  }

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-sm text-parchment/50">loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-3xl mx-auto">
      <Link href="/hub" className="font-mono text-xs uppercase text-parchment/50 hover:text-parchment">
        ← Back to hub
      </Link>

      <h1 className="font-display uppercase tracking-wide text-3xl mt-4 mb-6">Notes</h1>

      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Jot something down…"
          rows={2}
          className={`${inputClass} flex-1`}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAdd(e);
            }
          }}
        />
        <button
          type="submit"
          disabled={adding || !draft.trim()}
          className="shrink-0 self-start font-display uppercase tracking-wide text-xs bg-chalk-gold text-ink rounded-sm px-4 py-2.5 hover:bg-chalk-gold/80 transition-colors disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {notes.length > 0 && (
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes…"
          className={`${inputClass} mb-6`}
        />
      )}

      {error && <p className="text-pin-red text-sm font-mono mb-4">{error}</p>}

      {loading ? (
        <p className="font-mono text-sm text-parchment/50">loading…</p>
      ) : filtered.length === 0 ? (
        <p className="font-body text-sm text-parchment/60">
          {notes.length === 0 ? "No notes yet — add your first one above." : "No notes match your search."}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filtered.map((n) => (
            <NoteCard key={n.id} uid={user!.uid} note={n} onDeleted={handleDeleted} onUpdated={handleUpdated} />
          ))}
        </div>
      )}
    </main>
  );
}
