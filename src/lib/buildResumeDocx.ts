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

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 240, after: 120 },
    border: SECTION_BORDER,
    children: [
      new TextRun({ text: text.toUpperCase(), bold: true, size: 20 }),
    ],
  });
}

function bulletParagraph(b: ResumeBullet): Paragraph {
  const children = b.label
    ? [
        new TextRun({ text: `${b.label}: `, bold: true, size: 20 }),
        new TextRun({ text: b.text, size: 20 }),
      ]
    : [new TextRun({ text: b.text, size: 20 })];
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 60 },
    alignment: AlignmentType.JUSTIFIED,
    children,
  });
}

export async function buildResumeDocxBuffer(resume: TailoredResume): Promise<Buffer> {
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
        children: [new TextRun({ text: resume.title, size: 20 })],
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
        children: [new TextRun({ text: contact, size: 18, color: "555555" })],
      }),
    );
  }

  if (resume.profile) {
    children.push(sectionHeading("Profile"));
    children.push(
      new Paragraph({
        spacing: { after: 80 },
        alignment: AlignmentType.JUSTIFIED,
        children: [new TextRun({ text: resume.profile, size: 20 })],
      }),
    );
  }

  if (resume.objective) {
    children.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({ text: "Objective: ", bold: true, italics: true, size: 20 }),
          new TextRun({ text: resume.objective, italics: true, size: 20 }),
        ],
      }),
    );
  }

  if (resume.coreStrengths.length > 0) {
    children.push(sectionHeading("Core Strengths"));
    for (const b of resume.coreStrengths) children.push(bulletParagraph(b));
  }

  if (resume.experience.length > 0) {
    children.push(sectionHeading("Professional Experience"));
    for (const job of resume.experience) {
      const headerRuns: TextRun[] = [new TextRun({ text: job.title, bold: true, size: 20 })];
      if (job.company) headerRuns.push(new TextRun({ text: ` · ${job.company}`, size: 20 }));
      if (job.location) {
        headerRuns.push(new TextRun({ text: ` · ${job.location}`, size: 20, color: "555555" }));
      }
      if (job.dates) {
        headerRuns.push(
          new TextRun({ text: ` ${job.dates}`, italics: true, size: 18, color: "555555" }),
        );
      }
      children.push(new Paragraph({ spacing: { before: 120 }, children: headerRuns }));
      for (const b of job.bullets) children.push(bulletParagraph(b));
    }
  }

  if (resume.education.length > 0) {
    children.push(sectionHeading("Education & Certifications"));
    const rows = resume.education.map(
      (ed) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: ed.program, bold: true, size: 20 })] })],
            }),
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: ed.institution, size: 20 })] })],
            }),
            new TableCell({
              width: { size: 20, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [new TextRun({ text: ed.date, size: 20, color: "555555" })],
                }),
              ],
            }),
          ],
        }),
    );
    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
  }

  const doc = new Document({
    sections: [{ properties: {}, children }],
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
