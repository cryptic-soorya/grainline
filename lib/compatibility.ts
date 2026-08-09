/**
 * lib/compatibility.ts
 *
 * Phase 3 — rules-based compatibility checker. Takes an outer fabric plus
 * optional interfacing and lining, and returns a verdict with a
 * plain-language reason for each rule that fired. These are textbook
 * garment-construction heuristics (weight matching, stretch matching, care
 * compatibility), not a physics simulation — good enough to flag the
 * mistakes that actually ruin a garment (interfacing heavier than the
 * shell, dry-clean-only paired with machine-wash, stretch fabric with a
 * rigid interfacing that kills the stretch).
 */
import type { Drape, Opacity } from "@/lib/swatches";

export interface FabricSpec {
  label: string;
  gsm: number | null;
  stretchPercent: number | null;
  drape: Drape | "";
  opacity: Opacity | "";
  care: string;
}

export type ReasonLevel = "pass" | "warn" | "fail";

export interface Reason {
  level: ReasonLevel;
  message: string;
}

export type Verdict = "good" | "workable" | "caution";

export interface CheckResult {
  verdict: Verdict;
  reasons: Reason[];
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  good: "Good match",
  workable: "Workable, with care",
  caution: "Proceed with caution",
};

// Rough care-strictness ranking, read off keywords in the free-text care
// field. Higher = more delicate/restrictive. A garment has to be cared for
// by its MOST restrictive component, so a wide spread across components is
// worth flagging even though nothing is technically "incompatible."
function careLevel(care: string): number | null {
  const c = care.toLowerCase();
  if (!c.trim()) return null;
  if (c.includes("dry clean")) return 3;
  if (c.includes("hand wash")) return 2;
  if (c.includes("machine wash") || c.includes("wash")) return 1;
  return null;
}

function pushWeightRules(reasons: Reason[], outer: FabricSpec, part: FabricSpec, role: "Interfacing" | "Lining") {
  if (outer.gsm == null || part.gsm == null) return;

  if (role === "Interfacing") {
    if (part.gsm > outer.gsm) {
      reasons.push({
        level: "fail",
        message: `${part.label} (${part.gsm} GSM) is heavier than ${outer.label} (${outer.gsm} GSM) — it will overpower the shell fabric's drape and show as ridges at the edges. Pick a lighter interfacing.`,
      });
    } else if (part.gsm / outer.gsm < 0.15) {
      reasons.push({
        level: "warn",
        message: `${part.label} is quite light relative to ${outer.label} — it may not add enough structure where you need it (collars, cuffs, plackets).`,
      });
    } else {
      reasons.push({
        level: "pass",
        message: `${part.label}'s weight is well matched to ${outer.label} for structure without overpowering it.`,
      });
    }
  } else {
    if (part.gsm > outer.gsm) {
      reasons.push({
        level: "warn",
        message: `${part.label} (${part.gsm} GSM) is heavier than ${outer.label} (${outer.gsm} GSM) — it can add unwanted bulk and drag down a fluid outer fabric.`,
      });
    } else {
      reasons.push({
        level: "pass",
        message: `${part.label}'s weight sits comfortably under ${outer.label} without adding bulk.`,
      });
    }
  }
}

function pushStretchRule(reasons: Reason[], outer: FabricSpec, interfacing: FabricSpec) {
  if (outer.stretchPercent == null || interfacing.stretchPercent == null) return;

  if (outer.stretchPercent >= 10 && interfacing.stretchPercent === 0) {
    reasons.push({
      level: "fail",
      message: `${outer.label} has stretch (${outer.stretchPercent}%) but ${interfacing.label} has none — use a knit/stretch interfacing or the interfaced area will lose its stretch and pucker.`,
    });
  } else if (outer.stretchPercent === 0 && interfacing.stretchPercent >= 10) {
    reasons.push({
      level: "warn",
      message: `${interfacing.label} has more stretch than ${outer.label}, which has none — the interfaced area may distort over time.`,
    });
  } else {
    reasons.push({
      level: "pass",
      message: `${interfacing.label}'s stretch behaviour matches ${outer.label} closely enough to move together.`,
    });
  }
}

function pushDrapeRule(reasons: Reason[], outer: FabricSpec, lining: FabricSpec) {
  if (!outer.drape || !lining.drape) return;

  if (outer.drape === "fluid" && lining.drape === "structured") {
    reasons.push({
      level: "warn",
      message: `${lining.label} is structured under a fluid outer fabric (${outer.label}) — it can stiffen the fall and fight the outer fabric's natural drape.`,
    });
  } else if (outer.drape === "structured" && lining.drape === "fluid") {
    reasons.push({
      level: "pass",
      message: `A fluid lining under a structured outer fabric is a classic pairing — eases movement without adding bulk.`,
    });
  } else {
    reasons.push({
      level: "pass",
      message: `${lining.label}'s drape is compatible with ${outer.label}.`,
    });
  }
}

function pushOpacityRule(reasons: Reason[], outer: FabricSpec, lining: FabricSpec | null) {
  if (outer.opacity !== "sheer") return;

  if (!lining) {
    reasons.push({
      level: "warn",
      message: `${outer.label} is sheer and no lining is selected — consider adding an opaque lining or underlining.`,
    });
  } else if (lining.opacity && lining.opacity !== "opaque") {
    reasons.push({
      level: "warn",
      message: `${outer.label} is sheer, but ${lining.label} isn't fully opaque either — it may not solve the see-through problem on its own.`,
    });
  } else if (lining.opacity === "opaque") {
    reasons.push({
      level: "pass",
      message: `${lining.label} is opaque, which properly backs the sheer ${outer.label}.`,
    });
  }
}

function pushCareRule(reasons: Reason[], parts: FabricSpec[]) {
  const levels = parts
    .map((p) => ({ label: p.label, level: careLevel(p.care) }))
    .filter((p): p is { label: string; level: number } => p.level != null);

  if (levels.length < 2) return;

  const min = Math.min(...levels.map((l) => l.level));
  const max = Math.max(...levels.map((l) => l.level));

  if (max - min >= 2) {
    const strictest = levels.find((l) => l.level === max)!;
    reasons.push({
      level: "warn",
      message: `Care instructions vary widely between components — the finished garment has to follow the MOST delicate one (${strictest.label}), so any machine-washable pieces lose that convenience once sewn together.`,
    });
  } else {
    reasons.push({
      level: "pass",
      message: `Care instructions are close enough across components that the garment won't need unusually careful handling.`,
    });
  }
}

export function checkCompatibility(
  outer: FabricSpec,
  interfacing: FabricSpec | null,
  lining: FabricSpec | null
): CheckResult {
  const reasons: Reason[] = [];

  if (interfacing) {
    pushWeightRules(reasons, outer, interfacing, "Interfacing");
    pushStretchRule(reasons, outer, interfacing);
  }

  if (lining) {
    pushWeightRules(reasons, outer, lining, "Lining");
    pushDrapeRule(reasons, outer, lining);
  }

  pushOpacityRule(reasons, outer, lining);

  const careParts = [outer, interfacing, lining].filter((p): p is FabricSpec => p != null);
  pushCareRule(reasons, careParts);

  const fails = reasons.filter((r) => r.level === "fail").length;
  const warns = reasons.filter((r) => r.level === "warn").length;

  const verdict: Verdict = fails > 0 ? "caution" : warns > 0 ? "workable" : "good";

  return { verdict, reasons };
}
