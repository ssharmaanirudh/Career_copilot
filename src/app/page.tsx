"use client";

import { useState } from "react";
import Link from "next/link";
import { ResumeUploader } from "@/components/ResumeUploader";
import { ResultsView } from "@/components/ResultsView";
import { RefineBox } from "@/components/RefineBox";
import { ActionPlanBox } from "@/components/ActionPlanBox";
import { Hero } from "@/components/Hero";
import { SiteHeader } from "@/components/SiteHeader";
import { SamplePreview } from "@/components/SamplePreview";
import { parseJsonResponse } from "@/lib/fetchJson";
import { MIN_JOB_DESCRIPTION_LENGTH } from "@/lib/validation";
import type { AnalysisResult } from "@/lib/types";

type Status = "idle" | "loading" | "error" | "done";

function StepBadge({ n }: { n: number }) {
  return (
    <span className="brand-gradient-bg flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
      {n}
    </span>
  );
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const [refining, setRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);

  const jobDescriptionTooShort =
    jobDescription.trim().length > 0 && jobDescription.trim().length < MIN_JOB_DESCRIPTION_LENGTH;
  const canSubmit = file !== null && jobDescription.trim().length >= MIN_JOB_DESCRIPTION_LENGTH;

  async function runAnalysis(notesToSend: string[]): Promise<AnalysisResult> {
    if (!file) throw new Error("Missing resume file.");
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription);
    for (const note of notesToSend) {
      formData.append("notes", note);
    }

    const res = await fetch("/api/analyze", { method: "POST", body: formData });
    return parseJsonResponse<AnalysisResult>(
      res,
      "Something went wrong while analyzing your resume. Please try again.",
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus("loading");
    setError(null);
    setNotes([]);

    try {
      const data = await runAnalysis([]);
      setResult(data);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  async function handleRefine(note: string) {
    setRefining(true);
    setRefineError(null);
    const nextNotes = [...notes, note];

    try {
      const data = await runAnalysis(nextNotes);
      setResult(data);
      setNotes(nextNotes);
    } catch (err) {
      setRefineError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setRefining(false);
    }
  }

  return (
    <div className="gl-page-grid min-h-full font-sans">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-6 py-10">
        {status === "idle" && (
          <>
            <Hero />
            <p className="-mt-4 mb-10">
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-1 text-sm font-medium text-gl-teal hover:underline"
              >
                See how the scoring actually works
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                </svg>
              </Link>
            </p>
            <SamplePreview />
          </>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-6 rounded-2xl border border-gl-ink/10 bg-gl-paper-card p-6 shadow-sm shadow-black/5 lg:grid-cols-2"
        >
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gl-ink">
              <StepBadge n={1} />
              Your resume
            </label>
            <ResumeUploader file={file} onFileSelected={setFile} />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="job-description"
              className="mb-2 flex items-center gap-2 text-sm font-semibold text-gl-ink"
            >
              <StepBadge n={2} />
              Target job description
            </label>
            <textarea
              id="job-description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here…"
              className="h-48 flex-1 resize-y rounded-xl border border-gl-ink/15 p-3 text-sm shadow-inner shadow-black/5 transition-shadow focus:border-gl-teal focus:shadow-none focus:outline-none focus:ring-4 focus:ring-gl-teal/15 lg:h-auto"
            />
            {jobDescriptionTooShort ? (
              <p className="mt-2 text-xs text-gl-crimson">
                This looks like a job title rather than a full posting — paste the full
                description for an accurate check.
              </p>
            ) : (
              <p className="mt-2 text-xs text-gl-ink-faint">
                Don&apos;t have a specific posting yet? Search your target role on LinkedIn or
                Indeed, and paste in one real listing close to what you want — GapLens works best
                checked against an actual posting, not a general idea of a role.
              </p>
            )}
          </div>

          <div className="lg:col-span-2">
            <button
              type="submit"
              disabled={!canSubmit || status === "loading"}
              className="brand-gradient-bg group flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-semibold text-white shadow-md shadow-gl-teal/25 transition-all hover:shadow-lg hover:shadow-gl-teal/35 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none sm:w-auto"
            >
              {status === "loading" ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Analyzing your fit…
                </>
              ) : (
                <>
                  Tailor my application
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                  </svg>
                </>
              )}
            </button>
            <p className="mt-3 text-xs text-gl-ink-faint">
              Your resume and job description are processed once and never stored.
            </p>
            {error && <p className="mt-3 text-sm text-gl-crimson">{error}</p>}
          </div>
        </form>

        {status === "loading" && (
          <div className="mt-10 flex items-center justify-center gap-3 text-gl-ink-faint">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-gl-ink/20 border-t-gl-teal" />
            Reading your resume and matching it against the role…
          </div>
        )}

        {status === "done" && result && (
          <div className="mt-10 flex flex-col gap-6">
            <ResultsView result={result} />
            <ActionPlanBox scoringResult={result} />
            <RefineBox
              questions={result.clarifyingQuestions}
              notes={notes}
              busy={refining}
              error={refineError}
              onSubmit={handleRefine}
            />
          </div>
        )}
      </main>
    </div>
  );
}
