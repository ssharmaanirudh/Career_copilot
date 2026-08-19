import { NextResponse } from "next/server";
import { extractResumeText, ResumeParseError } from "@/lib/parseResume";
import { runAmbitionMode, AnalysisError, InvalidInputError } from "@/lib/ambitionMode";
import { checkRateLimit, getClientIp, RateLimitedError } from "@/lib/rateLimiter";
import type { SeniorityLevel } from "@/lib/types";

export const runtime = "nodejs";

const MAX_ROLE_LENGTH = 200;
const MAX_LOCATION_LENGTH = 200;
const MIN_ROLE_LENGTH = 2;
const VALID_SENIORITY = new Set(["", "entry", "mid", "senior"]);

export async function POST(request: Request) {
  try {
    checkRateLimit(getClientIp(request));
  } catch (err) {
    if (err instanceof RateLimitedError) {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    throw err;
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart/form-data with a resume file and a target role." },
      { status: 400 },
    );
  }

  const resumeFile = formData.get("resume");
  const targetRole = formData.get("targetRole");
  const seniorityLevel = formData.get("seniorityLevel");
  const location = formData.get("location");

  if (!(resumeFile instanceof File)) {
    return NextResponse.json({ error: "Missing resume file." }, { status: 400 });
  }
  if (typeof targetRole !== "string" || targetRole.trim().length < MIN_ROLE_LENGTH) {
    return NextResponse.json(
      { error: "Please enter the role you're targeting." },
      { status: 400 },
    );
  }
  if (targetRole.length > MAX_ROLE_LENGTH) {
    return NextResponse.json({ error: "Target role is too long." }, { status: 400 });
  }
  if (typeof location === "string" && location.length > MAX_LOCATION_LENGTH) {
    return NextResponse.json({ error: "Location is too long." }, { status: 400 });
  }
  const seniority = typeof seniorityLevel === "string" ? seniorityLevel : "";
  if (!VALID_SENIORITY.has(seniority)) {
    return NextResponse.json({ error: "Invalid seniority level." }, { status: 400 });
  }

  let resumeText: string;
  try {
    resumeText = await extractResumeText(resumeFile);
  } catch (err) {
    if (err instanceof ResumeParseError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  try {
    const result = await runAmbitionMode(
      resumeText,
      targetRole.trim(),
      seniority as SeniorityLevel,
      typeof location === "string" ? location.trim() : "",
    );
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof InvalidInputError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    if (err instanceof AnalysisError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    console.error("Unexpected Ambition Mode error:", err);
    return NextResponse.json(
      { error: "Something went wrong while building your composite picture. Please try again." },
      { status: 500 },
    );
  }
}
