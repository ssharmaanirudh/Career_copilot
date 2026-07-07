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
    <h3 className="mb-2 mt-5 border-b-2 border-zinc-800 pb-1 text-xs font-bold uppercase tracking-wide text-zinc-900 first:mt-0 dark:border-zinc-300 dark:text-zinc-100">
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
        {error && (
          <span className="mr-auto text-sm text-rose-600 dark:text-rose-400">{error}</span>
        )}
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
        <button
          type="button"
          onClick={() => handleDownload("docx")}
          disabled={busy !== null}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {busy === "docx" ? "Preparing…" : "Download .docx"}
        </button>
        <button
          type="button"
          onClick={() => handleDownload("pdf")}
          disabled={busy !== null}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {busy === "pdf" ? "Preparing…" : "Download .pdf"}
        </button>
      </div>

      <div className="max-h-[36rem] overflow-y-auto rounded-lg border border-zinc-200 bg-white p-6 text-[13px] leading-relaxed text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
        <div className="text-center">
          <h2 className="text-lg font-bold tracking-wide">{resume.name}</h2>
          {resume.title && <p className="text-sm">{resume.title}</p>}
          {contact && (
            <p className="text-xs text-zinc-600 dark:text-zinc-400">{contact}</p>
          )}
        </div>

        {resume.profile && (
          <>
            <SectionHeading>Profile</SectionHeading>
            <p>{resume.profile}</p>
          </>
        )}

        {resume.objective && (
          <p className="mt-2 italic text-zinc-700 dark:text-zinc-300">
            Objective: {resume.objective}
          </p>
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
                      <span className="font-normal text-zinc-600 dark:text-zinc-400">
                        {" "}
                        · {job.location}
                      </span>
                    )}
                  </p>
                  {job.dates && (
                    <p className="whitespace-nowrap text-xs italic text-zinc-600 dark:text-zinc-400">
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
                  <tr key={i} className="border-b border-zinc-200 dark:border-zinc-800">
                    <td className="py-1 pr-3 font-semibold">{ed.program}</td>
                    <td className="py-1 pr-3">{ed.institution}</td>
                    <td className="py-1 text-right text-zinc-600 dark:text-zinc-400">
                      {ed.date}
                    </td>
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
