# GapLens — Pivot Mode spec

Reference alongside CLAUDE.md, DESIGN.md, ACTION-PLAN.md, and
AMBITION-MODE.md. This extends the standard scoring engine to handle
career pivots — a user targeting a role or industry different from
their current background — with the same evidence-based discipline
already used everywhere else in GapLens.

## Core principle: assessed fresh, every time, against a real target

Pivot Mode is NOT a one-time "make my resume sound universal" rewrite
that gets reused across applications. It is triggered per-use, exactly
like standard scoring: a specific resume checked against a specific
target JD or stated target role, assessed at that moment, producing a
result specific to that pairing. A person applying to a retail
operations role and a person applying to a corporate consulting role
with the same source resume should get two different Pivot Mode
results, each honestly translated for that specific target — never one
generic "works everywhere" output reused across both.

This matters because a resume genuinely optimized to sound equally
relevant to every industry usually convinces none of them — vague,
unfocused language reads as unfocused to a real hiring manager.
Pivot Mode's actual value is precise, honest translation into ONE
target's vocabulary at a time, repeated fresh for each new target, not
a single universal document.

## When this triggers

- User has selected a target JD (or, if paired with Ambition Mode, a
  target role) that is meaningfully different from what their resume's
  current experience is titled/framed as — e.g. a healthcare
  programme-management background targeting a retail operations role,
  or a developer background targeting a Business Analyst role.
- This can be user-initiated ("I'm pivoting, check my real transferable
  fit") or system-suggested when standard scoring detects the resume's
  apparent field and the target JD's field diverge significantly.

## Step-by-step logic

STEP 1 — Identify the target role's core functions
Break the target JD into its core functions — the actual day-to-day
activities the role involves (e.g. for a retail operations role:
managing multi-site consistency, vendor/supplier coordination,
performance reporting to leadership, staff training and turnover
management) — not just keyword requirements.

STEP 2 — Search the ENTIRE resume for evidence of each core function
For each core function, search the full resume — including bullets
written in the language of the person's CURRENT field — for real
evidence that they've done equivalent work, even if never labeled with
the target field's terminology.

Example: "standardized SOPs and reporting templates across 23
districts" IS real evidence for a retail operations role's "multi-site
process consistency" function, even though the word "retail" or
"store" never appears.

Classify each core function as:
- STRONG TRANSFER: clear, repeated evidence across the resume
- PARTIAL TRANSFER: some evidence, but thin or in a supporting rather
  than primary capacity
- NO TRANSFER: genuinely no evidence in the resume of this function
  ever being performed

Quote the exact resume text supporting each STRONG or PARTIAL
classification. For NO TRANSFER, say so plainly.

STEP 3 — Hard constraints (do NOT do the following, ever)
- Do not invent a title, certification, tool, or project the person
  didn't have.
- Do not reframe purely operational/technical work as something it
  wasn't (e.g. don't turn "trained field staff on data protocols" into
  "led P&L-owning retail store operations" without real evidence of
  P&L ownership).
- Do not use vague euphemism to imply a function was performed when it
  wasn't.
- If fewer than half of the target role's core functions have STRONG
  or PARTIAL transfer, say explicitly that this is a weak pivot
  candidate for THIS specific target — do not manufacture a case that
  isn't there, and do not let a strong result on one target imply
  fitness for a different, unrelated target.

STEP 4 — Output
1. A transferability verdict scoped explicitly to the target JD/role
   just assessed: STRONG PIVOT CASE / MODERATE PIVOT CASE / WEAK PIVOT
   CASE — never phrased as a general, portable claim about the
   person's universal fit across industries.
2. For each STRONG/PARTIAL transfer: the resume evidence, and a
   reframed bullet using only facts already in the original text,
   translated into the target field's vocabulary.
3. For each NO TRANSFER function: flagged plainly as a real gap
   (Category B), with a concrete, honest suggestion for building that
   evidence before applying.
4. The reframed resume still runs through the STANDARD scoring
   pipeline afterward — pivot framing never exempts anyone from the
   hard essential-requirement caps. A well-framed pivot can still score
   low if the target role's core requirements are genuinely unmet.

## UI requirements

- Every Pivot Mode result must visibly state which specific target
  (JD or role) it was assessed against — never presented as a
  standalone, reusable "your universal profile" artifact.
- If a user runs Pivot Mode against two different targets, both
  results should be visible as separate, independent assessments — not
  merged or implied to be interchangeable.
- Reuse existing RequirementRow, BigScore, and VerdictStamp components
  — this is a new assessment mode, not a new visual language.

## Relationship to Ambition Mode

Pivot Mode and Ambition Mode solve different problems and can be used
together: Ambition Mode helps when there's no specific posting yet;
Pivot Mode helps when the target (specific posting or role) is
different from the person's current field. A person could use Ambition
Mode to find real postings for "Retail Operations Manager," then run
Pivot Mode against one of those real postings using their healthcare
background — same domain-aware, evidence-based discipline applied at
both stages.

## Status

Spec complete, not yet built. Prioritize alongside or after Ambition
Mode's domain-aware retrieval fix, given they're complementary features
serving the same underlying need (finding a real, honest fit beyond
one's current field).
