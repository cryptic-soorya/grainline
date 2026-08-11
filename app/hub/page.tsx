"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { PatternCard } from "@/components/PatternCard";
import { StitchDivider } from "@/components/StitchDivider";

/**
 * Hub page — the "second page" the brief asked for: after signing in,
 * this is home base. A grid of pattern-piece cards, one per feature.
 * `live: true` cards are real and clickable (Phase 1 stubs route to
 * placeholder pages); `live: false` cards are the visible roadmap —
 * dashed and faded, so anyone testing the app can see what's coming
 * without being able to tap into something unfinished.
 */
export default function HubPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  // Route guard: if nobody's signed in, bounce back to the landing page.
  // onAuthStateChanged fires once immediately with the current state, then
  // again any time sign-in/sign-out happens — so this also handles someone
  // signing out in another tab.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/");
      } else {
        setChecking(false);
      }
    });
    return () => unsub();
  }, [router]);

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-sm text-parchment/50">loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-3xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <h1 className="font-display uppercase tracking-widest text-2xl">
          Grainline
        </h1>
        <button
          type="button"
          onClick={() => signOut(auth)}
          className="font-mono text-xs uppercase tracking-wide text-parchment/50 hover:text-parchment"
        >
          Sign out
        </button>
      </header>

      <div className="text-chalk-gold mb-8 w-full max-w-xs">
        <StitchDivider />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <PatternCard
          title="Fabric Library"
          description="Log swatches with fiber content, weight, stretch and drape — searchable later."
          live={true}
          onOpen={() => router.push("/hub/fabric-library")}
        />
        <PatternCard
          title="Compatibility Check"
          description="Pick an outer fabric, interfacing and lining, get a verdict and why."
          live={true}
          onOpen={() => router.push("/hub/compatibility")}
        />
        <PatternCard
          title="Pattern Calculators"
          description="Dart intake, seam allowance, ease and grading, done for you."
          live={true}
          onOpen={() => router.push("/hub/pattern-math")}
        />
        <PatternCard
          title="Measurements"
          description="Save your own or client measurements, reused across projects."
          live={false}
        />
        <PatternCard
          title="Flashcards"
          description="Terminology and testing-method spaced repetition."
          live={false}
        />
        <PatternCard
          title="Deadlines"
          description="Assignment due dates and submission checklists."
          live={false}
        />
      </div>
    </main>
  );
}
