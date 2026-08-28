import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type { ResumeBullet, TailoredResume } from "./types";

const SECTION_BORDER = {
  bottom: { style: BorderStyle.SINGLE, size: 6, color: "1F1F1F", space: 2 },
};

/**
 * Formatting lever for the optional page-length target (see
 * src/lib/lengthTrim.ts for the content-selection lever, which is the
 * separate, primary mechanism — this alone can't hit a page target, it
 * just buys a modest amount of extra room). Purely typographic: neither
 * option ever causes this renderer to drop, truncate, or auto-fit content
 * — every field it's given is always rendered in full.
 */
export interface ResumeRenderOptions {
  /** Half-points, docx's native unit (20 = 10pt body text). Defaults to 20. */
  bodyFontSize?: number;
  /** Twips (1440 = 1in). Defaults to docx's built-in ~1440 on all sides. */
  marginTwips?: number;
}

function sectionHeading(text: string, bodyFontSize: number): Paragraph {
  return new Paragraph({
    spacing: { before: 240, after: 120 },
    border: SECTION_BORDER,
    children: [
      new TextRun({ text: text.toUpperCase(), bold: true, size: bodyFontSize }),
    ],
  });
}

function bulletParagraph(b: ResumeBullet, bodyFontSize: number): Paragraph {
  const children = b.label
    ? [
        new TextRun({ text: `${b.label}: `, bold: true, size: bodyFontSize }),
        new TextRun({ text: b.text, size: bodyFontSize }),
      ]
    : [new TextRun({ text: b.text, size: bodyFontSize })];
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 60 },
    alignment: AlignmentType.JUSTIFIED,
    children,
  });
}

export async function buildResumeDocxBuffer(
  resume: TailoredResume,
  options: ResumeRenderOptions = {},
): Promise<Buffer> {
  const bodyFontSize = options.bodyFontSize ?? 20;
  const smallFontSize = Math.max(14, bodyFontSize - 2);
  const children: (Paragraph | Table)[] = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: resume.name, bold: true, size: 32 })],
    }),
  );
  if (resume.title) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [new TextRun({ text: resume.title, size: bodyFontSize })],
      }),
    );
  }
  const contact = [resume.phone, resume.email, resume.linkedin, resume.location]
    .filter(Boolean)
    .join("  |  ");
  if (contact) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({ text: contact, size: smallFontSize, color: "555555" })],
      }),
    );
  }

  if (resume.profile) {
    children.push(sectionHeading("Profile", bodyFontSize));
    children.push(
      new Paragraph({
        spacing: { after: 80 },
        alignment: AlignmentType.JUSTIFIED,
        children: [new TextRun({ text: resume.profile, size: bodyFontSize })],
      }),
    );
  }

  if (resume.objective) {
    children.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({ text: "Objective: ", bold: true, italics: true, size: bodyFontSize }),
          new TextRun({ text: resume.objective, italics: true, size: bodyFontSize }),
        ],
      }),
    );
  }

  if (resume.coreStrengths.length > 0) {
    children.push(sectionHeading("Core Strengths", bodyFontSize));
    for (const b of resume.coreStrengths) children.push(bulletParagraph(b, bodyFontSize));
  }

  if (resume.experience.length > 0) {
    children.push(sectionHeading("Professional Experience", bodyFontSize));
    for (const job of resume.experience) {
      const headerRuns: TextRun[] = [new TextRun({ text: job.title, bold: true, size: bodyFontSize })];
      if (job.company) {
        headerRuns.push(new TextRun({ text: ` · ${job.company}`, size: bodyFontSize }));
      }
      if (job.location) {
        headerRuns.push(
          new TextRun({ text: ` · ${job.location}`, size: bodyFontSize, color: "555555" }),
        );
      }
      if (job.dates) {
        headerRuns.push(
          new TextRun({ text: ` ${job.dates}`, italics: true, size: smallFontSize, color: "555555" }),
        );
      }
      children.push(new Paragraph({ spacing: { before: 120 }, children: headerRuns }));
      for (const b of job.bullets) children.push(bulletParagraph(b, bodyFontSize));
    }
  }

  if (resume.education.length > 0) {
    children.push(sectionHeading("Education & Certifications", bodyFontSize));
    const rows = resume.education.map(
      (ed) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: ed.program, bold: true, size: bodyFontSize })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({ children: [new TextRun({ text: ed.institution, size: bodyFontSize })] }),
              ],
            }),
            new TableCell({
              width: { size: 20, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [new TextRun({ text: ed.date, size: bodyFontSize, color: "555555" })],
                }),
              ],
            }),
          ],
        }),
    );
    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
  }

  const pageProperties =
    options.marginTwips !== undefined
      ? {
          page: {
            margin: {
              top: options.marginTwips,
              right: options.marginTwips,
              bottom: options.marginTwips,
              left: options.marginTwips,
            },
          },
        }
      : {};

  const doc = new Document({
    sections: [{ properties: pageProperties, children }],
  });
  return Packer.toBuffer(doc);
}

export async function buildCoverLetterDocxBuffer(text: string): Promise<Buffer> {
  const paragraphs = text
    .split("\n")
    .map(
      (line) =>
        new Paragraph({
          spacing: { after: 120 },
          alignment: AlignmentType.JUSTIFIED,
          children: [new TextRun({ text: line, size: 22 })],
        }),
    );
  const doc = new Document({
    sections: [{ properties: {}, children: paragraphs }],
  });
  return Packer.toBuffer(doc);
}
