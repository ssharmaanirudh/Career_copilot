import { NextResponse } from "next/server";
import { extractResumeText, ResumeParseError } from "@/lib/parseResume";
import { analyzeResumeAgainstJob, AnalysisError, InvalidInputError } from "@/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_JOB_DESCRIPTION_LENGTH = 20000;

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart/form-data with a resume file and job description." },
      { status: 400 },
    );
  }

  const resumeFile = formData.get("resume");
  const jobDescription = formData.get("jobDescription");

  if (!(resumeFile instanceof File)) {
    return NextResponse.json({ error: "Missing resume file." }, { status: 400 });
  }
  if (typeof jobDescription !== "string" || jobDescription.trim().length < 30) {
    return NextResponse.json(
      { error: "Please paste the full job description (at least a few sentences)." },
      { status: 400 },
    );
  }
  if (jobDescription.length > MAX_JOB_DESCRIPTION_LENGTH) {
    return NextResponse.json(
      { error: "Job description is too long." },
      { status: 400 },
    );
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
    const result = await analyzeResumeAgainstJob(resumeText, jobDescription.trim());
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof InvalidInputError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    if (err instanceof AnalysisError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    console.error("Unexpected analysis error:", err);
    return NextResponse.json(
      { error: "Something went wrong while analyzing your resume. Please try again." },
      { status: 500 },
    );
  }
}
