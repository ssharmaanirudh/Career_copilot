"use client";

import { useState } from "react";
import { ResumeUploader } from "@/components/ResumeUploader";
import { ResultsView } from "@/components/ResultsView";
import { RefineBox } from "@/components/RefineBox";
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

  const canSubmit = file !== null && jobDescription.trim().length >= 30;

  async function runAnalysis(notesToSend: string[]): Promise<AnalysisResult> {
    if (!file) throw new Error("Missing resume file.");
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription);
    for (const note of notesToSend) {
      formData.append("notes", note);
    }

    const res = await fetch("/api/analyze", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Something went wrong. Please try again.");
    }
    return data as AnalysisResult;
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
    <div className="brand-mesh-bg min-h-full font-sans">
      <header className="sticky top-0 z-10 border-b border-zinc-200/70 bg-white/80 backdrop-blur-md dark:border-zinc-800/70 dark:bg-black/60">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
          <div className="brand-gradient-bg flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm shadow-indigo-500/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.456-2.456L14.25 6l1.035-.259a3.375 3.375 0 0 0 2.456-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Career <span className="brand-gradient-text">Co-Pilot</span>
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Tailored resumes, cover letters, and honest scoring — before you hit send.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-6 rounded-2xl border border-zinc-200/70 bg-white/90 p-6 shadow-sm shadow-zinc-200/60 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/90 dark:shadow-none lg:grid-cols-2"
        >
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              <StepBadge n={1} />
              Your resume
            </label>
            <ResumeUploader file={file} onFileSelected={setFile} />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="job-description"
              className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200"
            >
              <StepBadge n={2} />
              Target job description
            </label>
            <textarea
              id="job-description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here…"
              className="h-48 flex-1 resize-y rounded-xl border border-zinc-300 p-3 text-sm shadow-inner shadow-zinc-100 transition-shadow focus:border-indigo-500 focus:shadow-none focus:outline-none focus:ring-4 focus:ring-indigo-500/15 dark:border-zinc-700 dark:bg-zinc-950 dark:shadow-none lg:h-auto"
            />
          </div>

          <div className="lg:col-span-2">
            <button
              type="submit"
              disabled={!canSubmit || status === "loading"}
              className="brand-gradient-bg group flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:shadow-lg hover:shadow-indigo-500/35 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none sm:w-auto"
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
            {error && (
              <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{error}</p>
            )}
          </div>
        </form>

        {status === "loading" && (
          <div className="mt-10 flex items-center justify-center gap-3 text-zinc-500">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-600" />
            Reading your resume and matching it against the role…
          </div>
        )}

        {status === "done" && result && (
          <div className="mt-10 flex flex-col gap-6">
            <ResultsView result={result} />
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
