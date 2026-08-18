"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { listDeadlines, type Deadline } from "@/lib/deadlines";
import { DeadlineCard } from "@/components/DeadlineCard";
import { DeadlineReminders } from "@/components/DeadlineReminders";

/**
 * Deadlines — Phase 5. Assignment/project due dates with a submission
 * checklist per deadline. Defaults to hiding completed items so the list
 * a student actually needs (what's still coming up) isn't buried.
 */
export default function DeadlinesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

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
    listDeadlines(user.uid)
      .then(setDeadlines)
      .catch(() => setError("Couldn't load your deadlines. Try again."))
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = useMemo(
    () => (showCompleted ? deadlines : deadlines.filter((d) => !d.completed)),
    [deadlines, showCompleted]
  );

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

      <div className="flex items-center justify-between mt-4 mb-6 gap-4">
        <h1 className="font-display uppercase tracking-wide text-3xl">Deadlines</h1>
        <Link
          href="/hub/deadlines/new"
          className="shrink-0 font-display uppercase tracking-wide text-xs bg-chalk-gold text-ink rounded-sm px-4 py-2 hover:bg-chalk-gold/80 transition-colors"
        >
          + Add deadline
        </Link>
      </div>

      {user && <DeadlineReminders uid={user.uid} />}

      <label className="flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-parchment/60 mb-8">
        <input
          type="checkbox"
          checked={showCompleted}
          onChange={(e) => setShowCompleted(e.target.checked)}
          className="accent-chalk-gold"
        />
        Show completed
      </label>

      {error && <p className="text-pin-red text-sm font-mono mb-4">{error}</p>}

      {loading ? (
        <p className="font-mono text-sm text-parchment/50">loading…</p>
      ) : filtered.length === 0 ? (
        <p className="font-body text-sm text-parchment/60">
          {deadlines.length === 0
            ? "No deadlines yet — add your first one."
            : "Nothing here — everything's marked done."}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filtered.map((d) => (
            <DeadlineCard key={d.id} deadline={d} />
          ))}
        </div>
      )}
    </main>
  );
}
