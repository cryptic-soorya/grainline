/**
 * lib/starterFabrics.ts
 *
 * A default reference library every new account gets seeded with on first
 * sign-in (see ensureUserDoc in app/page.tsx) — general fabric-science
 * reference points plus the fabrics most commonly used in Indian fashion
 * design coursework. Specs are typical/textbook ranges, not measurements of
 * a specific physical swatch. Anyone can edit or delete these, and add
 * their own measured swatches on top through the normal Add Swatch form.
 */
import type { SwatchInput } from "@/lib/swatches";
import { weaveSwatch } from "@/lib/swatchArt";

export const STARTER_FABRICS: SwatchInput[] = [
  {
    name: "Cotton Poplin",
    fiberContent: "100% cotton",
    gsm: 120,
    stretchPercent: 0,
    drape: "structured",
    opacity: "opaque",
    care: "Machine wash cold, iron while slightly damp.",
    notes: "Crisp, tightly-woven everyday shirting fabric. Widely available across Indian fabric markets, good default reference for a plain-weave cotton.",
    photoDataUrl: weaveSwatch({ base: "#EDE6D6", thread: "#B5A98A", gap: 5, threadOpacity: 0.5 }),
  },
  {
    name: "Khadi Cotton",
    fiberContent: "100% handspun, handwoven cotton",
    gsm: 150,
    stretchPercent: 0,
    drape: "structured",
    opacity: "semi-opaque",
    care: "Hand wash or gentle machine wash cold; expect some shrinkage on first wash.",
    notes: "Handloom fabric with slightly irregular, textured weave — quality and weight vary more than mill cotton. Common for kurtas and everyday ethnic wear.",
    photoDataUrl: weaveSwatch({ base: "#E4D9BE", thread: "#8C7A55", gap: 9, threadOpacity: 0.55 }),
  },
  {
    name: "Mul Mul (Muslin)",
    fiberContent: "100% cotton",
    gsm: 50,
    stretchPercent: 0,
    drape: "fluid",
    opacity: "sheer",
    care: "Hand wash gently, line dry, low iron heat.",
    notes: "Ultra-fine, sheer cotton weave. Used for dupattas, linings, and lightweight summer kurtas.",
    photoDataUrl: weaveSwatch({ base: "#F5F1E6", thread: "#CFC6AC", gap: 3, threadOpacity: 0.25 }),
  },
  {
    name: "Chanderi",
    fiberContent: "Cotton-silk blend (often with zari thread)",
    gsm: 90,
    stretchPercent: 0,
    drape: "fluid",
    opacity: "semi-opaque",
    care: "Dry clean recommended.",
    notes: "Traditional weave from Chanderi, Madhya Pradesh. Sheer, lightweight, with a soft sheen from the silk/zari content. Common in ethnic and occasion wear.",
    photoDataUrl: weaveSwatch({ base: "#E9D9A6", thread: "#C9A227", gap: 4, threadOpacity: 0.3, sheen: true }),
  },
  {
    name: "Georgette",
    fiberContent: "100% polyester (also made in pure silk)",
    gsm: 75,
    stretchPercent: 5,
    drape: "fluid",
    opacity: "semi-opaque",
    care: "Hand wash or dry clean; do not wring.",
    notes: "Lightweight, crinkled-texture sheer fabric. Very common for sarees, dupattas and flowy kurtis.",
    photoDataUrl: weaveSwatch({ base: "#D69A9A", thread: "#8C4A4A", gap: 4, threadOpacity: 0.4 }),
  },
  {
    name: "Crepe",
    fiberContent: "Polyester or silk crepe",
    gsm: 115,
    stretchPercent: 8,
    drape: "fluid",
    opacity: "semi-opaque",
    care: "Dry clean; if washable, hand wash cold.",
    notes: "Pebbly, slightly textured surface with good drape. Popular for kurtis, dresses and co-ord sets.",
    photoDataUrl: weaveSwatch({ base: "#B98CA6", thread: "#6E4A5D", gap: 4, threadOpacity: 0.45 }),
  },
  {
    name: "Viscose Rayon",
    fiberContent: "100% viscose",
    gsm: 135,
    stretchPercent: 3,
    drape: "fluid",
    opacity: "semi-opaque",
    care: "Hand wash cold, do not wring, dry flat.",
    notes: "Silk-like sheen and drape at a lower cost than silk. Very common in everyday Indian ready-to-wear.",
    photoDataUrl: weaveSwatch({ base: "#3A6B64", thread: "#1F3D38", gap: 5, threadOpacity: 0.35, sheen: true }),
  },
  {
    name: "Denim",
    fiberContent: "100% cotton (cotton-elastane for stretch denim)",
    gsm: 350,
    stretchPercent: 2,
    drape: "structured",
    opacity: "opaque",
    care: "Wash inside-out in cold water, low heat if tumble dried.",
    notes: "Durable twill weave. GSM ranges widely (roughly 200-450) depending on weight — this entry is a mid-weight reference point.",
    photoDataUrl: weaveSwatch({ base: "#2E4C6D", thread: "#16283B", gap: 6, threadOpacity: 0.5, twill: true }),
  },
  {
    name: "Linen",
    fiberContent: "100% linen",
    gsm: 175,
    stretchPercent: 0,
    drape: "medium",
    opacity: "semi-opaque",
    care: "Dry clean or gentle wash cold; iron while damp.",
    notes: "Breathable and cool, wrinkles easily by nature (not a flaw). Well suited to Indian summers.",
    photoDataUrl: weaveSwatch({ base: "#D8CBAA", thread: "#A69573", gap: 7, threadOpacity: 0.45 }),
  },
  {
    name: "Pure Mulberry Silk",
    fiberContent: "100% mulberry silk",
    gsm: 80,
    stretchPercent: 0,
    drape: "fluid",
    opacity: "semi-opaque",
    care: "Dry clean only.",
    notes: "Classic silk used across South Indian weaves. Prized for its natural sheen and fall — a reference point before comparing art silk/blends.",
    photoDataUrl: weaveSwatch({ base: "#F2ECDD", thread: "#D8C79A", gap: 3, threadOpacity: 0.25, sheen: true }),
  },
];
