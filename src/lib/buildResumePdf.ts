import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import pdfMake from "pdfmake";
import {
  ROBOTO_REGULAR_B64,
  ROBOTO_MEDIUM_B64,
  ROBOTO_ITALIC_B64,
  ROBOTO_MEDIUMITALIC_B64,
} from "./pdfFontsData";
import type { ResumeBullet, TailoredResume } from "./types";

let fontsConfigured = false;

/**
 * pdfmake's resolveUrls step treats any object-typed font descriptor as a
 * {url, headers} pair, and a Buffer is also `typeof === 'object'`, so passing
 * Buffers directly crashes inside pdfmake itself. Materializing the embedded
 * font bytes to a temp file and passing a path string instead sidesteps that,
 * while still not depending on any pre-existing on-disk asset (which may not
 * survive serverless bundling/tracing).
 */
function materializeFont(name: string, base64: string): string {
  const filePath = path.join(os.tmpdir(), `career-copilot-${name}.ttf`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, Buffer.from(base64, "base64"));
  }
  return filePath;
}

function ensurePdfConfigured() {
  if (fontsConfigured) return;
  const fontPaths = {
    normal: materializeFont("Roboto-Regular", ROBOTO_REGULAR_B64),
    bold: materializeFont("Roboto-Medium", ROBOTO_MEDIUM_B64),
    italics: materializeFont("Roboto-Italic", ROBOTO_ITALIC_B64),
    bolditalics: materializeFont("Roboto-MediumItalic", ROBOTO_MEDIUMITALIC_B64),
  };
  pdfMake.setFonts({ Roboto: fontPaths });

  const allowedLocalPaths = new Set(Object.values(fontPaths));
  // Documents are generated purely from our own data (no remote URLs), so
  // deny all URL access, and only allow local reads of the font files we
  // just materialized ourselves.
  pdfMake.setUrlAccessPolicy(() => false);
  pdfMake.setLocalAccessPolicy((p) => allowedLocalPaths.has(p));
  fontsConfigured = true;
}

type PdfContent = Record<string, unknown>;

function bulletContent(b: ResumeBullet): PdfContent[] {
  return b.label
    ? [{ text: `${b.label}: `, bold: true }, { text: b.text }]
    : [{ text: b.text }];
}

function sectionHeading(text: string): PdfContent {
  return {
    stack: [
      { text: text.toUpperCase(), bold: true, fontSize: 11, margin: [0, 10, 0, 2] },
      {
        canvas: [
          { type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: "#1F1F1F" },
        ],
      },
    ],
    margin: [0, 0, 0, 4],
  };
}

function buildResumeContent(resume: TailoredResume): PdfContent[] {
  const content: PdfContent[] = [];

  content.push({ text: resume.name, bold: true, fontSize: 16, alignment: "center" });
  if (resume.title) {
    content.push({ text: resume.title, alignment: "center", margin: [0, 2, 0, 0] });
  }
  const contact = [resume.phone, resume.email, resume.linkedin, resume.location]
    .filter(Boolean)
    .join("   |   ");
  if (contact) {
    content.push({
      text: contact,
      alignment: "center",
      fontSize: 9,
      color: "#555555",
      margin: [0, 2, 0, 10],
    });
  }

  if (resume.profile) {
    content.push(sectionHeading("Profile"));
    content.push({ text: resume.profile, alignment: "justify", margin: [0, 0, 0, 6] });
  }

  if (resume.objective) {
    content.push({
      text: [
        { text: "Objective: ", bold: true, italics: true },
        { text: resume.objective, italics: true },
      ],
      margin: [0, 0, 0, 6],
    });
  }

  if (resume.coreStrengths.length > 0) {
    content.push(sectionHeading("Core Strengths"));
    content.push({
      ul: resume.coreStrengths.map((b) => ({ text: bulletContent(b), alignment: "justify" })),
      margin: [0, 0, 0, 4],
    });
  }

  if (resume.experience.length > 0) {
    content.push(sectionHeading("Professional Experience"));
    for (const job of resume.experience) {
      const headerRuns: PdfContent[] = [{ text: job.title, bold: true }];
      if (job.company) headerRuns.push({ text: ` · ${job.company}` });
      if (job.location) headerRuns.push({ text: ` · ${job.location}`, color: "#555555" });

      content.push({
        columns: [
          { text: headerRuns, width: "*" },
          job.dates
            ? {
                text: job.dates,
                italics: true,
                fontSize: 9,
                color: "#555555",
                alignment: "right",
                width: "auto",
              }
            : { text: "", width: 1 },
        ],
        margin: [0, 6, 0, 0],
      });
      content.push({
        ul: job.bullets.map((b) => ({ text: bulletContent(b), alignment: "justify" })),
        margin: [0, 2, 0, 2],
      });
    }
  }

  if (resume.education.length > 0) {
    content.push(sectionHeading("Education & Certifications"));
    content.push({
      layout: "lightHorizontalLines",
      table: {
        widths: ["40%", "40%", "20%"],
        body: resume.education.map((ed) => [
          { text: ed.program, bold: true },
          { text: ed.institution },
          { text: ed.date, alignment: "right", color: "#555555" },
        ]),
      },
    });
  }

  return content;
}

export async function buildResumePdfBuffer(resume: TailoredResume): Promise<Buffer> {
  ensurePdfConfigured();
  const doc = pdfMake.createPdf({
    pageSize: "A4",
    pageMargins: [40, 40, 40, 40],
    defaultStyle: { font: "Roboto", fontSize: 10, lineHeight: 1.15 },
    content: buildResumeContent(resume),
  });
  return doc.getBuffer();
}

export async function buildCoverLetterPdfBuffer(text: string): Promise<Buffer> {
  ensurePdfConfigured();
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => ({ text: p.replace(/\n/g, " "), alignment: "justify", margin: [0, 0, 0, 10] }));
  const doc = pdfMake.createPdf({
    pageSize: "A4",
    pageMargins: [50, 50, 50, 50],
    defaultStyle: { font: "Roboto", fontSize: 11, lineHeight: 1.3 },
    content: paragraphs,
  });
  return doc.getBuffer();
}
