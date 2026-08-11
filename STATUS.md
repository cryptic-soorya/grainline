# STATUS.md — Grainline

Last updated: Phase 5 deadline tracker built in Claude Code (2026-08-12).

## Current phase: Phase 5 — Deadline/project tracker

### Done
- [x] `lib/deadlines.ts` — Firestore CRUD, nested at
      `users/{uid}/deadlines/{id}` (owner-only rule already covers it, no
      rules changes needed). Ordered by due date ascending (not createdAt
      like swatches/measurements) since "what's due soonest" is the point.
      Each deadline: title, course/project, due date (plain ISO date
      string, no time component), a submission checklist (label + done),
      notes, and a `completed` flag. `daysUntil()` does day-granularity
      overdue/due-today/days-left math.
- [x] `components/DeadlineCard.tsx` — list card leading with days-remaining,
      pin-red accent when overdue/due today (per CLAUDE.md, the one place
      that accent color is meant to be used).
- [x] `/hub/deadlines` — list with a "show completed" toggle (defaults to
      hiding completed so the list stays focused on what's actually coming
      up), sorted soonest-first.
- [x] `/hub/deadlines/new` — add form (title, course, due date, add/remove
      checklist rows, notes).
- [x] `/hub/deadlines/[id]` — view/edit/delete. Checklist checkboxes and the
      "mark complete" button save immediately without entering edit mode —
      those are the actions used constantly while working toward a
      deadline, unlike the other Phase 2/5 detail pages where edit is a
      deliberate separate step.
- [x] Hub's "Deadlines" card flipped from ghost (`live={false}`) to live,
      routes to `/hub/deadlines`.
- [x] `npx tsc --noEmit` clean; hub, list, and new-deadline routes verified
      rendering (HTTP 200) locally.

### Not done yet
- [ ] Manually add/check off/complete/delete a real deadline in a signed-in
      browser session (route-render + typecheck verified this session only)
- [ ] Deploy to Vercel — still outstanding from Phase 1

## Phase 5 — Yardage & cost calculator

### Done
- [x] `lib/yardage.ts` — pure functions, no Firestore (one-off math, same
      shape as `lib/patternMath.ts`): fabric width conversion (proportional
      re-estimate of yardage when your fabric width differs from what the
      pattern envelope printed, e.g. envelope says 2m at 150cm → how much at
      112cm) with an optional buffer % on top (nap, print/stripe matching,
      shrinkage, mistakes); cost estimate (length × price per unit + flat
      trims/notions cost → total, divided across a garment count for
      cost-per-garment on multiples).
- [x] `/hub/yardage` — two-tab UI ("Width conversion", "Cost estimate"),
      live calculation as you type. Reuses `FormField`/`inputClass` from
      Phase 2 and the tabbed-calculator layout from `/hub/pattern-math`.
- [x] Hub gets a new "Yardage & Cost" card (live), routes to `/hub/yardage`
      — added after Measurements per the Phase 5+ order in PLAN.md.
- [x] `npx tsc --noEmit` clean; both hub and the new route verified
      rendering (HTTP 200) locally.

### Not done yet
- [ ] Manually run both calculators with real numbers in a signed-in
      browser session (route-render + typecheck verified this session only)
- [ ] Deploy to Vercel — still outstanding from Phase 1

## Phase 5 — Measurement tracker

### Done
- [x] `lib/measurements.ts` — Firestore CRUD for measurement profiles,
      nested at `users/{uid}/measurementProfiles/{id}` (already covered by
      the existing owner-only security rule, no rules changes needed). A
      profile is one person (self or a client) with a standard 12-field
      pattern-drafting measurement set (bust, waist, hip, shoulder width,
      arm length, etc.), a cm/in unit choice, a free-text `custom` list for
      anything outside the standard set, and notes.
