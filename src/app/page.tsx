"use client";

import { useState } from "react";
import { ResumeUploader } from "@/components/ResumeUploader";
import { ResultsView } from "@/components/ResultsView";
import { RefineBox } from "@/components/RefineBox";
import type { AnalysisResult } from "@/lib/types";

type Status = "idle" | "loading" | "error" | "done";

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
    <div className="min-h-full bg-zinc-50 font-sans dark:bg-black">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Career Co-Pilot
          </h1>
          <p className="text-sm text-zinc-500">
            Upload your resume, paste a job description, and get a tailored resume,
            cover letter, application score, and skill-gap plan.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 lg:grid-cols-2"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              1. Your resume
            </label>
            <ResumeUploader file={file} onFileSelected={setFile} />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="job-description"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              2. Target job description
            </label>
            <textarea
              id="job-description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here…"
              className="h-48 flex-1 resize-y rounded-lg border border-zinc-300 p-3 text-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 lg:h-auto"
            />
          </div>

          <div className="lg:col-span-2">
            <button
              type="submit"
              disabled={!canSubmit || status === "loading"}
              className="w-full rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {status === "loading" ? "Analyzing your fit…" : "Tailor my application"}
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
