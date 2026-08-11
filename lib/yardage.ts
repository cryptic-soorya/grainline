/**
 * lib/yardage.ts
 *
 * Phase 5 — yardage & cost calculator. Same shape as lib/patternMath.ts:
 * pure functions, no Firestore, unitless (meters or yards, whatever the
 * pattern envelope and the student are both using — the math doesn't care
 * as long as both lengths are in the same unit).
 */

// ---------------------------------------------------------------------------
// Fabric width conversion
//
// Pattern envelopes only ever print yardage for a couple of standard fabric
// widths. If your fabric is a different width, the classic conversion is
// proportional: a narrower fabric needs more running length to fit the same
// pattern pieces, because there's less width to lay them out across.
// This assumes pieces re-lay cleanly at the new width (true for most wovens/
// knits without large panels) — it's the same estimate printed on envelopes,
// not a marker-making simulation.
// ---------------------------------------------------------------------------

export function convertYardageForWidth(
  originalLength: number,
  originalWidth: number,
  newWidth: number
): number {
  if (newWidth <= 0) return 0;
  return originalLength * (originalWidth / newWidth);
}

// A buffer on top of the converted length for nap/one-way-print matching,
// stripe/plaid matching, shrinkage allowance, or just cutting mistakes.
// bufferPercent 0 returns the length unchanged.
export function applyBuffer(length: number, bufferPercent: number): number {
  return length * (1 + bufferPercent / 100);
}

// ---------------------------------------------------------------------------
// Cost estimate
//
// Total project cost = fabric (length × price per unit length) + flat
// trims/notions cost. costPerGarment divides that across a batch — useful
// when cutting multiples from the same length (e.g. matching outfits, a
// small production run).
// ---------------------------------------------------------------------------

export function calculateFabricCost(length: number, pricePerUnit: number): number {
  return length * pricePerUnit;
}

export function calculateTotalCost(fabricCost: number, trimsCost: number): number {
  return fabricCost + trimsCost;
}

export function costPerGarment(totalCost: number, garmentCount: number): number {
  if (garmentCount <= 0) return totalCost;
  return totalCost / garmentCount;
}
