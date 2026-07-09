export type SkillPriority = "high" | "medium" | "low";

export interface ScoreBreakdown {
  skillsMatch: number;
  experienceMatch: number;
  keywordAlignment: number;
  overallPresentation: number;
}

export interface SkillGap {
  skill: string;
  why: string;
  howToLearn: string;
  priority: SkillPriority;
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
  summary: string;
}

export interface AnalysisResult {
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
