import { NextResponse } from "next/server";
import { generateActionPlan } from "@/lib/actionPlan";
import { AnalysisError } from "@/lib/geminiClient";
import { checkRateLimit, RateLimitedError } from "@/lib/rateLimiter";
import type { AnalysisResult, TimeBudget } from "@/lib/types";

export const runtime = "nodejs";

const VALID_TIME_BUDGETS: TimeBudget[] = [
  "today",
  "this week",
  "2-4 weeks",
  "1-3 months",
  "3+ months",
];

export async function POST(request: Request) {
  try {
    checkRateLimit();
  } catch (err) {
    if (err instanceof RateLimitedError) {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    throw err;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON request body." }, { status: 400 });
  }

  const { scoringResult, timeBudget } = (body ?? {}) as {
    scoringResult?: unknown;
    timeBudget?: unknown;
  };

  if (
    !scoringResult ||
    typeof scoringResult !== "object" ||
    !Array.isArray((scoringResult as AnalysisResult).requirementsChecklist)
  ) {
    return NextResponse.json(
      { error: "Missing or invalid scoring result. Run an analysis first." },
      { status: 400 },
    );
  }
  if (typeof timeBudget !== "string" || !VALID_TIME_BUDGETS.includes(timeBudget as TimeBudget)) {
    return NextResponse.json(
      { error: `timeBudget must be one of: ${VALID_TIME_BUDGETS.join(", ")}.` },
      { status: 400 },
    );
  }

  try {
    const result = await generateActionPlan(
      scoringResult as AnalysisResult,
      timeBudget as TimeBudget,
    );
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AnalysisError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    console.error("Unexpected action plan error:", err);
    return NextResponse.json(
      { error: "Something went wrong while building your action plan. Please try again." },
      { status: 500 },
    );
  }
}
