# GapLens — Ambition Mode spec ("I don't have a JD yet")

Reference alongside CLAUDE.md, DESIGN.md, ACTION-PLAN.md, and
MOCK-INTERVIEW.md. This is a new entry path for users who know roughly
what role they want but don't have a specific posting to check against.

## The core risk this spec exists to prevent

If this feature just asks an LLM to generate "typical requirements for
a [role]" from its own training data, it silently reintroduces the
exact failure mode GapLens was built to eliminate — a confident-
sounding checklist with no real evidence behind it, just vocabulary
about what a role "usually" involves. That is not acceptable, even as
a fallback for users without a posting.

**Non-negotiable rule: this mode must be grounded in real, current job
postings, not synthesized from general knowledge.** If real postings
cannot be found or fetched for a given role, the mode must say so
plainly and degrade to something honest (see fallback behavior below),
never quietly substitute invented requirements.

## User flow

1. User selects "I don't have a specific posting" instead of pasting a
   JD.
2. User provides: target role/title (free text, e.g. "Data Analyst"),
   optional seniority level (entry / mid / senior), optional location
   or "remote."
3. System searches for and retrieves a small set (3-5) of real,
   currently-posted job listings matching the role/level.
4. A composite requirements checklist is built from what those real
   postings actually ask for, with each requirement traceable back to
   which source posting(s) it came from.
5. Standard scoring runs against this composite checklist, using the
   exact same extract → verify → cap logic already in place.
6. Results are displayed with clear, persistent visual distinction
   from a single-posting result (see UI requirements below) — this is
   not optional polish, it is the core honesty mechanism of this
   entire mode.

## Data source restriction (non-negotiable)

Only use data sources that are legitimately public and intended for
this kind of aggregate use: real job postings retrieved via a
compliant search/API method, and/or public aggregate skills databases
(e.g. O*NET). Do not scrape or aggregate individual people's profiles
(LinkedIn or any other platform) under any circumstance — including in
service of a "what skills do people in this role actually have"
question. Analyzing publicly published role descriptions (job
postings) is fine; using private individuals' profile data without
their consent is a different and unacceptable category, regardless of
how the underlying question is framed. This restriction applies even
if a technical method to access such data becomes available — the
restriction is about consent and legitimate use, not just technical
or ToS feasibility.

## Domain-aware retrieval (critical fix — broad titles are ambiguous)

Generic role titles (Project Manager, Coordinator, Analyst, Manager)
span wildly different, unrelated industries — a "Project Manager"
posting could be construction, higher-ed facilities, IT, healthcare,
or marketing, with zero overlap in actual required skills. Searching
on the bare title alone will retrieve real, non-hallucinated postings
that are nonetheless the WRONG postings for this specific person — a
different, more dangerous failure mode than fabrication, because it
looks legitimate (real postings, real citations) while being
practically useless or actively misleading.

**Retrieval must be informed by the resume's actual domain, not the
role title alone:**

1. Before searching, infer the person's likely domain/industry
   context from their resume (e.g. "public health / development
   sector programme management," "software engineering / fintech,"
   "K-12 education administration"). This is a real inference step,
   not a guess dressed as fact — state the inferred domain explicitly
   in the output so the user can see and correct it if wrong.
