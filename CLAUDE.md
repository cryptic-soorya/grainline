# Grainline — Project Instructions for Claude Code

## What this is
A PWA (Progressive Web App) study/reference tool for fashion design & technology
students, built for iPhone (installed via "Add to Home Screen", no App Store,
no Apple Developer fee) and usable in any browser on desktop too.

Named "Grainline" — the arrow every sewing pattern piece has, marking which way
the fabric's weave should run. It's the one mark that tells you a pattern is
being used correctly. Same idea here: a tool that keeps the details right.

Built by Soorya (final year AI & Data Science, Rajagiri, Kochi) for his
girlfriend, a fashion design & technology student — with an eye toward other
students at her college using it too, free to start.

## Tech stack (decided, don't relitigate without discussing)
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS — custom theme, see `tailwind.config.ts` for the full token system
- Firebase Auth (Google + email) — wired from Phase 1, even though only 2-3
  features exist at first. Reason: we want user-count tracking from day one.
- Firestore — per-user data, security rules scope every document to
  `request.auth.uid`. Never build a feature that reads/writes another user's
  data without an explicit "shared/public" collection.
- Hosting: Vercel (same as the Mika project)
- PWA: `@ducanh2912/next-pwa` (App Router compatible) — generates the service
  worker for offline caching + installability
- No native app, no Xcode, no App Store submission, no $99/year fee. It is a
  website that is *installable*. That's the whole trick — see PLAN.md for the
  full explanation of how that works on iOS.

## Design system (do not freelance new colors/fonts — extend the tokens instead)
Full rationale lives in PLAN.md. Quick reference:
- Background: charcoal `#1C1A18` (dark "cutting table" mood)
- Surfaces/cards: muslin `#EDE6D6`
- Text on dark: `#F2EEE3` · Text on light: `#211F1D`
- Accent 1 (primary): chalk gold `#C9A227`
- Accent 2 (secondary): spool teal `#3A6B64`
- Accent 3 (alerts only, use sparingly): pin red `#B23A2E`
- Display font: a condensed/compressed bold grotesk (vintage sewing-pattern-
  envelope headline energy) — currently Oswald as a free stand-in
- Body font: IBM Plex Sans
- Data/numbers font: IBM Plex Mono (used in calculators, measurements, fabric specs)
- Signature motif: the "stitch line" — an animated dashed SVG line that draws
  itself (stroke-dashoffset animation). Used for: wordmark reveal on landing,
  section dividers, card hover states, page-transition sew-across. This is the
  ONE recurring animated idea — don't add unrelated animation styles elsewhere.
  See `components/StitchDivider.tsx`.

## Feature phases (see PLAN.md for full detail — this is the short version)
1. **Phase 1 (current)** — Landing page, Firebase Auth, Hub page shell, PWA
   install/offline scaffolding. No feature logic yet, just the shell + auth.
2. **Phase 2** — Fabric swatch library (photo + tagged properties, searchable)
3. **Phase 3** — Compatibility checker (outer fabric + interfacing + lining →
   verdict)
4. **Phase 4+** — Pattern math calculators, measurement tracker, flashcards,
   deadline tracker, yardage/cost calculator. Build order depends on what
   Phase 2/3 usage tells us real students actually reach for.

## Ground rules
- This is a teaching context — Soorya is a final-year student with minimal
  coding experience who wants to understand *why*, not just get working code.
  Comment non-obvious logic, and don't silently introduce a pattern/library
  without a one-line reason in the commit or chat.
- Multi-user from day one: every new Firestore collection needs a security
  rule scoping it to the owning user before it ships, not after.
- Keep the girlfriend's account free forever — there's a hardcoded allowlist
  or a `isFounder` flag reserved for this, don't build a paywall that could
  ever catch her account.
- Don't add features outside the current phase without updating PLAN.md first.
