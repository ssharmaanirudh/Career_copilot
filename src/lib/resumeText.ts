import type { TailoredResume } from "./types";

function bulletLine(b: { label: string; text: string }): string {
  return b.label ? `- ${b.label}: ${b.text}` : `- ${b.text}`;
}

export function resumeToPlainText(resume: TailoredResume): string {
  const lines: string[] = [];

  lines.push(resume.name.toUpperCase());
  if (resume.title) lines.push(resume.title);
  const contact = [resume.phone, resume.email, resume.linkedin, resume.location]
    .filter(Boolean)
    .join(" | ");
  if (contact) lines.push(contact);
  lines.push("");

  if (resume.profile) {
    lines.push("PROFILE");
    lines.push(resume.profile);
    lines.push("");
  }

  if (resume.objective) {
    lines.push(`Objective: ${resume.objective}`);
    lines.push("");
  }

  if (resume.coreStrengths.length > 0) {
    lines.push("CORE STRENGTHS");
    for (const b of resume.coreStrengths) lines.push(bulletLine(b));
    lines.push("");
  }

  if (resume.experience.length > 0) {
    lines.push("PROFESSIONAL EXPERIENCE");
    for (const job of resume.experience) {
      const header = [job.title, job.company, job.location].filter(Boolean).join(" | ");
      lines.push(job.dates ? `${header} (${job.dates})` : header);
      for (const b of job.bullets) lines.push(bulletLine(b));
      lines.push("");
    }
  }

  if (resume.education.length > 0) {
    lines.push("EDUCATION & CERTIFICATIONS");
    for (const ed of resume.education) {
      lines.push([ed.program, ed.institution, ed.date].filter(Boolean).join(" | "));
    }
  }

  return lines.join("\n").trim();
}
