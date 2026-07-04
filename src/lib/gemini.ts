import { GoogleGenAI, ApiError, type Schema, Type } from "@google/genai";
import type { AnalysisResult } from "./types";

const MODEL = "gemini-2.5-flash";

export class AnalysisError extends Error {}

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AnalysisError(
      "Server is missing GEMINI_API_KEY. Set it in your environment to enable analysis.",
    );
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

const SYSTEM_PROMPT = `You are Career Co-Pilot, an expert resume writer, career coach, and technical recruiter with 15+ years of experience across tech, finance, and operations hiring.

Given a candidate's existing resume and a target job description, you will:
1. Rewrite the resume so it is precisely tailored to the job description: mirror its key terminology and required skills wherever truthfully supported by the candidate's actual background, reorder and re-emphasize bullet points around what the role values most, quantify impact where possible, and keep it ATS-friendly (plain text, clear section headers, no tables/graphics). NEVER invent employers, titles, dates, degrees, or accomplishments the candidate did not provide — only rephrase, reorder, re-emphasize, and tighten existing content.
2. Write a tailored, specific cover letter (3-4 short paragraphs) that connects the candidate's real experience to this specific role and company/industry context from the JD. Avoid generic filler language.
3. Score how strong this application is for this specific role on a 0-100 scale, with a breakdown across skillsMatch, experienceMatch, keywordAlignment, and overallPresentation (each 0-100), plus a 2-3 sentence plain-English summary of the score.
4. List the concrete changes you made to the resume and why (short bullet points), so the candidate understands what changed.
5. Identify the specific skills or qualifications the candidate is missing or weak on relative to this job description, ranked by priority, each with a one-line reason and a concrete, actionable way to learn it (course, project, certification, etc.).

Be honest and calibrated in scoring — do not inflate scores. A resume with major gaps relative to the JD should score low. Respond only with the requested JSON.`;

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    matchScore: {
      type: Type.INTEGER,
      description: "Overall application strength for this role, 0-100.",
    },
    scoreBreakdown: {
      type: Type.OBJECT,
      properties: {
        skillsMatch: { type: Type.INTEGER },
        experienceMatch: { type: Type.INTEGER },
        keywordAlignment: { type: Type.INTEGER },
        overallPresentation: { type: Type.INTEGER },
      },
      required: [
        "skillsMatch",
        "experienceMatch",
        "keywordAlignment",
        "overallPresentation",
      ],
    },
    scoreSummary: {
      type: Type.STRING,
      description: "2-3 sentence plain-English explanation of the score.",
    },
    tailoredResume: {
      type: Type.STRING,
      description:
        "The full rewritten, ATS-friendly resume as plain text, ready to copy or export.",
    },
    coverLetter: {
      type: Type.STRING,
      description: "The full tailored cover letter as plain text.",
    },
    keyChanges: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Short bullet points describing what changed in the resume and why.",
    },
    skillGaps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          skill: { type: Type.STRING },
          why: { type: Type.STRING, description: "Why this matters for the role." },
          howToLearn: {
            type: Type.STRING,
            description: "A concrete, actionable way to close this gap.",
          },
          priority: { type: Type.STRING, enum: ["high", "medium", "low"] },
        },
        required: ["skill", "why", "howToLearn", "priority"],
      },
    },
  },
  required: [
    "matchScore",
    "scoreBreakdown",
    "scoreSummary",
    "tailoredResume",
    "coverLetter",
    "keyChanges",
    "skillGaps",
  ],
};

function clampScore(n: unknown): number {
  const num = typeof n === "number" && Number.isFinite(n) ? n : 0;
  return Math.max(0, Math.min(100, Math.round(num)));
}

function normalizeResult(raw: Record<string, unknown>): AnalysisResult {
  const breakdown = (raw.scoreBreakdown as Record<string, unknown>) ?? {};
  const skillGaps = Array.isArray(raw.skillGaps) ? raw.skillGaps : [];
  const keyChanges = Array.isArray(raw.keyChanges) ? raw.keyChanges : [];

  return {
    matchScore: clampScore(raw.matchScore),
    scoreBreakdown: {
      skillsMatch: clampScore(breakdown.skillsMatch),
      experienceMatch: clampScore(breakdown.experienceMatch),
      keywordAlignment: clampScore(breakdown.keywordAlignment),
      overallPresentation: clampScore(breakdown.overallPresentation),
    },
    scoreSummary: typeof raw.scoreSummary === "string" ? raw.scoreSummary : "",
    tailoredResume:
      typeof raw.tailoredResume === "string" ? raw.tailoredResume : "",
    coverLetter: typeof raw.coverLetter === "string" ? raw.coverLetter : "",
    keyChanges: keyChanges.filter((c): c is string => typeof c === "string"),
    skillGaps: skillGaps
      .filter(
        (g): g is Record<string, unknown> =>
          typeof g === "object" && g !== null,
      )
      .map((g) => ({
        skill: typeof g.skill === "string" ? g.skill : "",
        why: typeof g.why === "string" ? g.why : "",
        howToLearn: typeof g.howToLearn === "string" ? g.howToLearn : "",
        priority:
          g.priority === "high" || g.priority === "medium" || g.priority === "low"
            ? g.priority
            : "medium",
      })),
  };
}

export async function analyzeResumeAgainstJob(
  resumeText: string,
  jobDescription: string,
): Promise<AnalysisResult> {
  const ai = getClient();

  const userMessage = `CANDIDATE RESUME:\n"""\n${resumeText}\n"""\n\nTARGET JOB DESCRIPTION:\n"""\n${jobDescription}\n"""`;

  let responseText: string | undefined;
  try {
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || MODEL,
      contents: userMessage,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });
    responseText = response.text;
  } catch (err) {
    if (err instanceof ApiError) {
      throw new AnalysisError(`AI request failed: ${err.message}`);
    }
    throw err;
  }

  if (!responseText) {
    throw new AnalysisError("The AI didn't return a structured analysis. Please try again.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    throw new AnalysisError("The AI response wasn't valid JSON. Please try again.");
  }

  return normalizeResult(parsed as Record<string, unknown>);
}
