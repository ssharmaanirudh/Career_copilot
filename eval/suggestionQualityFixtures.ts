/**
 * Fixtures for the suggestion-quality eval dimension. Distinct from
 * fixtures.ts's classification checks (essential/desirable, met/not_met,
 * score ranges) — this dimension asks a different question: when the
 * pipeline correctly identifies a genuine, unaddressed gap (Category B —
 * no wording fix can cover it), is the resulting suggestion actually
 * useful, or just confident-sounding filler?
 *
 * Only fixtures whose expected output is a genuine real gap are listed
 * here. buried-evidence-wording-fix is deliberately excluded — that
 * fixture's whole point is that the "gap" isn't real (it's evidence that
 * exists but is poorly stated), so it should produce a wordingFix, not a
 * skillGap, and doesn't belong in a suggestion-quality check for gaps.
 */

export interface SuggestionQualityCase {
  /** References an id in fixtures.ts. */
  fixtureId: string;
  /** Short human label for the gap this fixture is expected to surface, for reporting. */
  expectedGapLabel: string;
}

export const SUGGESTION_QUALITY_CASES: SuggestionQualityCase[] = [
  { fixtureId: "explicit-mismatch-marketing", expectedGapLabel: "A/B testing experience" },
  { fixtureId: "explicit-mismatch-operations", expectedGapLabel: "Python / SQL" },
  { fixtureId: "explicit-hard-mismatch-datascience", expectedGapLabel: "Python/SQL + ML/AWS core stack" },
  { fixtureId: "hard-mismatch-tier-check", expectedGapLabel: "A/B testing + marketing analyst background" },
  { fixtureId: "cross-mismatch-mel-vs-technical", expectedGapLabel: "Python" },
  { fixtureId: "cross-mismatch-swe-vs-reporting", expectedGapLabel: "Power BI / reporting / SOPs" },
  { fixtureId: "narrative-essential-nomatch", expectedGapLabel: "Tableau (5+ years)" },
];
