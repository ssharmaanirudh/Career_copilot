export type SkillPriority = "high" | "medium" | "low";
export type RequirementType = "essential" | "desirable";
export type RequirementStatus = "met" | "not_met";
export type EffortEstimate = "quick" | "medium" | "substantial";
export type EvidenceStrength = "strong" | "thin";

export interface ScoreBreakdown {
  skillsMatch: number;
  experienceMatch: number;
  keywordAlignment: number;
  overallPresentation: number;
}

export interface RequirementCheck {
  requirement: string;
  type: RequirementType;
  status: RequirementStatus;
  /** Exact quoted resume phrase used as evidence; empty string if none exists. */
  evidence: string;
  reasoning: string;
  /** True for exactly one requirement (or zero) — whichever one drives the hard 15-point cap tier when unmet. */
  isCoreRequirement: boolean;
  /** Only meaningful when status is "met": "thin" means a single/brief mention with no real depth, worth confirming further. */
  evidenceStrength: EvidenceStrength;
}

/** Category A: real evidence exists in the resume but is buried/vague — a wording fix, not a skills gap. */
export interface WordingFix {
  requirement: string;
  /** The specific resume line being revised, using only facts already present. */
  currentLine: string;
  suggestedLine: string;
  whyItHelps: string;
}

/** Category B: genuinely absent from the resume — no rewording fixes this, only real evidence does. */
export interface SkillGap {
  skill: string;
  whatsMissing: string;
  /** 1-3 concrete, specific ways to build real evidence — never generic advice. */
  howToBuildEvidence: string[];
  effortEstimate: EffortEstimate;
  priority: SkillPriority;
  /** Name of a specific free learning resource, e.g. "freeCodeCamp: Python for Everybody". Empty if none confident. */
  resourceLabel: string;
  /** Stable top-level/landing-page URL for that resource. Empty if none confident. */
  resourceUrl: string;
}

export interface ResumeBullet {
  /** Optional bold lead-in, e.g. "System Rebuild:" before the rest of the bullet. */
  label: string;
  text: string;
}

export interface ResumeExperienceEntry {
  title: string;
  company: string;
  location: string;
  dates: string;
  bullets: ResumeBullet[];
}

export interface ResumeEducationEntry {
  program: string;
  institution: string;
  date: string;
}

export interface TailoredResume {
  name: string;
  title: string;
  phone: string;
  email: string;
  linkedin: string;
  location: string;
  profile: string;
  objective: string;
  coreStrengths: ResumeBullet[];
  experience: ResumeExperienceEntry[];
  education: ResumeEducationEntry[];
}

export interface ScoreResult {
  matchScore: number;
  scoreBreakdown: ScoreBreakdown;
  /** Blunt one-sentence verdict: would this realistically clear a screen, and why/why not. */
  summary: string;
  unmetEssentialCount: number;
  wouldClearTechnicalScreen: boolean;
  /** Points already deducted for JD-mirrored phrasing with no concrete backing (0 if none). */
  antiGamingPenalty: number;
}

export interface AnalysisResult {
  /** The JD's essential/desirable requirements, each checked against the candidate's real background. Grounds both scores. */
  requirementsChecklist: RequirementCheck[];
  /** Prompt-injection attempts or manipulated/gamed phrasing detected in the submitted JD or resume. */
  flags: string[];
  /** How the resume scored against the JD exactly as submitted, before any edits. */
  originalScore: ScoreResult;
  /** How the tailored resume scores against the same JD, using the same rubric. */
  tailoredScore: ScoreResult;
  tailoredResume: TailoredResume;
  coverLetter: string;
  keyChanges: string[];
  /** Category A: not_met requirements where evidence exists but was poorly surfaced — already applied in tailoredResume. */
  wordingFixes: WordingFix[];
  /** Category B: not_met requirements with no real evidence — genuine gaps to close. */
  skillGaps: SkillGap[];
  /** Ceiling score achievable through wording/emphasis fixes alone, with no new real evidence. */
  maxRealisticScoreAfterWordingFixesOnly: number;
  /** Blunt one/two-sentence takeaway on what wording alone can and cannot fix for this specific resume/JD pair. */
  honestSummary: string;
  /** Direct questions to ask the candidate when essential requirements have no evidence at all, so they can supply real background the resume didn't capture. Empty if the resume already covers the essentials reasonably well. */
  clarifyingQuestions: string[];
}

