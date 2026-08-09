"use client";

import { triggerHaptic } from "@/lib/haptics";

/**
 * PatternCard — a feature card styled like an actual sewing pattern piece.
 *
 * Real pattern pieces (the tissue-paper shapes in a pattern envelope) are
 * marked with a few consistent symbols: a dashed cut line around the edge,
 * small triangular "notches" cut into the edge so you can line up two
 * pieces correctly, and a grainline arrow showing which way the fabric
 * weave should run. We're borrowing exactly those three marks here instead
 * of inventing decoration — see PLAN.md "pattern-piece cards" for why.
 *
 * `live` controls whether this is a real, clickable feature (solid card,
 * full opacity) or a "coming in a later phase" placeholder (dashed, faded,
 * not clickable). This is how the roadmap stays visible on the hub page
 * without pretending unfinished features are ready.
 */
export function PatternCard({
  title,
  description,
  live,
  onOpen,
}: {
  title: string;
  description: string;
  live: boolean;
  onOpen?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!live}
      onClick={() => {
        if (!live) return;
        triggerHaptic("light"); // small buzz on tap — see lib/haptics.ts
        onOpen?.();
      }}
      className={[
        "group relative text-left rounded-sm p-5 transition-all duration-200",
        "cut-line", // dashed border utility from globals.css
        live
          ? "bg-muslin text-ink hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
          : "bg-transparent text-parchment/40 cursor-default",
      ].join(" ")}
    >
      {/* Notch marks: two small triangles cut into the top edge, exactly
          like the alignment notches on a real pattern piece. Pure CSS
          triangles via border tricks — no image assets needed. */}
      <span
        aria-hidden="true"
        className={[
          "absolute -top-[7px] left-6 w-0 h-0",
          "border-l-[6px] border-l-transparent",
          "border-r-[6px] border-r-transparent",
          "border-b-[7px]",
          live ? "border-b-muslin" : "border-b-charcoal",
        ].join(" ")}
      />

      {/* Grainline arrow — small vertical arrow, top-right corner */}
      <span
        aria-hidden="true"
        className="absolute top-4 right-4 text-xs font-mono opacity-50"
      >
        ↑
      </span>

      <h3 className="font-display uppercase tracking-wide text-xl mb-1">
        {title}
      </h3>
      <p className="font-body text-sm opacity-80 max-w-[36ch]">
        {description}
      </p>
      {!live && (
        <span className="inline-block mt-3 text-xs font-mono uppercase tracking-widest opacity-60">
          coming later
        </span>
      )}
    </button>
  );
}
