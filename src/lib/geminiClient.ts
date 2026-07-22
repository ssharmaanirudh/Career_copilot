import { GoogleGenAI, ApiError } from "@google/genai";

export const MODEL = "gemini-2.5-flash";

export class AnalysisError extends Error {}

let client: GoogleGenAI | null = null;

export function getClient(): GoogleGenAI {
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

// Transient upstream conditions worth retrying: 503 = Gemini overloaded
// (common on the free tier under load), 429 = rate limited.
const RETRYABLE_STATUS = new Set([429, 503]);
const RETRY_DELAYS_MS = [1000, 2500];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithRetry(
  ai: GoogleGenAI,
  params: Parameters<GoogleGenAI["models"]["generateContent"]>[0],
) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err) {
      const isRetryable = err instanceof ApiError && RETRYABLE_STATUS.has(err.status);
      if (!isRetryable || attempt >= RETRY_DELAYS_MS.length) {
        throw err;
      }
      await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }
}

/** Calls Gemini with retry, translates transient upstream errors into a friendly AnalysisError, and returns the raw response text. Shared by every feature that calls Gemini (core scoring, Action Plan, Mock Interview). */
export async function generateStructuredJson(
  params: Parameters<GoogleGenAI["models"]["generateContent"]>[0],
): Promise<string> {
  const ai = getClient();
  let responseText: string | undefined;
  try {
    const response = await generateWithRetry(ai, params);
    responseText = response.text;
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 503) {
        throw new AnalysisError(
          "Our AI provider is experiencing very high demand right now. Please wait a moment and try again.",
        );
      }
      if (err.status === 429) {
        throw new AnalysisError(
          "We've hit our AI usage limit for the moment. Please try again in a minute.",
        );
      }
      throw new AnalysisError(`AI request failed: ${err.message}`);
    }
    throw err;
  }

  if (!responseText) {
    throw new AnalysisError("The AI didn't return a structured analysis. Please try again.");
  }
  return responseText;
}
