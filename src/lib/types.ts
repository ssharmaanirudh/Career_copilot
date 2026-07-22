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

export interface AnalyzeErrorResponse {
  error: string;
}
