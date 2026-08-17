# GapLens — Resume template variety (future phase, not scoped for build yet)

Reference alongside DESIGN.md. This is about visual layout/template
choice for the tailored resume output — separate and later than the
file-format work (DOCX/PDF/TXT) already in progress.

## The idea

Let users choose from a small set of visual resume layouts/templates
when exporting their tailored resume, rather than one fixed format for
everyone.

## Why this is a later phase, not now

- The file-format work (DOCX/PDF/TXT) already solves the more urgent,
  higher-value problem: making sure the resume is *readable and ATS-safe*
  at all. Visual variety is a refinement on top of that, not a
  replacement for it.
- Each additional template is real design + engineering work (a new
  layout, tested for both DOCX and PDF export, checked for ATS
  parseability) — this multiplies effort per template, so scope
  carefully rather than promising "many templates" up front.
- Template variety has a real risk of design sprawl if not scoped
  tightly — worth deciding a small, deliberate set (e.g. 2-3 templates)
  rather than an open-ended library.

## What to get right when this is actually built

- **ATS-safety first.** Any visual template offered must still be
  genuinely parseable by real ATS systems — no template should be
  purely decorative at the expense of being machine-readable. Test
  each template's actual parsed-text output, not just how it looks.
- **Stay inside the existing content, not a new generation path.**
  Templates should be different visual presentations of the exact same
  tailored content already generated — not a reason to regenerate or
  reword content differently per template.
- **Keep template choice simple**, not a design tool. This is "pick a
  clean, professional layout," not a resume builder with fonts/colors/
  spacing controls — that's a different, much bigger product.
- **One template should stay the safe, ATS-optimized default** —
  whatever ships as the plain default today (from the current
  DOCX/PDF/TXT work) — so a user who doesn't engage with template
  choice at all still gets the safest option automatically.

## Status

Not scoped for build. Revisit after the file-format work ships and
there's a reason to believe real users want visual variety specifically
(vs. just wanting a safe, working export, which the current work
already addresses).
