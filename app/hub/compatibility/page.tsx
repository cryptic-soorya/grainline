"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { listSwatches, DRAPE_LABEL, OPACITY_LABEL, type Swatch, type Drape, type Opacity } from "@/lib/swatches";
import { checkCompatibility, type FabricSpec, type CheckResult, VERDICT_LABEL } from "@/lib/compatibility";
import { FormField, inputClass } from "@/components/FormField";
import { triggerHaptic } from "@/lib/haptics";

type Role = "outer" | "interfacing" | "lining";
type Mode = "none" | "select" | "manual";

interface ManualEntry {
  gsm: string;
  stretchPercent: string;
  drape: Drape | "";
  opacity: Opacity | "";
  care: string;
}

const EMPTY_MANUAL: ManualEntry = { gsm: "", stretchPercent: "", drape: "", opacity: "", care: "" };

const ROLE_META: Record<Role, { title: string; hint: string; canSkip: boolean }> = {
  outer: { title: "Outer fabric", hint: "The main shell fabric.", canSkip: false },
  interfacing: { title: "Interfacing", hint: "Optional — collars, cuffs, plackets.", canSkip: true },
  lining: { title: "Lining", hint: "Optional — inner layer.", canSkip: true },
};

function swatchToSpec(s: Swatch): FabricSpec {
  return {
    label: s.name || "Unnamed swatch",
    gsm: s.gsm,
    stretchPercent: s.stretchPercent,
    drape: s.drape,
    opacity: s.opacity,
    care: s.care,
  };
}

function manualToSpec(label: string, m: ManualEntry): FabricSpec {
  return {
    label: label || "Manual entry",
    gsm: m.gsm ? Number(m.gsm) : null,
    stretchPercent: m.stretchPercent ? Number(m.stretchPercent) : null,
    drape: m.drape,
    opacity: m.opacity,
    care: m.care,
  };
}

/**
 * One fabric role's picker: choose an existing swatch from the library, or
 * type in specs by hand for a fabric that isn't saved yet. Interfacing and
 * lining can also be skipped entirely — not every garment uses both.
 */