/** How long until the candidate needs to apply/be ready — directly gates which actions are even feasible to suggest. */
export type TimeBudget = "today" | "this week" | "2-4 weeks" | "1-3 months" | "3+ months";

export type ActionType = "wording_fix" | "real_gap_closure";
export type ActionPlanVerdict = "achievable" | "partial" | "not_reachable";

export interface ActionPlanAction {
  rank: number;
  requirementAddressed: string;
  actionType: ActionType;
  /** Specific and actionable — the exact rewrite for a wording fix, or a concrete way to build evidence for a real gap. */
  description: string;
  /** Whether completing this action would flip requirementAddressed from not_met to met. */
  flipsRequirementToMet: boolean;
  effortEstimate: EffortEstimate;
}

export interface ExcludedActionItem {
  requirement: string;
  /** Why this high-leverage item couldn't be included — e.g. "not reachable in stated timeframe." */
  reason: string;
}

export interface ActionPlanResult {
  timeBudget: TimeBudget;
  /** Top actions ranked by leverage, feasibility-filtered against timeBudget. Fewer than 4 if fewer are genuinely feasible — never padded. */
  actions: ActionPlanAction[];
  /** High-leverage items (e.g. the core requirement) excluded because they aren't feasible in the stated time budget. */
  excludedHighLeverageItems: ExcludedActionItem[];
  /** The score cap if all actions were completed and their target requirements became met, using the same cap-tier rules as standard scoring. */
  projectedScoreCapAfterActions: number;
  verdict: ActionPlanVerdict;
  /** Essential requirements that would remain unmet even after completing all actions. Empty only if verdict is "achievable". */
  unmetEssentialsAfterActions: string[];
  /** One or two blunt sentences: what these actions do and don't achieve, and what to do about any remaining gap. */
  honestSummary: string;
}

export interface AnalyzeErrorResponse {
  error: string;
}

/** Ambition Mode (AMBITION-MODE.md) — composite scoring against several real, currently-posted job listings for a role, rather than one specific JD. */

export type SeniorityLevel = "" | "entry" | "mid" | "senior";

export interface RetrievedPosting {
  title: string;
  company: string;
  /** As stated by the source, e.g. "posted 5 days ago" or "2026-07-01"; empty if not determinable. */
  postingDate: string;
}

/** A grounding citation Gemini's Search Grounding actually returned — shown so the user can verify these are real search results, not invented. */
export interface AmbitionModeSource {
  uri: string;
  label: string;
}

export interface CompositeRequirementCheck {
  requirement: string;
  type: RequirementType;
  status: RequirementStatus;
  /** Exact quoted resume phrase used as evidence; empty string if none exists. */
  evidence: string;
  reasoning: string;
  isCoreRequirement: boolean;
  evidenceStrength: EvidenceStrength;
  /** How many of the retrieved postings this requirement (or a close equivalent) appeared in. */
  sourceCount: number;
  /** Total postings retrieved — the denominator for sourceCount, e.g. "4 of 5". */
  sourceTotal: number;
}

export interface AmbitionModeResult {
  insufficientData: false;
  targetRole: string;
  seniorityLevel: SeniorityLevel;
  location: string;
  postings: RetrievedPosting[];
  sources: AmbitionModeSource[];
  requirementsChecklist: CompositeRequirementCheck[];
  flags: string[];
  score: ScoreResult;
  wordingFixes: WordingFix[];
  skillGaps: SkillGap[];
  /** One or two blunt sentences on what this composite picture does and doesn't tell the candidate. */
  honestSummary: string;
}

export interface AmbitionModeFallback {
  insufficientData: true;
  message: string;
  postingsFound: number;
}

export type AmbitionModeResponse = AmbitionModeResult | AmbitionModeFallback;

export interface AmbitionModeErrorResponse {
  error: string;
}