2. Construct search queries combining the stated role with the
   inferred domain (e.g. "Project Manager public health" or "Project
   Manager nonprofit development sector"), not the bare role title
   alone.
3. If the user's resume domain is genuinely adjacent-but-different
   from their stated ambition (e.g. a healthcare professional wanting
   to move into corporate CSR), the search should still connect to the
   TARGET domain implied by their stated role, not stay anchored to
   their current field only — the point is avoiding a random,
   unrelated industry, not blocking legitimate pivots. Use judgment:
   search broadly enough to allow a real pivot, narrowly enough to
   exclude obviously unrelated fields.
4. After retrieval, add an explicit relevance filter: for each
   retrieved posting, check whether its actual listed duties are
   plausibly relevant to the person's stated ambition and background —
   not just whether the title string matches. Exclude postings that
   pass the title match but are clearly a different, unrelated field
   (e.g. a public-health analyst's Project Manager search should not
   pull a university campus-construction-liaison posting requiring a
   specific US state driver's license).
5. Show the user which domain/industry context was used for the
   search, with an option to adjust it (e.g. "searching as: Project
   Manager, public health / development sector — not quite right?
   adjust below") — this keeps the inference visible and correctable,
   consistent with GapLens's general principle of showing reasoning
   rather than hiding it.
6. If after filtering there are fewer than 3 genuinely relevant
   postings remaining, fall back to the existing "insufficient data"
   behavior rather than padding the composite checklist with
   irrelevant postings just to hit a count.

## Step-by-step logic

STEP 1 — Retrieve real postings
Search for 3-5 real, currently active job postings matching the
stated role and level. Prefer recency (posted within the last ~30-60
days) since role requirements shift over time. Store the source
title/company/posting date/URL for each one retrieved.

If fewer than 3 usable postings can be found: do not proceed with a
synthesized checklist. Fall back to the "insufficient data" state (see
below) rather than filling gaps with generated content.

STEP 2 — Build a composite requirements checklist
For each requirement appearing across the retrieved postings:
- If a requirement (or a close equivalent) appears in a majority of
  the retrieved postings, include it, tagged with how many/which
  sources it came from (e.g. "appears in 4 of 5 postings").
- If a requirement appears in only one posting, include it but tag it
  clearly as "appears in 1 of N postings" — do not silently treat a
  one-off requirement the same as a majority-consensus one.
- Classify essential/desirable per the existing extraction logic,
  applied per-source, then aggregate — a requirement is only "core"
  (subject to the hard 15-point cap) if it's essential across a
  genuine majority of sources, not just one posting's phrasing.

STEP 3 — Score as normal
Run the standard verify → cap → categorize pipeline against this
composite checklist exactly as it would run against a single real JD.

STEP 4 — Present with mandatory distinction from single-JD mode
The results view MUST make clear, throughout, that this is a composite
picture built from multiple real current postings for this role — not
a score against one specific employer's actual requirements. See UI
requirements below for exactly how.

## Fallback behavior (insufficient data)

If fewer than 3 real postings can be retrieved for the stated
role/level/location combination:
- Do not proceed with scoring.
- Tell the user plainly: "We couldn't find enough current postings for 
  this exact role to build a reliable picture. Try broadening the role 
  title, removing the location filter, or pasting in a real posting 
  you've found yourself instead."
- Do not offer a degraded synthesized checklist as a silent substitute.

## UI requirements (critical, not cosmetic)

- Persistent banner/label on the results view: something like "Composite 
  picture from N real postings — not a single employer's actual 
  requirements" — visible at all times on this results view, not just 
  on first load.
- Each requirement row shows its source count (e.g. "essential · 
  appears in 4/5 postings") instead of a single evidence-style 
  citation.
- A visible, clickable list of the actual source postings used 
  (title, company, posting date, link if available) so the user can 
  verify this isn't invented.
- The verdict stamp / scoring language should reflect the lower 
  certainty inherent in a composite view — e.g. "would likely struggle 
  against typical postings for this role" rather than the sharper 
  "would not clear a screen" language used for a real single-JD match, 
  since the latter implies certainty about one specific employer's bar 
  that this mode cannot honestly claim.

## What this mode should NOT do

- Should not let a user forget they're looking at a composite, 
  aggregate picture rather than a real employer's actual bar — every 
  screen in this flow needs the distinction visible.
- Should not silently fall back to generated/invented requirements if 
  real postings can't be found.
- Should not blend seamlessly into the single-JD results UI — reusing 
  the same components (RequirementRow, BigScore, VerdictStamp) is fine 
  and good for consistency, but the source-count tags and the 
  persistent composite-picture banner must always be present to keep 
  the two modes visually distinguishable at a glance.

## Cost/quota note

This mode requires additional real-time search/retrieval calls on top 
of the existing scoring calls, and is meaningfully more expensive per 
use than pasting in a single JD. Treat this as a strong candidate for 
a fast-follow release once billing is enabled, not something to launch 
on the free tier — the search step alone could exhaust the remaining 
daily quota quickly.
