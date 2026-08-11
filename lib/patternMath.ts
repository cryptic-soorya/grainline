/**
 * lib/patternMath.ts
 *
 * Phase 4 — pattern math calculators. These are one-off calculations, not
 * saved data, so unlike lib/swatches.ts / lib/compatibility.ts there's no
 * Firestore read/write here at all — just pure functions the UI calls
 * directly with whatever numbers the student types in.
 *
 * Units are intentionally unitless (cm or inches, whatever the student is
 * measuring in) — the math is the same either way, so we don't force a
 * choice.
 */

// ---------------------------------------------------------------------------
// Seam allowance
//
// A pattern's cutting line = finished (sewn) line + seam allowance, added on
// each edge that actually gets sewn. `edges` lets a strip cut on both sides
// (e.g. a waistband) add the SA twice, while a single seamed edge (e.g. one
// side of a dart leg) only adds it once.
// ---------------------------------------------------------------------------

export function addSeamAllowance(finishedMeasurement: number, seamAllowance: number, edges: number): number {
  return finishedMeasurement + seamAllowance * edges;
}

export function removeSeamAllowance(cuttingMeasurement: number, seamAllowance: number, edges: number): number {
  return cuttingMeasurement - seamAllowance * edges;
}

// ---------------------------------------------------------------------------
// Ease
//
// Ease is the gap between the body and the finished garment — what lets you
// actually move (and breathe) in it. Negative ease means the garment is
// smaller than the body, which is normal for close-fitting stretch knits.
// ---------------------------------------------------------------------------

export interface EaseResult {
  ease: number;
  easePercent: number;
}

export function calculateEase(bodyMeasurement: number, garmentMeasurement: number): EaseResult {
  const ease = garmentMeasurement - bodyMeasurement;
  const easePercent = bodyMeasurement !== 0 ? (ease / bodyMeasurement) * 100 : 0;
  return { ease, easePercent };
}

export function garmentFromEasePercent(bodyMeasurement: number, easePercent: number): number {
  return bodyMeasurement * (1 + easePercent / 100);
}

// ---------------------------------------------------------------------------
// Dart intake
//
// Darts absorb the gap between a larger circumference measurement and a
// smaller one (classically bust vs. waist) so flat fabric can wrap a curved
// body. Total intake needed is split evenly across however many darts the
// pattern uses to take it in.
// ---------------------------------------------------------------------------

export function calculateDartIntake(largerMeasurement: number, smallerMeasurement: number, dartCount: number): number {
  if (dartCount <= 0) return 0;
  const totalIntake = largerMeasurement - smallerMeasurement;
  return totalIntake / dartCount;
}

// ---------------------------------------------------------------------------
// Grading
//
// Grading resizes a pattern up or down by a fixed increment per size step
// (e.g. "+1.5cm bust per size"). `sizeSteps` is signed: positive grades up,
// negative grades down, 0 returns the base measurement unchanged.
// ---------------------------------------------------------------------------

export function gradeMeasurement(baseMeasurement: number, incrementPerSize: number, sizeSteps: number): number {
  return baseMeasurement + incrementPerSize * sizeSteps;
}
