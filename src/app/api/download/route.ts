import { NextResponse } from "next/server";
import { buildResumeDocxBuffer, buildCoverLetterDocxBuffer } from "@/lib/buildResumeDocx";
import { buildResumePdfBuffer, buildCoverLetterPdfBuffer } from "@/lib/buildResumePdf";
import { resumeToPlainText } from "@/lib/resumeText";
import { coerceResume } from "@/lib/coerceResume";
import type { TargetResumeLength } from "@/lib/types";

export const runtime = "nodejs";

const CONTENT_TYPES = {
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pdf: "application/pdf",
  txt: "text/plain; charset=utf-8",
} as const;

// Render tiers for the optional page-length target (PIVOT-MODE-adjacent
// feature, see lengthTrim.ts): "1-page" pairs content trimming with a
// modest formatting tightening, since content-cutting alone would need to
// be far more aggressive to hit the target on typography alone. "2-page"
// and "none" use the renderers' own defaults (unchanged).
const DOCX_RENDER_TIERS: Record<TargetResumeLength, { bodyFontSize?: number; marginTwips?: number }> = {
  "1-page": { bodyFontSize: 18, marginTwips: 900 },
  "2-page": {},
  none: {},
};
const PDF_RENDER_TIERS: Record<TargetResumeLength, { bodyFontSize?: number; marginPt?: number }> = {
  "1-page": { bodyFontSize: 9, marginPt: 30 },
  "2-page": {},
  none: {},
};

function isTargetLength(v: unknown): v is TargetResumeLength {
  return v === "1-page" || v === "2-page" || v === "none";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { kind, format, text, resume, targetLength } = (body ?? {}) as {
    kind?: unknown;
    format?: unknown;
    text?: unknown;
    resume?: unknown;
    targetLength?: unknown;
  };

  if (format !== "docx" && format !== "pdf" && format !== "txt") {
    return NextResponse.json({ error: "Invalid export format." }, { status: 400 });
  }
  const lengthTier: TargetResumeLength = isTargetLength(targetLength) ? targetLength : "none";

  let buffer: Buffer;
  let fileName: string;

  if (kind === "resume") {
    const parsedResume = coerceResume(resume);
    if (!parsedResume || !parsedResume.name) {
      return NextResponse.json({ error: "Missing resume data to export." }, { status: 400 });
    }
    if (format === "txt") {
      buffer = Buffer.from(resumeToPlainText(parsedResume), "utf-8");
    } else {
      buffer =
        format === "docx"
          ? await buildResumeDocxBuffer(parsedResume, DOCX_RENDER_TIERS[lengthTier])
          : await buildResumePdfBuffer(parsedResume, PDF_RENDER_TIERS[lengthTier]);
    }
    fileName = `Tailored-Resume.${format}`;
  } else if (kind === "cover-letter") {
    if (typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Missing text to export." }, { status: 400 });
    }
    if (format === "txt") {
      buffer = Buffer.from(text, "utf-8");
    } else {
      buffer =
        format === "docx"
          ? await buildCoverLetterDocxBuffer(text)
          : await buildCoverLetterPdfBuffer(text);
    }
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
