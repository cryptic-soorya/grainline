"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  addSeamAllowance,
  removeSeamAllowance,
  calculateEase,
  garmentFromEasePercent,
  calculateDartIntake,
  gradeMeasurement,
} from "@/lib/patternMath";
import { FormField, inputClass } from "@/components/FormField";
import { triggerHaptic } from "@/lib/haptics";

type CalculatorId = "seamAllowance" | "ease" | "dartIntake" | "grading";

const CALCULATORS: { id: CalculatorId; label: string }[] = [
  { id: "seamAllowance", label: "Seam allowance" },
  { id: "ease", label: "Ease %" },
  { id: "dartIntake", label: "Dart intake" },
  { id: "grading", label: "Grading" },
];

// Parses a form-input string into a number, treating blank/invalid input as
// null rather than NaN — every calculator below only computes once all its
// required fields parse cleanly, and shows a prompt instead of 0/NaN garbage.
function parseNum(s: string): number | null {
  if (s.trim() === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function ResultLine({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="cut-line bg-muslin text-ink rounded-sm px-4 py-3 flex items-baseline justify-between">
      <span className="font-body text-sm">{label}</span>
      <span className="font-mono text-lg text-spool-teal">
        {value}
        {suffix}
      </span>
    </div>
  );
}

function SeamAllowanceCalc() {
  const [mode, setMode] = useState<"add" | "remove">("add");
  const [measurement, setMeasurement] = useState("");
  const [seamAllowance, setSeamAllowance] = useState("1.5");
  const [edges, setEdges] = useState("1");

  const m = parseNum(measurement);
  const sa = parseNum(seamAllowance);
  const e = parseNum(edges);

  const result = useMemo(() => {
    if (m == null || sa == null || e == null) return null;
    return mode === "add" ? addSeamAllowance(m, sa, e) : removeSeamAllowance(m, sa, e);
  }, [m, sa, e, mode]);

  return (
    <div className="space-y-3">
      <div className="flex gap-1 font-mono text-xs uppercase">
        {(["add", "remove"] as const).map((mo) => (
          <button
            key={mo}
            type="button"
            onClick={() => setMode(mo)}
            className={[
              "px-2 py-1 rounded-sm border",
              mode === mo ? "bg-chalk-gold border-chalk-gold text-ink" : "border-parchment/20 text-parchment/60",
            ].join(" ")}
          >
            {mo === "add" ? "Finished → cutting" : "Cutting → finished"}
          </button>
        ))}
      </div>
      <FormField label={mode === "add" ? "Finished measurement" : "Cutting measurement"}>
        <input type="number" className={inputClass} value={measurement} onChange={(e) => setMeasurement(e.target.value)} />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Seam allowance">
          <input type="number" className={inputClass} value={seamAllowance} onChange={(e) => setSeamAllowance(e.target.value)} />
        </FormField>
        <FormField label="Edges (1 or 2)">
          <input type="number" className={inputClass} value={edges} onChange={(e) => setEdges(e.target.value)} />
        </FormField>
      </div>
      {result != null ? (
        <ResultLine label={mode === "add" ? "Cutting measurement" : "Finished measurement"} value={result.toFixed(2)} />
      ) : (
        <p className="font-mono text-xs text-parchment/50">Fill in all three fields.</p>
      )}
    </div>
  );
}

function EaseCalc() {
  const [mode, setMode] = useState<"fromGarment" | "fromPercent">("fromGarment");
  const [body, setBody] = useState("");
  const [garment, setGarment] = useState("");
  const [percent, setPercent] = useState("");

  const b = parseNum(body);
  const g = parseNum(garment);
  const p = parseNum(percent);

  return (
    <div className="space-y-3">
      <div className="flex gap-1 font-mono text-xs uppercase">
        {(["fromGarment", "fromPercent"] as const).map((mo) => (
          <button
            key={mo}
            type="button"
            onClick={() => setMode(mo)}
            className={[
              "px-2 py-1 rounded-sm border",
              mode === mo ? "bg-chalk-gold border-chalk-gold text-ink" : "border-parchment/20 text-parchment/60",
            ].join(" ")}
          >
            {mo === "fromGarment" ? "Have garment measurement" : "Have target ease %"}
          </button>
        ))}
      </div>
      <FormField label="Body measurement">
        <input type="number" className={inputClass} value={body} onChange={(e) => setBody(e.target.value)} />
      </FormField>
      {mode === "fromGarment" ? (
        <>
          <FormField label="Garment measurement">
            <input type="number" className={inputClass} value={garment} onChange={(e) => setGarment(e.target.value)} />
          </FormField>
          {b != null && g != null ? (
            (() => {
              const r = calculateEase(b, g);
              return (
                <div className="space-y-2">
                  <ResultLine label="Ease" value={r.ease.toFixed(2)} />
                  <ResultLine label="Ease %" value={r.easePercent.toFixed(1)} suffix="%" />
                </div>
              );
            })()
          ) : (
            <p className="font-mono text-xs text-parchment/50">Fill in both measurements.</p>
          )}
        </>
      ) : (
        <>
          <FormField label="Target ease %">
            <input type="number" className={inputClass} value={percent} onChange={(e) => setPercent(e.target.value)} />
          </FormField>
          {b != null && p != null ? (
            <ResultLine label="Garment measurement" value={garmentFromEasePercent(b, p).toFixed(2)} />
          ) : (
            <p className="font-mono text-xs text-parchment/50">Fill in body measurement and target ease %.</p>
          )}
        </>
      )}
    </div>
  );
}

function DartIntakeCalc() {
  const [larger, setLarger] = useState("");
  const [smaller, setSmaller] = useState("");
  const [dartCount, setDartCount] = useState("2");

  const l = parseNum(larger);
  const s = parseNum(smaller);
  const d = parseNum(dartCount);

  const result = l != null && s != null && d != null && d > 0 ? calculateDartIntake(l, s, d) : null;

  return (
    <div className="space-y-3">
      <p className="font-mono text-xs text-chalk-gold">
        Use pattern-piece measurements (e.g. half-bust/half-waist for a front
        bodice on the fold), not full body circumference — otherwise this
        will come out double what the pattern actually needs.
      </p>
      <FormField label="Larger measurement (e.g. half-bust)">
        <input type="number" className={inputClass} value={larger} onChange={(e) => setLarger(e.target.value)} />
      </FormField>
      <FormField label="Smaller measurement (e.g. half-waist)">
        <input type="number" className={inputClass} value={smaller} onChange={(e) => setSmaller(e.target.value)} />
      </FormField>
      <FormField label="Number of darts">
        <input type="number" className={inputClass} value={dartCount} onChange={(e) => setDartCount(e.target.value)} />
      </FormField>
      {result != null ? (
        <ResultLine label="Intake per dart" value={result.toFixed(2)} />
      ) : (
        <p className="font-mono text-xs text-parchment/50">Fill in both measurements and a dart count above 0.</p>
      )}
    </div>
  );
}

function GradingCalc() {
  const [base, setBase] = useState("");
  const [increment, setIncrement] = useState("");
  const [steps, setSteps] = useState("1");

  const b = parseNum(base);
  const inc = parseNum(increment);
  const s = parseNum(steps);

  const result = b != null && inc != null && s != null ? gradeMeasurement(b, inc, s) : null;

  return (
    <div className="space-y-3">
      <FormField label="Base measurement">
        <input type="number" className={inputClass} value={base} onChange={(e) => setBase(e.target.value)} />
      </FormField>
      <FormField label="Increment per size">
        <input type="number" className={inputClass} value={increment} onChange={(e) => setIncrement(e.target.value)} />
      </FormField>
      <FormField label="Size steps (negative to grade down)">
        <input type="number" className={inputClass} value={steps} onChange={(e) => setSteps(e.target.value)} />
      </FormField>
      {result != null ? (
        <ResultLine label="Graded measurement" value={result.toFixed(2)} />
      ) : (
        <p className="font-mono text-xs text-parchment/50">Fill in base measurement and increment.</p>
      )}
    </div>
  );
}

export default function PatternMathPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<CalculatorId>("seamAllowance");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.replace("/");
        return;
      }
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  if (loading || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-sm text-parchment/50">loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-xl mx-auto">
      <Link href="/hub" className="font-mono text-xs uppercase text-parchment/50 hover:text-parchment">
        ← Back to hub
      </Link>
      <h1 className="font-display uppercase tracking-wide text-3xl mt-4 mb-2">Pattern Calculators</h1>
      <p className="font-body text-parchment/70 mb-6">
        Dart intake, seam allowance, ease and grading — one-off math, nothing saved.
      </p>

      <div className="flex flex-wrap gap-1 mb-5 font-mono text-xs uppercase">
        {CALCULATORS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              triggerHaptic("light");
              setActive(c.id);
            }}
            className={[
              "px-3 py-2 rounded-sm border",
              active === c.id ? "bg-chalk-gold border-chalk-gold text-ink" : "border-parchment/20 text-parchment/60",
            ].join(" ")}
          >
            {c.label}
          </button>
        ))}
      </div>

      {active === "seamAllowance" && <SeamAllowanceCalc />}
      {active === "ease" && <EaseCalc />}
      {active === "dartIntake" && <DartIntakeCalc />}
      {active === "grading" && <GradingCalc />}
    </main>
  );
}
