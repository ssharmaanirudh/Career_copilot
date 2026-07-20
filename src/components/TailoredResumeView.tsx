"use client";

import { useState } from "react";
import type { ResumeBullet, TailoredResume } from "@/lib/types";
import { resumeToPlainText } from "@/lib/resumeText";
import { downloadFromApi } from "@/lib/clientDownload";

function BulletList({ bullets }: { bullets: ResumeBullet[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5">
      {bullets.map((b, i) => (
        <li key={i}>
          {b.label && <strong className="font-semibold">{b.label}: </strong>}
          {b.text}
        </li>
      ))}
    </ul>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 mt-5 border-b-2 border-gl-ink pb-1 text-xs font-bold uppercase tracking-wide text-gl-ink first:mt-0">
      {children}
    </h3>
  );
}

export function TailoredResumeView({ resume }: { resume: TailoredResume }) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<"docx" | "pdf" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCopy() {
    await navigator.clipboard.writeText(resumeToPlainText(resume));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownload(format: "docx" | "pdf") {
    setBusy(format);
    setError(null);
    try {
      await downloadFromApi(
        { kind: "resume", format, resume },
        `Tailored-Resume.${format}`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed.");
    } finally {
      setBusy(null);
    }
  }

  const contact = [resume.phone, resume.email, resume.linkedin, resume.location]
    .filter(Boolean)
    .join("  |  ");

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
        {error && <span className="mr-auto text-sm text-gl-crimson">{error}</span>}
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-lg border border-gl-ink/15 px-3 py-1.5 text-sm font-medium text-gl-ink-muted transition-colors hover:bg-gl-ink/5"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
        <button
          type="button"
          onClick={() => handleDownload("docx")}
          disabled={busy !== null}
          className="rounded-lg border border-gl-ink/15 px-3 py-1.5 text-sm font-medium text-gl-ink-muted transition-colors hover:bg-gl-ink/5 disabled:opacity-60"
        >
          {busy === "docx" ? "Preparing…" : "Download .docx"}
        </button>
        <button
          type="button"
          onClick={() => handleDownload("pdf")}
          disabled={busy !== null}
          className="brand-gradient-bg rounded-lg px-3 py-1.5 text-sm font-medium text-white shadow-sm shadow-gl-teal/25 transition-shadow hover:shadow-md hover:shadow-gl-teal/30 disabled:opacity-60 disabled:shadow-none"
        >
          {busy === "pdf" ? "Preparing…" : "Download .pdf"}
        </button>
      </div>

      <div className="max-h-[36rem] overflow-y-auto rounded-xl border border-gl-ink/10 bg-gl-paper-card p-6 text-[13px] leading-relaxed text-gl-ink shadow-inner shadow-black/5">
        <div className="text-center">
          <h2 className="text-lg font-bold tracking-wide">{resume.name}</h2>
          {resume.title && <p className="text-sm">{resume.title}</p>}
          {contact && <p className="text-xs text-gl-ink-muted">{contact}</p>}
        </div>

        {resume.profile && (
          <>
            <SectionHeading>Profile</SectionHeading>
            <p>{resume.profile}</p>
          </>
        )}

        {resume.objective && (
          <p className="mt-2 italic text-gl-ink-muted">Objective: {resume.objective}</p>
        )}

        {resume.coreStrengths.length > 0 && (
          <>
            <SectionHeading>Core Strengths</SectionHeading>
            <BulletList bullets={resume.coreStrengths} />
          </>
        )}

        {resume.experience.length > 0 && (
          <>
            <SectionHeading>Professional Experience</SectionHeading>
            {resume.experience.map((job, i) => (
              <div key={i} className="mb-3 last:mb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="font-bold">
                    {job.title}
                    {job.company && <span className="font-normal"> · {job.company}</span>}
                    {job.location && (
                      <span className="font-normal text-gl-ink-muted"> · {job.location}</span>
                    )}
                  </p>
                  {job.dates && (
                    <p className="whitespace-nowrap text-xs italic text-gl-ink-muted">
                      {job.dates}
                    </p>
                  )}
                </div>
                <BulletList bullets={job.bullets} />
              </div>
            ))}
          </>
        )}

        {resume.education.length > 0 && (
          <>
            <SectionHeading>Education &amp; Certifications</SectionHeading>
            <table className="w-full border-collapse text-[13px]">
              <tbody>
                {resume.education.map((ed, i) => (
                  <tr key={i} className="border-b border-gl-ink/10">
                    <td className="py-1 pr-3 font-semibold">{ed.program}</td>
                    <td className="py-1 pr-3">{ed.institution}</td>
                    <td className="py-1 text-right text-gl-ink-muted">{ed.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
