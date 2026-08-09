"use client";

import Link from "next/link";

// Placeholder — real functionality (swatch form, search/filter) is Phase 2.
// See PLAN.md for the full field list this will need.
export default function FabricLibraryPage() {
  return (
    <main className="min-h-screen px-6 py-10 max-w-xl mx-auto">
      <Link href="/hub" className="font-mono text-xs uppercase text-parchment/50 hover:text-parchment">
        ← Back to hub
      </Link>
      <h1 className="font-display uppercase tracking-wide text-3xl mt-4 mb-2">
        Fabric Library
      </h1>
      <p className="font-body text-parchment/70">
        Coming in Phase 2 — log swatches with fiber content, GSM, stretch %,
        drape and care instructions, then search your own library.
      </p>
    </main>
  );
}
