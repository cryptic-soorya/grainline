/**
 * lib/starterFabrics.ts
 *
 * A default reference library every new account gets seeded with on first
 * sign-in (see ensureUserDoc in app/page.tsx) — general fabric-science
 * reference points plus the fabrics most commonly used in Indian fashion
 * design coursework. Specs are typical/textbook ranges, not measurements of
 * a specific physical swatch. Anyone can edit or delete these, and add
 * their own measured swatches on top through the normal Add Swatch form.
 *
 * Photos: bundled under public/fabrics/ (not embedded as base64, unlike a
 * real uploaded swatch photo — see lib/imageResize.ts) so they ship as part
 * of the app itself, get cached by the PWA service worker, and don't bloat
 * every single user's Firestore document with a duplicate copy of the same
 * image. Several are real photographs; three (georgette, crepe, denim) are
 * physically-based material scans, all sourced from Wikimedia Commons.
 * Licenses require attribution where noted below — keep this list in sync
 * with whatever's in public/fabrics/.
 *
 * - cotton-poplin.jpg — "Blue Cotton Fabric Texture Free Creative Commons"
 *   by Pink Sherbet Photography, CC BY 2.0.
 * - khadi-cotton.jpg — "Book Pattern" material scan by Rob Tuytel / Poly
 *   Haven, CC0. (Stand-in for khadi's coarse, irregular handloom weave —
 *   no true khadi close-up with a compatible license was found.)
 * - mul-mul.jpg — "Muslin saree passing through a ring" (demonstrating its
 *   famous fineness), CC BY-SA 4.0.
 * - chanderi.jpg — "A man weaving the famous handloom Chanderi Saree",
 *   CC BY-SA 4.0.
 * - georgette.jpg — "Crepe georgette" material scan by Rico Cilliers &
 *   colormass / Poly Haven, CC0.
 * - crepe.jpg — "Crepe satin" material scan by Rico Cilliers & colormass /
 *   Poly Haven, CC0.
 * - viscose-rayon.jpg — "Close up of rayon fabric" from a 1960s dress,
 *   Rijksmuseum via Wikimedia Commons, CC BY-SA 3.0.
 * - denim.jpg — "Denim fabric 03" material scan by Rico Cilliers &
 *   colormass / Poly Haven, CC0.
 * - linen.jpg — "Linen, Texture" by Gordana Adamovic-Mladenovic, CC BY 2.0.
 * - pure-mulberry-silk.jpg — "Rajshahi silk fabric, Sopura Silk Mills Ltd"
 *   by Moheen Reeyad, CC BY-SA 4.0.
 *
 * All from commons.wikimedia.org. The CC BY / BY-SA entries need a credit
 * somewhere in the app before shipping publicly — there's no credits page
 * yet (see CLAUDE.md phase notes), so this comment is the attribution of
 * record for now.
 */
import type { SwatchInput } from "@/lib/swatches";
import { listSwatches, updateSwatch } from "@/lib/swatches";

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
    photoDataUrl: "/fabrics/cotton-poplin.jpg",
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
    photoDataUrl: "/fabrics/khadi-cotton.jpg",
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
    photoDataUrl: "/fabrics/mul-mul.jpg",
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
    photoDataUrl: "/fabrics/chanderi.jpg",
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
    photoDataUrl: "/fabrics/georgette.jpg",
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
    photoDataUrl: "/fabrics/crepe.jpg",
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
    photoDataUrl: "/fabrics/viscose-rayon.jpg",
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
    photoDataUrl: "/fabrics/denim.jpg",
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
    photoDataUrl: "/fabrics/linen.jpg",
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
    photoDataUrl: "/fabrics/pure-mulberry-silk.jpg",
  },
];

// Accounts created before starter fabrics had photos are stuck with
// photoDataUrl: null (or, briefly, a generated placeholder that started
// with "data:image/svg+xml") forever, since seeding only ever runs once
// (see ensureUserDoc in app/page.tsx). This runs on every sign-in (cheap:
// one read, and only writes the swatches that still need it) and fills in
// the real photo for any swatch whose name still matches a starter fabric
// and hasn't been given its own photo yet. It never touches a swatch
// someone has already edited or replaced the photo on.
export async function backfillStarterPhotos(uid: string): Promise<void> {
  const starterByName = new Map(STARTER_FABRICS.map((f) => [f.name, f]));
  const swatches = await listSwatches(uid);

  for (const swatch of swatches) {
    const needsPhoto = !swatch.photoDataUrl || swatch.photoDataUrl.startsWith("data:image/svg+xml");
    if (!needsPhoto) continue;
    const starter = starterByName.get(swatch.name);
    if (!starter?.photoDataUrl) continue;

    const { id, createdAt, updatedAt, ...input } = swatch;
    await updateSwatch(uid, id, { ...input, photoDataUrl: starter.photoDataUrl });
  }
}
