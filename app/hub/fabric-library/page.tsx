"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { listSwatches, type Swatch, type Drape, type Opacity } from "@/lib/swatches";
import { SwatchCard } from "@/components/SwatchCard";

/**
 * Fabric Library — Phase 2. A personal, searchable swatch collection.
 * Filtering/search runs client-side over the user's own swatches, which is
 * fine at this scale (one student's library, not a shared catalog) and
 * avoids needing Firestore composite indexes for every filter combination.
 */
export default function FabricLibraryPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [swatches, setSwatches] = useState<Swatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [drapeFilter, setDrapeFilter] = useState<Drape | "">("");
  const [opacityFilter, setOpacityFilter] = useState<Opacity | "">("");

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
    listSwatches(user.uid)
      .then(setSwatches)
      .catch(() => setError("Couldn't load your fabric library. Try again."))
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return swatches.filter((s) => {
      if (drapeFilter && s.drape !== drapeFilter) return false;
      if (opacityFilter && s.opacity !== opacityFilter) return false;
      if (!term) return true;
      const haystack = [s.name, s.fiberContent, s.care, s.notes].join(" ").toLowerCase();
      return haystack.includes(term);
    });
  }, [swatches, search, drapeFilter, opacityFilter]);

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
        <h1 className="font-display uppercase tracking-wide text-3xl">Fabric Library</h1>
        <Link
          href="/hub/fabric-library/new"
          className="shrink-0 font-display uppercase tracking-wide text-xs bg-chalk-gold text-ink rounded-sm px-4 py-2 hover:bg-chalk-gold/80 transition-colors"
        >
          + Add swatch
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          type="text"
          placeholder="Search name, fiber, notes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-muslin text-ink border border-ink/15 rounded-sm px-3 py-2 font-mono text-sm focus:outline-none focus:border-chalk-gold"
        />
        <select
          value={drapeFilter}
          onChange={(e) => setDrapeFilter(e.target.value as Drape | "")}
          className="bg-muslin text-ink border border-ink/15 rounded-sm px-3 py-2 font-mono text-sm focus:outline-none focus:border-chalk-gold"
        >
          <option value="">Any drape</option>
          <option value="structured">Structured</option>
          <option value="medium">Medium drape</option>
          <option value="fluid">Fluid</option>
        </select>
        <select
          value={opacityFilter}
          onChange={(e) => setOpacityFilter(e.target.value as Opacity | "")}
          className="bg-muslin text-ink border border-ink/15 rounded-sm px-3 py-2 font-mono text-sm focus:outline-none focus:border-chalk-gold"
        >
          <option value="">Any opacity</option>
          <option value="sheer">Sheer</option>
          <option value="semi-opaque">Semi-opaque</option>
          <option value="opaque">Opaque</option>
        </select>
      </div>

      {error && <p className="text-pin-red text-sm font-mono mb-4">{error}</p>}

      {loading ? (
        <p className="font-mono text-sm text-parchment/50">loading…</p>
      ) : filtered.length === 0 ? (
        <p className="font-body text-sm text-parchment/60">
          {swatches.length === 0
            ? "No swatches yet — add your first one."
            : "Nothing matches that search/filter."}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filtered.map((s) => (
            <SwatchCard key={s.id} swatch={s} />
          ))}
        </div>
      )}
    </main>
  );
}
