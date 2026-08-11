"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  convertYardageForWidth,
  applyBuffer,
  calculateFabricCost,
  calculateTotalCost,
  costPerGarment,
} from "@/lib/yardage";
import { FormField, inputClass } from "@/components/FormField";
import { triggerHaptic } from "@/lib/haptics";

type CalculatorId = "widthConversion" | "cost";

const CALCULATORS: { id: CalculatorId; label: string }[] = [
  { id: "widthConversion", label: "Width conversion" },
  { id: "cost", label: "Cost estimate" },
];

// Parses a form-input string into a number, treating blank/invalid input as
// null rather than NaN — same convention as lib/patternMath.ts's UI.
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

function WidthConversionCalc() {
  const [length, setLength] = useState("");
  const [originalWidth, setOriginalWidth] = useState("");
  const [newWidth, setNewWidth] = useState("");
  const [buffer, setBuffer] = useState("0");

  const l = parseNum(length);
  const ow = parseNum(originalWidth);
  const nw = parseNum(newWidth);
  const b = parseNum(buffer);

  const result = useMemo(() => {
    if (l == null || ow == null || nw == null || nw <= 0) return null;
    const converted = convertYardageForWidth(l, ow, nw);
    const withBuffer = b != null ? applyBuffer(converted, b) : converted;
    return { converted, withBuffer };
  }, [l, ow, nw, b]);

  return (
    <div className="space-y-3">
      <p className="font-mono text-xs text-chalk-gold">
        Use this when a pattern envelope's yardage is printed for a fabric
        width you don&apos;t have — e.g. envelope says 2m at 150cm wide, but
        your fabric is 112cm.
      </p>
      <FormField label="Yardage printed on pattern">
        <input type="number" className={inputClass} value={length} onChange={(e) => setLength(e.target.value)} />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Printed fabric width">
          <input type="number" className={inputClass} value={originalWidth} onChange={(e) => setOriginalWidth(e.target.value)} />
        </FormField>
        <FormField label="Your fabric width">
          <input type="number" className={inputClass} value={newWidth} onChange={(e) => setNewWidth(e.target.value)} />
        </FormField>
      </div>
      <FormField label="Buffer % (nap, print/stripe matching, mistakes)">
        <input type="number" className={inputClass} value={buffer} onChange={(e) => setBuffer(e.target.value)} />
      </FormField>
      {result != null ? (
        <div className="space-y-2">
          <ResultLine label="Converted yardage" value={result.converted.toFixed(2)} />
          <ResultLine label="With buffer" value={result.withBuffer.toFixed(2)} />
        </div>
      ) : (
        <p className="font-mono text-xs text-parchment/50">Fill in yardage and both fabric widths.</p>
      )}
    </div>
  );
}

function CostCalc() {
  const [length, setLength] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [trimsCost, setTrimsCost] = useState("0");
  const [garmentCount, setGarmentCount] = useState("1");

  const l = parseNum(length);
  const p = parseNum(pricePerUnit);
  const t = parseNum(trimsCost);
  const g = parseNum(garmentCount);

  const result = useMemo(() => {
    if (l == null || p == null || t == null) return null;
    const fabricCost = calculateFabricCost(l, p);
    const totalCost = calculateTotalCost(fabricCost, t);
    const perGarment = g != null && g > 0 ? costPerGarment(totalCost, g) : totalCost;
    return { fabricCost, totalCost, perGarment };
  }, [l, p, t, g]);

  return (
    <div className="space-y-3">
      <FormField label="Fabric length needed">
        <input type="number" className={inputClass} value={length} onChange={(e) => setLength(e.target.value)} />
      </FormField>
      <FormField label="Price per unit length">
        <input type="number" className={inputClass} value={pricePerUnit} onChange={(e) => setPricePerUnit(e.target.value)} />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Trims/notions cost (flat)">
          <input type="number" className={inputClass} value={trimsCost} onChange={(e) => setTrimsCost(e.target.value)} />
        </FormField>
        <FormField label="Number of garments">
          <input type="number" className={inputClass} value={garmentCount} onChange={(e) => setGarmentCount(e.target.value)} />
        </FormField>
      </div>
      {result != null ? (
        <div className="space-y-2">
          <ResultLine label="Fabric cost" value={result.fabricCost.toFixed(2)} />
          <ResultLine label="Total cost" value={result.totalCost.toFixed(2)} />
          <ResultLine label="Cost per garment" value={result.perGarment.toFixed(2)} />
        </div>
      ) : (
        <p className="font-mono text-xs text-parchment/50">Fill in fabric length and price per unit.</p>
      )}
    </div>
  );
}

export default function YardagePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<CalculatorId>("widthConversion");

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
      <h1 className="font-display uppercase tracking-wide text-3xl mt-4 mb-2">Yardage &amp; Cost</h1>
      <p className="font-body text-parchment/70 mb-6">
        Convert yardage across fabric widths and estimate what a project will cost — one-off math, nothing saved.
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

      {active === "widthConversion" && <WidthConversionCalc />}
      {active === "cost" && <CostCalc />}
    </main>
  );
}
