# GapLens visual design system

Reference this alongside CLAUDE.md. CLAUDE.md governs product logic and
copy voice; this file governs visual implementation.

## Concept

GapLens reads a resume the way a strict human reviewer would — checking
every requirement against real evidence, not vocabulary. The visual
identity should look like that act happening: a document being marked
up live, evidence underlined, gaps circled, a verdict stamped — not a
generic analytics dashboard. Every visual choice should reinforce
"this is a real inspection," not "this is a SaaS metrics tool."

Avoid: dark background + single neon accent (generic AI-tool default),
warm cream background + terracotta accent (equally common AI-tool
default), donut/gauge charts, generic icon-plus-heading feature card
grids, rainbow-cycled category colors.

## Color tokens

Use these as CSS custom properties (`--gl-*`) so light/dark handling
stays centralized. GapLens is a light, paper-toned product — do not
build a dark mode variant unless explicitly requested later.

```css
:root {
  --gl-paper: #F1F2ED;        /* page background, cool off-white */
  --gl-paper-card: #FFFFFF;    /* card/document surface */
  --gl-ink: #1B1C19;           /* primary text, near-black */
  --gl-ink-muted: #4A4A44;     /* body copy */
  --gl-ink-faint: #8A8A82;     /* captions, labels, metadata */
  --gl-teal: #0F6E56;          /* verified / met / brand accent */
  --gl-teal-bg: #E1F5EE;       /* pale teal fill for badges */
  --gl-crimson: #C23B3B;       /* gap / unmet / flagged */
  --gl-crimson-bg: #FBEAEA;    /* pale crimson fill for badges */
  --gl-amber: #E8B84B;         /* highlighter accent, sparing use only */
  --gl-grid-line: #00000008;   /* faint background grid */
}
```

Usage rule: teal means "verified," crimson means "flagged," full stop.
Never use either color decoratively — if a color appears, it is making
a claim about status.

## Typography

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,500;0,600;1,500&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500&display=swap" rel="stylesheet">
```

- **Headlines** — Newsreader (serif), weight 600, used only for h1/h2.
  This is the one characterful choice on the page — don't dilute it by
  using the serif anywhere else.
- **Evidence, citations, labels, metadata** — IBM Plex Mono. Anything
  that represents a verified fact, quote, or system-generated label
  uses mono — this is a deliberate signal that "this text is being
  checked," distinct from regular prose.
- **Body copy, UI chrome, buttons** — Inter, weight 400/500 only.

## Signature element: live document markup

The core reusable motif across the product. A resume excerpt (or, on
the results page, the user's actual resume) renders as a document card
with claims progressively underlined (teal, verified) or circled
(crimson, gap flagged) as if being marked up in real time, with margin
notes appearing beside each mark, ending in a stamped verdict.

Reuse this pattern in:
- Landing page hero (marketing copy, static sample data)
- Results page (real data, triggered on page load once)
- Do NOT reuse it for minor/incidental UI moments — it should stay
  meaningful by staying rare. One or two triggers per page maximum.

Implementation reference: see the hero markup animation already built
(document card, underline/circle reveal, margin notes, stamp) —
timing pattern is staged reveals at roughly 350-450ms intervals,
stamp last with a slight rotation and overshoot easing.

## Process diagram pattern

For any genuine sequential process (the four-step verification flow,
future step-based flows), use the "pinned evidence card" pattern:
white cards with a 1-2 degree alternating rotation, connected by a
dashed crimson thread, numbered in mono type. Do not use this pattern
for content that isn't a real sequence — see CLAUDE.md's general
note on not decorating non-sequential content with step numbers.

## Component patterns

**Document card** (used for resume/markup display)
```css
background: var(--gl-paper-card);
border-radius: 4px;
padding: 1.75rem;
box-shadow: 0 1px 3px rgba(0,0,0,0.08);
```

**Verdict stamp** (used for capped score / pass-fail moments)
```css
border: 2px solid var(--gl-crimson); /* or --gl-teal for a pass */
color: var(--gl-crimson);
font-family: 'IBM Plex Mono', monospace;
font-weight: 500;
border-radius: 4px;
padding: 6px 10px;
transform: rotate(-8deg);
```
Animate in with scale-overshoot easing (`cubic-bezier(0.34,1.56,0.64,1)`),
never a plain fade — the stamp should feel like it lands.

**Background grid** (page/section backgrounds only, not cards)
```css
background-image:
  linear-gradient(var(--gl-grid-line) 1px, transparent 1px),
  linear-gradient(90deg, var(--gl-grid-line) 1px, transparent 1px);
background-size: 24px 24px;
```

**Requirement row** (results checklist)
- Icon: check (teal) or x (crimson), Tabler outline icons only
- Label line: mono, small caps-style lowercase tag ("essential" /
  "desirable") in `--gl-ink-faint`, requirement name in `--gl-ink`
  medium weight
- Evidence line: quoted resume text in `--gl-ink-muted`, regular weight
- Unmet rows may flash a pale `--gl-crimson-bg` background briefly on
  reveal, then fade back to transparent — never stay tinted at rest

## Motion principles

- One signature motion per page (the markup reveal). Everything else —
  buttons, hovers, toggles — should be fast (150-250ms) and quiet.
- Reveals stage in sequence (staggered by ~350-450ms), never all at
  once — this is what makes the "live inspection" feeling work.
- Respect `prefers-reduced-motion` — provide an instant/static fallback
  that shows the fully-marked-up end state with no animation.
- No decorative looping animation (no infinite pulsing, no ambient
  particle effects). Motion always represents something happening once,
  not atmosphere.

## Accessibility floor

- Color is never the only signal — pair teal/crimson with icons (check/x)
  and text labels, not color alone.
- All interactive elements need visible focus states.
- Verify contrast of `--gl-ink-faint` (#8A8A82) on `--gl-paper` (#F1F2ED)
  meets WCAG AA for its use (captions/metadata only, not body text).
