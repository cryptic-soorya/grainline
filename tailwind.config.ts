import type { Config } from "tailwindcss";

// Every color and font here maps 1:1 to the design rationale in PLAN.md.
// Don't reach for an arbitrary hex value in a component — extend this file
// instead, so the palette stays consistent as the app grows.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Base surfaces
        charcoal: "#1C1A18", // main app background — "cutting table" dark
        muslin: "#EDE6D6", // card/surface background — undyed cotton tone
        // Text
        ink: "#211F1D", // text on light (muslin) surfaces
        parchment: "#F2EEE3", // text on dark (charcoal) surfaces
        // Accents — use sparingly and consistently, not interchangeably
        "chalk-gold": "#C9A227", // primary accent — brass tape / tailor's chalk
        "spool-teal": "#3A6B64", // secondary accent — vintage machine enamel
        "pin-red": "#B23A2E", // alerts/errors ONLY — keep it meaningful
      },
      fontFamily: {
        // These point at the CSS variables next/font/google sets up in
        // app/layout.tsx (--font-display etc). next/font self-hosts and
        // preloads the font files at build time — using the variable here
        // instead of the font name string is what actually wires that up.
        // Condensed bold grotesk for headings — vintage pattern-envelope energy.
        display: ["var(--font-display)", "sans-serif"],
        // Clean humanist sans for body copy
        body: ["var(--font-body)", "sans-serif"],
        // Monospace for numbers/measurements/fabric specs — reads like a spec sheet
        mono: ["var(--font-mono)", "monospace"],
      },
      // Keyframes for the stitch-line signature motif. Only animating
      // transform/opacity-adjacent properties (stroke-dashoffset on an SVG,
      // opacity, translate) — never layout properties — so this stays smooth
      // even on an older phone.
      keyframes: {
        "stitch-draw": {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "stitch-draw": "stitch-draw 1.4s ease-out forwards",
        "fade-up": "fade-up 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
