# STATUS.md — Grainline

Last updated: Phase 1 shell, verified end-to-end in Claude Code (2026-08-10).

## Current phase: Phase 1 — Shell

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
- [ ] `/hub/fabric-library` and `/hub/compatibility` routes are stubbed but
      have no real functionality yet — that's Phase 2/3

## Next up
Deploy to Vercel, do a real sign-in test in a browser, then Phase 2: Fabric
swatch library — see PLAN.md for the field list (fiber content, GSM,
stretch %, drape, opacity, care instructions).

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
