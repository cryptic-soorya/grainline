"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc, collection, writeBatch, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { StitchDivider } from "@/components/StitchDivider";
import { triggerHaptic } from "@/lib/haptics";
import { STARTER_FABRICS } from "@/lib/starterFabrics";

/**
 * Landing page = wordmark + auth. This is the first thing anyone sees, so
 * it's where we spend the "hero" moment the design brief calls for: the
 * stitch-line motif draws itself in on load, then the auth card fades up
 * underneath. After signing in, we send people straight to /hub.
 */
export default function LandingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Every new user gets a Firestore profile doc the first time they sign
  // in. This is also where user-count tracking comes from later — you can
  // just count documents in the `users` collection instead of building
  // separate analytics.
  async function ensureUserDoc(uid: string, emailAddr: string | null) {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        email: emailAddr,
        createdAt: serverTimestamp(),
        isFounder: false, // set to true manually for the girlfriend's account
      });
      await seedStarterFabrics(uid);
    }
  }

  // Every brand-new account starts with a small reference fabric library
  // (see lib/starterFabrics.ts) instead of an empty one — gives people
  // something to look at/edit immediately rather than a blank screen.
  // A single batch write keeps this atomic and cheap (one round trip).
  async function seedStarterFabrics(uid: string) {
    const batch = writeBatch(db);
    const swatchesRef = collection(db, "users", uid, "swatches");
    for (const fabric of STARTER_FABRICS) {
      const swatchDoc = doc(swatchesRef);
      batch.set(swatchDoc, {
        ...fabric,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    await batch.commit();
  }

  async function handleGoogleSignIn() {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      await ensureUserDoc(result.user.uid, result.user.email);
      triggerHaptic("success");
      router.push("/hub");
    } catch (err) {
      setError("Couldn't sign in with Google. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result =
        mode === "signup"
          ? await createUserWithEmailAndPassword(auth, email, password)
          : await signInWithEmailAndPassword(auth, email, password);
      await ensureUserDoc(result.user.uid, result.user.email);
      triggerHaptic("success");
      router.push("/hub");
    } catch (err) {
      triggerHaptic("error");
      setError(
        mode === "signup"
          ? "Couldn't create that account — check the email/password."
          : "Couldn't sign in — check your email and password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      {/* Wordmark + stitch reveal */}
      <div className="mb-10 text-center">
        <h1 className="font-display uppercase tracking-widest text-5xl sm:text-6xl text-parchment animate-fade-up">
          Grainline
        </h1>
        <div className="w-56 sm:w-72 mx-auto mt-3 text-chalk-gold">
          <StitchDivider delayMs={300} />
        </div>
        <p className="font-body text-sm text-parchment/70 mt-4 max-w-xs mx-auto">
          A fabric library and study tool built for the material world you
          actually work in.
        </p>
      </div>

      {/* Auth card — muslin surface, dashed cut-line border, like every
          other card in the app */}
      <div className="w-full max-w-sm bg-muslin text-ink rounded-sm cut-line p-6 animate-fade-up" style={{ animationDelay: "500ms" }}>
        <div className="flex mb-5 font-display uppercase text-sm tracking-wide">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex-1 pb-2 border-b-2 ${
              mode === "signin" ? "border-chalk-gold" : "border-transparent opacity-50"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 pb-2 border-b-2 ${
              mode === "signup" ? "border-chalk-gold" : "border-transparent opacity-50"
            }`}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-parchment border border-ink/20 rounded-sm px-3 py-2 font-mono text-sm focus:outline-none focus:border-chalk-gold"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-parchment border border-ink/20 rounded-sm px-3 py-2 font-mono text-sm focus:outline-none focus:border-chalk-gold"
          />
          {error && <p className="text-pin-red text-xs font-mono">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-parchment font-display uppercase tracking-wide text-sm rounded-sm py-2.5 hover:bg-spool-teal transition-colors disabled:opacity-50"
          >
            {mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4 text-ink/40 text-xs font-mono uppercase">
          <div className="flex-1 h-px bg-ink/15" />
          or
          <div className="flex-1 h-px bg-ink/15" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full border border-ink/25 rounded-sm py-2.5 font-body text-sm hover:bg-ink/5 transition-colors disabled:opacity-50"
        >
          Continue with Google
        </button>
      </div>
    </main>
  );
}
