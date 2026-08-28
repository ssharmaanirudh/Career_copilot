import { NextResponse } from "next/server";
import { trimResumeToLength } from "@/lib/lengthTrim";
import { coerceResume } from "@/lib/coerceResume";
import { AnalysisError } from "@/lib/geminiClient";
import { checkRateLimit, getClientIp, RateLimitedError } from "@/lib/rateLimiter";
import type { TargetResumeLength } from "@/lib/types";

export const runtime = "nodejs";

const MAX_JD_LENGTH = 20000;

function isTrimTargetLength(v: unknown): v is Exclude<TargetResumeLength, "none"> {
  return v === "1-page" || v === "2-page";
}

export async function POST(request: Request) {
  try {
    checkRateLimit(getClientIp(request));
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

  const { resume, jobDescription, targetLength } = (body ?? {}) as {
    resume?: unknown;
    jobDescription?: unknown;
    targetLength?: unknown;
  };

  const parsedResume = coerceResume(resume);
  if (!parsedResume || !parsedResume.name) {
    return NextResponse.json({ error: "Missing resume data to trim." }, { status: 400 });
  }
  if (typeof jobDescription !== "string" || jobDescription.trim().length === 0) {
    return NextResponse.json({ error: "Missing job description." }, { status: 400 });
  }
  if (jobDescription.length > MAX_JD_LENGTH) {
    return NextResponse.json({ error: "Job description is too long." }, { status: 400 });
  }
  if (!isTrimTargetLength(targetLength)) {
    return NextResponse.json({ error: "targetLength must be '1-page' or '2-page'." }, { status: 400 });
  }

  try {
    const result = await trimResumeToLength(parsedResume, jobDescription.trim(), targetLength);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AnalysisError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    console.error("Unexpected length-trim error:", err);
    return NextResponse.json(
      { error: "Something went wrong while fitting your resume to that length. Please try again." },
      { status: 500 },
    );
  }
}
