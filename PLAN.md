# PLAN.md — Grainline

## The idea in one paragraph
A PWA for fashion design & technology students. Starts as a personal tool for
one student, built so it can quietly grow into something her classmates use
too — a searchable fabric library and a material-compatibility checker first,
because that's tied to the hardest course in her program. Everything else
(pattern calculators, flashcards, deadline tracking) comes later, driven by
what people actually use, not by a wishlist.

## How the PWA install actually works (read this before building the auth flow)
A PWA is just a website with two extra files:
1. `manifest.json` — tells the browser "this can be an app": app name, icon,
   theme color, start URL, `display: "standalone"` (this is what removes the
   Safari address bar when launched from the home screen).
2. A **service worker** — a background script the browser runs even when the
   tab isn't open. It intercepts network requests and can serve cached files,
   which is what makes offline mode possible.

On iOS specifically: Safari (16.4+, so iPhone 17 running current iOS is fine)
supports "Add to Home Screen" from the share sheet. Once added, the icon opens
full-screen with `display: standalone`, no browser chrome — visually
indistinguishable from a native app to someone who doesn't know to look. No
Apple Developer account, no $99/year, no App Store review, because it never
goes through the App Store — it's just a bookmark that happens to look and
behave like an app.

**What "native feel" means concretely, and what we get for free vs. have to fake:**
- Full-screen, no browser bar → free, via `display: standalone` in the manifest
- App icon + splash screen → free, via manifest icons + `apple-touch-icon` meta tag
- Works offline → free, via service worker caching (needs setup, see Phase 1 tasks)
- Haptics (the little buzz on tap) → **partially available.** iOS Safari/PWA
  supports the Vibration API (`navigator.vibrate()`) for simple buzzes, but
  it's a blunt instrument — one vibration pattern, not Apple's fine-grained
  native Haptic Engine feedback (the different "taps" you feel in real iOS
  apps). We wrap it in `lib/haptics.ts` so it degrades gracefully — if the
  browser doesn't support it, it just does nothing instead of erroring.
- Push notifications → supported on iOS 16.4+ PWAs now, but needs its own
  setup (web push + a service worker handler) — not in Phase 1 scope.
- App Store presence / discoverability → **the one real thing we give up.**
  No App Store listing means growth is link-sharing + word of mouth, not
  App Store search. Fine for a college-cohort tool, worth knowing if this
  ever needs to scale beyond that.

## Design direction (full rationale — short version lives in CLAUDE.md)

**What we deliberately avoided:** the three "AI generated this" tells —
(1) cream background + high-contrast serif + terracotta accent, (2) near-black
+ single acid accent, (3) newspaper hairline-rule broadsheet layout. Also
avoided: purple/glassmorphism (explicitly ruled out), anything that reads as
overtly "girly" or overtly "masculine" — the brief asked for neutral.

**What we built instead, and why:** the visual world of an actual sewing
workroom / pattern-drafting table, since that's the subject's real material
world, not an abstracted "study app" look.

- **Color** — charcoal background (`#1C1A18`, like a cutting table under warm
  light, not cold-black), muslin/undyed-cotton card surfaces (`#EDE6D6`),
  chalk gold (`#C9A227` — the color of a brass measuring tape / tailor's
  chalk) as the primary accent, spool teal (`#3A6B64` — vintage sewing
  machine enamel) as secondary, pin red (`#B23A2E`) reserved only for
  alerts/errors so it stays meaningful.
- **Type** — display headings use a condensed, bold grotesk, deliberately
  referencing vintage sewing-pattern envelope covers (McCall's/Simplicity/
  Vogue Patterns box lettering was bold condensed sans, not serif — this is
  a real, specific reference instead of a generic "clean modern" choice).
  Body text is IBM Plex Sans. Numbers/measurements/fabric specs use IBM Plex
  Mono, because spec-sheet data reads better in a monospaced, tabular font.
- **Signature motif — the stitch line.** A dashed SVG line that animates by
  drawing itself (`stroke-dashoffset`), like a sewing machine stitching a
  seam. Used once, consistently, in a few deliberate places: the wordmark
  reveal on the landing page, dividers between sections, a trace-the-border
  effect on card hover, and a "sew across" transition between the landing
  page and the hub. This is the one place we spend animation budget — the
  brief specifically asked for "beautiful non-laggy animations," so this
  motif is built with CSS transforms/opacity (GPU-accelerated) rather than
  animating layout properties, and respects `prefers-reduced-motion`.
- **Pattern-piece cards** — on the hub page, each feature is a card styled
  like an actual pattern piece: dashed cut-line border, small triangular
  "notch" marks at two corners (the little triangles real patterns use to
  show how pieces align), a tiny grainline arrow icon. This is where the
  "structure encodes meaning" principle applies — the notches/dashes aren't
  decoration, they're literally how real pattern pieces are marked.

## Feature phases

### Phase 1 — Shell (this build)
- Landing page: animated wordmark reveal (stitch-line draws "GRAINLINE"),
  tagline, auth card (Google sign-in + email/password via Firebase Auth)
- Firebase project wired: Auth + Firestore, security rules scoping data to
  `request.auth.uid` from the start
- Hub page: pattern-piece card grid. Two "live" cards (placeholders for now,
  routes stubbed): Fabric Library, Compatibility Check. Remaining ideas shown
  as dashed "coming soon" ghost cards so the roadmap is visible to anyone
  testing it, without being clickable yet.
- PWA scaffolding: manifest, icons, service worker, install prompt handling,
  offline fallback page
- Basic user doc created in Firestore on first sign-in (`users/{uid}`), with
  an `isFounder: boolean` field reserved for the girlfriend's account so any
  future paywall logic can never touch it

### Phase 2 — Fabric swatch library
- Add a swatch: photo (device camera or upload), fiber content, GSM/weight,
  stretch %, drape quality, opacity, care instructions, free-text notes
- Search/filter by any of the above
- Personal library, scoped per user

### Phase 3 — Compatibility checker
- Pick outer fabric + interfacing + lining (from her library or manual entry)
- Rules-based verdict (weight-matching, stretch-matching, care compatibility)
  with a plain-language explanation of *why*

### Phase 4+ (order TBD by real usage after Phase 2/3 ship)
- Pattern math calculators (dart intake, seam allowance, ease %, grading)
- Measurement tracker (self or client measurements, reusable across projects)
- Terminology flashcards (spaced repetition)
- Deadline/project tracker
- Yardage & cost calculator

## Monetization (deferred, noted so it's not forgotten)
Free for everyone at first, girlfriend's account permanently free via
`isFounder` flag. Only consider a paid tier after real usage data exists —
e.g. a free swatch-storage cap with a paid tier for unlimited storage. Not a
Phase 1–4 concern.
