export type SkillPriority = "high" | "medium" | "low";
export type RequirementType = "essential" | "desirable";
export type RequirementStatus = "met" | "not_met";

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
}

export interface SkillGap {
  skill: string;
  why: string;
  howToLearn: string;
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
  skillGaps: SkillGap[];
}

export interface AnalyzeErrorResponse {
  error: string;
}
