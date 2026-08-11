"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { listProfiles, type MeasurementProfile } from "@/lib/measurements";
import { MeasurementCard } from "@/components/MeasurementCard";

/**
 * Measurements — Phase 5. A list of measurement profiles (self or client),
 * each reusable across many pattern projects. Same client-side-search shape
 * as the fabric library — one student's list, not a shared catalog.
 */
export default function MeasurementsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [profiles, setProfiles] = useState<MeasurementProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

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
    listProfiles(user.uid)
      .then(setProfiles)
      .catch(() => setError("Couldn't load your measurements. Try again."))
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return profiles;
    return profiles.filter((p) => [p.name, p.notes].join(" ").toLowerCase().includes(term));
  }, [profiles, search]);

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
        <h1 className="font-display uppercase tracking-wide text-3xl">Measurements</h1>
        <Link
          href="/hub/measurements/new"
          className="shrink-0 font-display uppercase tracking-wide text-xs bg-chalk-gold text-ink rounded-sm px-4 py-2 hover:bg-chalk-gold/80 transition-colors"
        >
          + Add profile
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search name, notes…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-muslin text-ink border border-ink/15 rounded-sm px-3 py-2 font-mono text-sm focus:outline-none focus:border-chalk-gold mb-8"
      />

      {error && <p className="text-pin-red text-sm font-mono mb-4">{error}</p>}

      {loading ? (
        <p className="font-mono text-sm text-parchment/50">loading…</p>
      ) : filtered.length === 0 ? (
        <p className="font-body text-sm text-parchment/60">
          {profiles.length === 0
            ? "No measurement profiles yet — add your first one."
            : "Nothing matches that search."}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filtered.map((p) => (
            <MeasurementCard key={p.id} profile={p} />
          ))}
        </div>
      )}
    </main>
  );
}
