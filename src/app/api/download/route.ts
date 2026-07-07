import { NextResponse } from "next/server";
import { buildResumeDocxBuffer, buildCoverLetterDocxBuffer } from "@/lib/buildResumeDocx";
import { buildResumePdfBuffer, buildCoverLetterPdfBuffer } from "@/lib/buildResumePdf";
import type {
  TailoredResume,
  ResumeBullet,
  ResumeExperienceEntry,
  ResumeEducationEntry,
} from "@/lib/types";

export const runtime = "nodejs";

const CONTENT_TYPES = {
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pdf: "application/pdf",
} as const;

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function coerceBullet(b: unknown): ResumeBullet {
  const obj = typeof b === "object" && b !== null ? (b as Record<string, unknown>) : {};
  return { label: str(obj.label), text: str(obj.text) };
}

function coerceBullets(arr: unknown): ResumeBullet[] {
  return Array.isArray(arr) ? arr.map(coerceBullet) : [];
}

function coerceResume(input: unknown): TailoredResume | null {
  if (typeof input !== "object" || input === null) return null;
  const obj = input as Record<string, unknown>;
  const experience = Array.isArray(obj.experience) ? obj.experience : [];
  const education = Array.isArray(obj.education) ? obj.education : [];

  return {
    name: str(obj.name),
    title: str(obj.title),
    phone: str(obj.phone),
    email: str(obj.email),
    linkedin: str(obj.linkedin),
    location: str(obj.location),
    profile: str(obj.profile),
    objective: str(obj.objective),
    coreStrengths: coerceBullets(obj.coreStrengths),
    experience: experience.map((e): ResumeExperienceEntry => {
      const eo = typeof e === "object" && e !== null ? (e as Record<string, unknown>) : {};
      return {
        title: str(eo.title),
        company: str(eo.company),
        location: str(eo.location),
        dates: str(eo.dates),
        bullets: coerceBullets(eo.bullets),
      };
    }),
    education: education
      .filter((ed): ed is Record<string, unknown> => typeof ed === "object" && ed !== null)
      .map(
        (ed): ResumeEducationEntry => ({
          program: str(ed.program),
          institution: str(ed.institution),
          date: str(ed.date),
        }),
      ),
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { kind, format, text, resume } = (body ?? {}) as {
    kind?: unknown;
    format?: unknown;
    text?: unknown;
    resume?: unknown;
  };

  if (format !== "docx" && format !== "pdf") {
    return NextResponse.json({ error: "Invalid export format." }, { status: 400 });
  }

  let buffer: Buffer;
  let fileName: string;

  if (kind === "resume") {
    const parsedResume = coerceResume(resume);
    if (!parsedResume || !parsedResume.name) {
      return NextResponse.json({ error: "Missing resume data to export." }, { status: 400 });
    }
    buffer =
      format === "docx"
        ? await buildResumeDocxBuffer(parsedResume)
        : await buildResumePdfBuffer(parsedResume);
    fileName = `Tailored-Resume.${format}`;
  } else if (kind === "cover-letter") {
    if (typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Missing text to export." }, { status: 400 });
    }
    buffer =
      format === "docx"
        ? await buildCoverLetterDocxBuffer(text)
        : await buildCoverLetterPdfBuffer(text);
    fileName = `Cover-Letter.${format}`;
  } else {
    return NextResponse.json({ error: "Invalid document kind." }, { status: 400 });
  }

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": CONTENT_TYPES[format],
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
