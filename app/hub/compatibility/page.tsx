"use client";

import Link from "next/link";

// Placeholder — real rules-based checker logic is Phase 3. See PLAN.md.
export default function CompatibilityPage() {
  return (
    <main className="min-h-screen px-6 py-10 max-w-xl mx-auto">
      <Link href="/hub" className="font-mono text-xs uppercase text-parchment/50 hover:text-parchment">
        ← Back to hub
      </Link>
      <h1 className="font-display uppercase tracking-wide text-3xl mt-4 mb-2">
        Compatibility Check
      </h1>
      <p className="font-body text-parchment/70">
        Coming in Phase 3 — pick an outer fabric, interfacing and lining and
        get a compatibility verdict with a plain-language explanation.
      </p>
    </main>
  );
}
