# STATUS.md — Grainline

Last updated: GSM/stretch % filters added to fabric library search (2026-08-10).

## Current phase: Phase 3 — Compatibility checker

### Done
- [x] `lib/compatibility.ts` — rules-based checker. Takes an outer fabric
      plus optional interfacing/lining `FabricSpec`s and returns a verdict
      (`good` / `workable` / `caution`) with a plain-language reason per
      rule that fired. Rules: interfacing-vs-outer weight (fail if
      interfacing is heavier — it overpowers the shell), interfacing-vs-outer
      stretch (fail if outer stretches but interfacing doesn't — kills the
      stretch and puckers), lining-vs-outer weight, lining-vs-outer drape
      (structured lining under fluid outer = warn; fluid lining under
      structured outer = a classic pairing, passes), sheer-outer-needs-opaque-
      lining, and a care-instructions-spread check (dry-clean-only next to
      machine-washable = warn, since the garment has to follow the strictest
      one once sewn together). Textbook construction heuristics, not a
      physics sim — good enough to catch the mistakes that actually ruin a
      garment.
- [x] `/hub/compatibility` — pick outer (required), interfacing (optional),
      lining (optional) each either from the existing swatch library or
      typed in by hand (GSM, stretch %, drape, opacity, care). Reuses
      `FormField`/`inputClass` from Phase 2 and `DRAPE_LABEL`/`OPACITY_LABEL`
      from `lib/swatches.ts` rather than redefining them.
- [x] `npx tsc --noEmit` clean; route verified rendering (HTTP 200) locally

### Not done yet
- [ ] Manually run through a real check against real swatches in a signed-in
      browser session (only route-render + typecheck verified this session)
- [ ] Deploy to Vercel — still outstanding from Phase 1/2

## Phase 2 — Fabric swatch library

### Done
- [x] `lib/swatches.ts` — Firestore CRUD for swatches, nested at
      `users/{uid}/swatches/{id}` (already covered by the existing owner-only
      security rule, no rules changes needed)
- [x] `lib/imageResize.ts` — resizes/compresses swatch photos client-side to
      a base64 data URL stored directly on the Firestore doc. Deliberately
      NOT using Firebase Cloud Storage: new Firebase projects need the paid
      Blaze plan to enable it, and keeping this free is a hard requirement
      (see CLAUDE.md). Resize keeps photos comfortably under Firestore's 1MB
      doc cap.
- [x] `components/SwatchCard.tsx`, `components/FormField.tsx`
- [x] `/hub/fabric-library` — swatch grid with client-side search (name,
      fiber, care, notes), drape/opacity filters, and GSM/stretch % range
      filters (min/max number inputs)
- [x] `/hub/fabric-library/new` — add-swatch form (photo, name, fiber
      content, GSM, stretch %, drape, opacity, care, notes)
- [x] `/hub/fabric-library/[id]` — view swatch, inline edit, delete
      (with confirm)
- [x] `npx tsc --noEmit` clean; all three routes verified rendering
      (HTTP 200) locally

### Not done yet
- [ ] Manually tested against a real signed-in account with real photos
      (verified routes render, but no live Firebase read/write exercised
      in this session)
- [ ] Deploy to Vercel — Phase 1's deploy step is still outstanding too

## Phase 1 — Shell

### Done
- [x] Project scaffolded: Next.js 15 App Router + TypeScript + Tailwind
- [x] Design tokens defined in `tailwind.config.ts` (colors, fonts)
- [x] `StitchDivider` component — the signature animated stitch-line motif,
      reusable across the app
- [x] Landing page (`app/page.tsx`) — wordmark reveal animation + auth card
      (Google + email/password UI wired to Firebase Auth)
- [x] Hub page (`app/hub/page.tsx`) — pattern-piece card grid, 2 live
      placeholder cards (Fabric Library, Compatibility Check) + ghost cards
      for future phases
- [x] `lib/firebase.ts` — Firebase app/auth/Firestore init
- [x] `lib/haptics.ts` — Vibration API wrapper with graceful fallback
- [x] `public/manifest.json` — PWA manifest (name, icons, standalone display,
      theme color)
- [x] PWA plugin wired in `next.config.mjs` for service worker generation
- [x] `npm install` + `npm run dev` verified working (Next.js 15.0.3, ready
      in ~2s, no errors)
- [x] Firebase project created: `grainline1` (console.firebase.google.com).
      Google + Email/Password sign-in enabled, Firestore database created.
- [x] Real credentials in `.env.local` (git-ignored, not committed)
- [x] Firestore security rules (`firestore.rules`) deployed live via
      `firebase deploy --only firestore:rules` — `.firebaserc` +
      `firebase.json` added to point the CLI at the `grainline1` project
- [x] Placeholder app icons generated (`public/icons/icon-192.png`,
      `icon-512.png`, `icon-512-maskable.png`, `public/apple-touch-icon.png`)
      — on-brand (charcoal + chalk-gold, pattern-piece dashed-square +
      grainline-arrow motif) so the manifest doesn't 404, but still
      placeholder art, not commissioned final icons
- [x] Landing page (`/`) and hub page (`/hub`) both verified rendering
      (HTTP 200) locally with real Firebase config

### Not done yet (needed before this is usable on a real phone)
- [ ] Real, final app icon artwork (current icons are a generated
      placeholder, functional but not designed)
- [ ] Deploy the app itself to Vercel (only ran locally so far)
- [ ] Test "Add to Home Screen" on an actual iPhone once deployed — Safari
      needs the site served over HTTPS from a real domain, localhost won't
      demonstrate the installable/standalone behavior
- [ ] Manually sign in once for real (Google + email/password) to confirm
      the auth flow works end-to-end in a browser, not just that the pages
      compile — Claude Code can't drive an OAuth popup itself
- [ ] Set `isFounder: true` manually in Firestore (`users/{uid}` doc) for
      the girlfriend's account once she signs up for the first time
- [x] `/hub/fabric-library` and `/hub/compatibility` routes are live with
      real functionality — built in Phase 2/3 (see below)

## Next up
Deploy to Vercel, do a real sign-in test in a browser, then manually verify
the Phase 3 compatibility checker against real swatches. Phase 4+ is TBD by
what Phase 2/3 usage actually shows.

## Notes for next session
- Firebase project ID: `grainline1`. Console:
  https://console.firebase.google.com/project/grainline1/overview
- `firebase.json` + `.firebaserc` are checked in (no secrets — project ID
  isn't sensitive); `.env.local` stays git-ignored as before.
- To redeploy security rules after editing `firestore.rules`:
  `firebase deploy --only firestore:rules`
- Icon/splash art still needed — either commission something in the
  chalk-gold/spool-teal palette or generate one that matches the pattern-
  piece/stitch-line motif already established. The script used for the
  current placeholders is disposable (was in the session scratchpad, not
  saved to the repo) — regenerate by hand or from scratch next time.