function FabricSlot({
  role,
  swatches,
  mode,
  setMode,
  swatchId,
  setSwatchId,
  manual,
  setManual,
}: {
  role: Role;
  swatches: Swatch[];
  mode: Mode;
  setMode: (m: Mode) => void;
  swatchId: string;
  setSwatchId: (id: string) => void;
  manual: ManualEntry;
  setManual: (m: ManualEntry) => void;
}) {
  const meta = ROLE_META[role];

  return (
    <div className="cut-line bg-muslin text-ink rounded-sm p-4">
      <h3 className="font-display uppercase tracking-wide text-lg">{meta.title}</h3>
      <p className="font-body text-xs text-ink/60 mb-3">{meta.hint}</p>

      <div className="flex gap-1 mb-3 font-mono text-xs uppercase">
        {(meta.canSkip ? (["none", "select", "manual"] as Mode[]) : (["select", "manual"] as Mode[])).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={[
              "px-2 py-1 rounded-sm border",
              mode === m ? "bg-chalk-gold border-chalk-gold text-ink" : "border-ink/20 text-ink/60",
            ].join(" ")}
          >
            {m === "none" ? "Skip" : m === "select" ? "From library" : "Manual"}
          </button>
        ))}
      </div>

      {mode === "select" && (
        <FormField label="Swatch">
          <select
            className={inputClass}
            value={swatchId}
            onChange={(e) => setSwatchId(e.target.value)}
          >
            <option value="">Choose a swatch…</option>
            {swatches.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name || "Unnamed swatch"}
              </option>
            ))}
          </select>
        </FormField>
      )}

      {mode === "manual" && (
        <div className="grid grid-cols-2 gap-3">
          <FormField label="GSM">
            <input
              type="number"
              className={inputClass}
              value={manual.gsm}
              onChange={(e) => setManual({ ...manual, gsm: e.target.value })}
            />
          </FormField>
          <FormField label="Stretch %">
            <input
              type="number"
              className={inputClass}
              value={manual.stretchPercent}
              onChange={(e) => setManual({ ...manual, stretchPercent: e.target.value })}
            />
          </FormField>
          <FormField label="Drape">
            <select
              className={inputClass}
              value={manual.drape}
              onChange={(e) => setManual({ ...manual, drape: e.target.value as Drape | "" })}
            >
              <option value="">—</option>
              {Object.entries(DRAPE_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Opacity">
            <select
              className={inputClass}
              value={manual.opacity}
              onChange={(e) => setManual({ ...manual, opacity: e.target.value as Opacity | "" })}
            >
              <option value="">—</option>
              {Object.entries(OPACITY_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </FormField>
          <div className="col-span-2">
            <FormField label="Care">
              <input
                type="text"
                className={inputClass}
                placeholder="e.g. Dry clean only"
                value={manual.care}
                onChange={(e) => setManual({ ...manual, care: e.target.value })}
              />
            </FormField>
          </div>
        </div>
      )}
    </div>
  );
}

const REASON_STYLE: Record<string, string> = {
  pass: "border-spool-teal text-spool-teal",
  warn: "border-chalk-gold text-chalk-gold",
  fail: "border-pin-red text-pin-red",
};

const VERDICT_STYLE: Record<string, string> = {
  good: "bg-spool-teal text-parchment",
  workable: "bg-chalk-gold text-ink",
  caution: "bg-pin-red text-parchment",
};

export default function CompatibilityPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [swatches, setSwatches] = useState<Swatch[]>([]);
  const [loading, setLoading] = useState(true);

  const [outerMode, setOuterMode] = useState<Mode>("select");
  const [outerSwatchId, setOuterSwatchId] = useState("");
  const [outerManual, setOuterManual] = useState<ManualEntry>(EMPTY_MANUAL);

  const [interfacingMode, setInterfacingMode] = useState<Mode>("none");
  const [interfacingSwatchId, setInterfacingSwatchId] = useState("");
  const [interfacingManual, setInterfacingManual] = useState<ManualEntry>(EMPTY_MANUAL);

  const [liningMode, setLiningMode] = useState<Mode>("none");
  const [liningSwatchId, setLiningSwatchId] = useState("");
  const [liningManual, setLiningManual] = useState<ManualEntry>(EMPTY_MANUAL);

  const [result, setResult] = useState<CheckResult | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.replace("/");
        return;
      }
      setUser(u);
      setSwatches(await listSwatches(u.uid));
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  function resolveSpec(mode: Mode, swatchId: string, manual: ManualEntry, label: string): FabricSpec | null | "incomplete" {
    if (mode === "none") return null;
    if (mode === "select") {
      const s = swatches.find((sw) => sw.id === swatchId);
      return s ? swatchToSpec(s) : "incomplete";
    }
    return manualToSpec(label, manual);
  }

  function handleCheck() {
    setCheckError(null);
    setResult(null);

    const outer = resolveSpec(outerMode, outerSwatchId, outerManual, "Outer fabric");
    const interfacing = resolveSpec(interfacingMode, interfacingSwatchId, interfacingManual, "Interfacing");
    const lining = resolveSpec(liningMode, liningSwatchId, liningManual, "Lining");

    if (outer === "incomplete" || outer === null) {
      setCheckError("Pick or enter an outer fabric first.");
      return;
    }
    if (interfacing === "incomplete") {
      setCheckError("Choose an interfacing swatch, or switch it to Manual/Skip.");
      return;
    }
    if (lining === "incomplete") {
      setCheckError("Choose a lining swatch, or switch it to Manual/Skip.");
      return;
    }

    const r = checkCompatibility(outer, interfacing, lining);
    setResult(r);
    triggerHaptic(r.verdict === "caution" ? "error" : "success");
  }

  if (loading) {
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
      <h1 className="font-display uppercase tracking-wide text-3xl mt-4 mb-2">
        Compatibility Check
      </h1>
      <p className="font-body text-parchment/70 mb-6">
        Pick an outer fabric, interfacing and lining — from your library or
        typed in by hand — and get a verdict with the reasoning behind it.
      </p>

      <div className="space-y-4">
        <FabricSlot
          role="outer"
          swatches={swatches}
          mode={outerMode}
          setMode={setOuterMode}
          swatchId={outerSwatchId}
          setSwatchId={setOuterSwatchId}
          manual={outerManual}
          setManual={setOuterManual}
        />
        <FabricSlot
          role="interfacing"
          swatches={swatches}
          mode={interfacingMode}
          setMode={setInterfacingMode}
          swatchId={interfacingSwatchId}
          setSwatchId={setInterfacingSwatchId}
          manual={interfacingManual}
          setManual={setInterfacingManual}
        />
        <FabricSlot
          role="lining"
          swatches={swatches}
          mode={liningMode}
          setMode={setLiningMode}
          swatchId={liningSwatchId}
          setSwatchId={setLiningSwatchId}
          manual={liningManual}
          setManual={setLiningManual}
        />
      </div>

      {checkError && (
        <p className="font-mono text-xs text-pin-red mt-4">{checkError}</p>
      )}

      <button
        type="button"
        onClick={handleCheck}
        className="w-full mt-6 bg-chalk-gold text-ink font-display uppercase tracking-wide py-3 rounded-sm hover:brightness-110 transition"
      >
        Check compatibility
      </button>

      {result && (
        <div className="mt-6">
          <div className={["rounded-sm px-4 py-3 font-display uppercase tracking-wide text-center", VERDICT_STYLE[result.verdict]].join(" ")}>
            {VERDICT_LABEL[result.verdict]}
          </div>
          <ul className="mt-4 space-y-2">
            {result.reasons.map((r, i) => (
              <li
                key={i}
                className={["cut-line rounded-sm px-3 py-2 font-body text-sm bg-muslin text-ink border-l-4", REASON_STYLE[r.level]].join(" ")}
              >
                {r.message}
              </li>
            ))}
            {result.reasons.length === 0 && (
              <li className="font-mono text-xs text-parchment/50">
                No rules applicable with the specs given — add more detail (GSM, stretch %, drape, opacity, care) for a fuller check.
              </li>
            )}
          </ul>
        </div>
      )}
    </main>
  );
}
