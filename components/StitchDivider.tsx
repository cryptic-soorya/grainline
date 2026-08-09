"use client";

/**
 * StitchDivider — the one signature animated motif for the whole app.
 *
 * How it works: an SVG line with a dashed stroke. We set stroke-dasharray
 * (the dash pattern) AND stroke-dashoffset (how far the dashes are shifted
 * along the line) to the same large number, so at rest the entire line is
 * "hidden" — shifted off past its own start. Then we animate
 * stroke-dashoffset down to 0, which makes the dashes slide into place,
 * reading as the line "sewing itself" left to right.
 *
 * This only animates an SVG attribute the GPU can handle cheaply — no
 * layout is recalculated, so it stays smooth even on an older phone.
 *
 * Props:
 * - width: how wide the line should be (px). Defaults to fill its container.
 * - delayMs: stagger multiple StitchDividers so they don't all fire at once.
 */
export function StitchDivider({
  width = 400,
  delayMs = 0,
  className = "",
}: {
  width?: number;
  delayMs?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${width} 12`}
      width="100%"
      height="12"
      className={className}
      aria-hidden="true"
    >
      <line
        x1="0"
        y1="6"
        x2={width}
        y2="6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="8 10"
        style={{
          strokeDashoffset: 1000,
          animation: "stitch-draw 1.4s ease-out forwards",
          animationDelay: `${delayMs}ms`,
        }}
      />
    </svg>
  );
}
