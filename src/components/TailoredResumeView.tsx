"use client";

import { useState } from "react";
import type { LengthCut, ResumeBullet, TailoredResume, TargetResumeLength } from "@/lib/types";
import { resumeToPlainText } from "@/lib/resumeText";
import { downloadFromApi } from "@/lib/clientDownload";
import { LengthCutNotice } from "./LengthCutNotice";

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

const LENGTH_OPTIONS: { value: TargetResumeLength; label: string }[] = [
  { value: "none", label: "No limit" },
  { value: "1-page", label: "1 page" },
  { value: "2-page", label: "2 pages" },
];

export function TailoredResumeView({
  resume,
  jobDescription,
}: {
  resume: TailoredResume;
  jobDescription: string;
}) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<"docx" | "pdf" | "txt" | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Length target defaults to "no limit" — natural length, zero extra
  // calls, download available immediately. Selecting a target is always
  // optional, never a gate before download.
  const [targetLength, setTargetLength] = useState<TargetResumeLength>("none");
  const [trimmedResume, setTrimmedResume] = useState<TailoredResume | null>(null);
  const [cuts, setCuts] = useState<LengthCut[]>([]);
  const [trimming, setTrimming] = useState(false);
  const [trimError, setTrimError] = useState<string | null>(null);

  const effectiveResume = targetLength !== "none" && trimmedResume ? trimmedResume : resume;
  // While a target is selected, block export until trimming has actually
  // succeeded — downloading the untrimmed resume when the user explicitly
  // asked for a target length would be a silent mismatch, not a fallback.
  const downloadsBlocked = targetLength !== "none" && (trimming || !trimmedResume || !!trimError);

  async function handleSelectLength(next: TargetResumeLength) {
    setTargetLength(next);
    setTrimError(null);
    setTrimmedResume(null);
    setCuts([]);
    if (next === "none") return;

    setTrimming(true);
    try {
      const res = await fetch("/api/trim-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobDescription, targetLength: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(typeof data?.error === "string" ? data.error : "Couldn't fit that length.");
      }
      setTrimmedResume(data.trimmedResume as TailoredResume);
      setCuts(Array.isArray(data.cuts) ? (data.cuts as LengthCut[]) : []);
    } catch (e) {
      setTrimError(e instanceof Error ? e.message : "Couldn't fit that length.");
    } finally {
      setTrimming(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(resumeToPlainText(effectiveResume));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownload(format: "docx" | "pdf" | "txt") {
    setBusy(format);
    setError(null);
    try {
      await downloadFromApi(
        { kind: "resume", format, resume: effectiveResume, targetLength },
        `Tailored-Resume.${format}`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed.");
    } finally {
      setBusy(null);
    }
  }

  const contact = [effectiveResume.phone, effectiveResume.email, effectiveResume.linkedin, effectiveResume.location]
    .filter(Boolean)
    .join("  |  ");

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-gl-ink-muted">Length:</span>
          <div className="flex overflow-hidden rounded-lg border border-gl-ink/15">
            {LENGTH_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelectLength(opt.value)}
                disabled={trimming}
                className={`px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                  targetLength === opt.value
                    ? "bg-gl-teal text-white"
                    : "bg-transparent text-gl-ink-muted hover:bg-gl-ink/5"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {trimming && <span className="text-xs text-gl-ink-faint">Fitting…</span>}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {error && <span className="mr-auto text-sm text-gl-crimson">{error}</span>}
          <button
            type="button"
            onClick={handleCopy}
            disabled={downloadsBlocked}
            className="rounded-lg border border-gl-ink/15 px-3 py-1.5 text-sm font-medium text-gl-ink-muted transition-colors hover:bg-gl-ink/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            type="button"
            onClick={() => handleDownload("txt")}
            disabled={busy !== null || downloadsBlocked}
            className="rounded-lg border border-gl-ink/15 px-3 py-1.5 text-sm font-medium text-gl-ink-muted transition-colors hover:bg-gl-ink/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === "txt" ? "Preparing…" : "Download .txt"}
          </button>
          <button
            type="button"
            onClick={() => handleDownload("docx")}
            disabled={busy !== null || downloadsBlocked}
            className="rounded-lg border border-gl-ink/15 px-3 py-1.5 text-sm font-medium text-gl-ink-muted transition-colors hover:bg-gl-ink/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === "docx" ? "Preparing…" : "Download .docx"}
          </button>
          <button
            type="button"
            onClick={() => handleDownload("pdf")}
            disabled={busy !== null || downloadsBlocked}
            className="brand-gradient-bg rounded-lg px-3 py-1.5 text-sm font-medium text-white shadow-sm shadow-gl-teal/25 transition-shadow hover:shadow-md hover:shadow-gl-teal/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
          >
            {busy === "pdf" ? "Preparing…" : "Download .pdf"}
          </button>
        </div>
      </div>

      {trimError && <p className="mb-3 text-sm text-gl-crimson">{trimError}</p>}

      {targetLength !== "none" && trimmedResume && cuts.length === 0 && (
        <p className="mb-3 text-xs text-gl-ink-faint">
          Already fits the target length — nothing needed to be removed.
        </p>
      )}

      {cuts.length > 0 && (
        <div className="mb-4">
          <LengthCutNotice cuts={cuts} />
        </div>
      )}

      <div className="max-h-[36rem] overflow-y-auto rounded-xl border border-gl-ink/10 bg-gl-paper-card p-6 text-[13px] leading-relaxed text-gl-ink shadow-inner shadow-black/5">
        <div className="text-center">
          <h2 className="text-lg font-bold tracking-wide">{effectiveResume.name}</h2>
          {effectiveResume.title && <p className="text-sm">{effectiveResume.title}</p>}
          {contact && <p className="text-xs text-gl-ink-muted">{contact}</p>}
        </div>

        {effectiveResume.profile && (
          <>
            <SectionHeading>Profile</SectionHeading>
            <p>{effectiveResume.profile}</p>
          </>
        )}

        {effectiveResume.objective && (
          <p className="mt-2 italic text-gl-ink-muted">Objective: {effectiveResume.objective}</p>
        )}

        {effectiveResume.coreStrengths.length > 0 && (
          <>
            <SectionHeading>Core Strengths</SectionHeading>
            <BulletList bullets={effectiveResume.coreStrengths} />
          </>
        )}

        {effectiveResume.experience.length > 0 && (
          <>
            <SectionHeading>Professional Experience</SectionHeading>
            {effectiveResume.experience.map((job, i) => (
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

        {effectiveResume.education.length > 0 && (
          <>
            <SectionHeading>Education &amp; Certifications</SectionHeading>
            <table className="w-full border-collapse text-[13px]">
              <tbody>
                {effectiveResume.education.map((ed, i) => (
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
