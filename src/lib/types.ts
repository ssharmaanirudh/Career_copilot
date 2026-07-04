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

export interface AnalysisResult {
  matchScore: number;
  scoreBreakdown: ScoreBreakdown;
  scoreSummary: string;
  tailoredResume: string;
  coverLetter: string;
  keyChanges: string[];
  skillGaps: SkillGap[];
}

export interface AnalyzeErrorResponse {
  error: string;
}