- [x] `components/MeasurementCard.tsx` — list card, mirrors `SwatchCard`
      styling minus the photo (profiles don't have one).
- [x] `/hub/measurements` — profile grid with client-side name/notes search.
- [x] `/hub/measurements/new` — add-profile form (name, unit, 12 standard
      fields, add/remove custom rows, notes). Reuses `FormField`/`inputClass`
      from Phase 2.
- [x] `/hub/measurements/[id]` — view profile, inline edit, delete (with
      confirm).
- [x] Hub's "Measurements" card flipped from ghost (`live={false}`) to
      live, routes to `/hub/measurements`.
- [x] `PLAN.md` updated with the Phase 5+ build order (measurement tracker
      → yardage & cost calculator → deadline/project tracker → flashcards,
      picked 2026-08-12 since no real usage data exists yet to order it by).
- [x] `npx tsc --noEmit` clean; all three new routes verified rendering
      (HTTP 200) locally.

### Not done yet
- [ ] Manually click through add/edit/delete with real measurements in a
      signed-in browser session (only route-render + typecheck verified
      this session, same caveat as every prior phase — Claude Code can't
      drive the OAuth popup)
- [ ] Deploy to Vercel — still outstanding from Phase 1

## Phase 4 — Pattern math calculators

### Done
- [x] `lib/patternMath.ts` — four pure calculators, no Firestore (one-off
      math, nothing saved): seam allowance (add/remove, finished ↔ cutting
      measurement, configurable for 1 or 2 sewn edges), ease (garment +
      body → ease and ease %, or the reverse: body + target ease % →
      garment measurement), dart intake (larger/smaller circumference +
      dart count → intake per dart), grading (base measurement + per-size
      increment + signed size steps → graded measurement).
- [x] `/hub/pattern-math` — tabbed UI, one tab per calculator, live
      calculation as you type (no submit button needed, it's just
      arithmetic). Reuses `FormField`/`inputClass` from Phase 2.
- [x] Hub's "Pattern Calculators" card flipped from ghost (`live={false}`)
      to live, routes to `/hub/pattern-math`.
- [x] `npx tsc --noEmit` clean; route verified rendering (HTTP 200) locally
- [x] `checkCompatibility` (Phase 3 rules engine) not touched this session
      but sanity-tested directly against 5 realistic scenarios as part of
      closing out Phase 3 verification — see Phase 3 section below.

### Not done yet
- [ ] Manually click through all four calculators in a signed-in browser
      session with real numbers (only route-render + typecheck verified
      this session, same caveat as Phase 2/3 — Claude Code can't drive the
      OAuth popup)
- [ ] Deploy to Vercel — still outstanding from Phase 1/2/3

## Phase 3 — Compatibility checker

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
      browser session — Claude Code can't drive the Firebase OAuth popup, so
      this still needs a human click-through. Everything Claude Code *can*
      verify without a browser session was re-confirmed on 2026-08-12:
      `npx tsc --noEmit` clean, all three hub routes still render (HTTP 200),
      and `checkCompatibility()` was sanity-tested directly (bypassing the UI)
      against 5 realistic garment scenarios — tailored jacket (good), stretch
      knit with a too-heavy non-stretch interfacing (caution, both weight and
      stretch rules correctly fired), unlined sheer blouse (warn), sheer
      blouse with opaque lining but mismatched care levels (warn on care
      only), and a fabric with no gsm/stretch/drape data (correctly produces
      no false-positive reasons). Verdicts and reasoning all matched textbook
      construction logic.
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
      fiber, care, notes) and drape/opacity filters
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
- [ ] `/hub/fabric-library` and `/hub/compatibility` routes are stubbed but
      have no real functionality yet — that's Phase 2/3

## Next up
Deploy to Vercel, do a real sign-in test in a browser, then manually click
through Phase 2/3/4/5 (fabric library, compatibility checker, pattern
calculators, measurements) with real data. Next build after that: yardage &
cost calculator (see PLAN.md Phase 5+ order, picked 2026-08-12 with no
usage data yet to go on).

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
