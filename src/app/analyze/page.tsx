"use client";

import { useState } from "react";
import { ResumeUploader } from "@/components/ResumeUploader";
import { ResultsView } from "@/components/ResultsView";
import { AmbitionResultsView } from "@/components/AmbitionResultsView";
import { RefineBox } from "@/components/RefineBox";
import { ActionPlanBox } from "@/components/ActionPlanBox";
import { SiteHeader } from "@/components/SiteHeader";
import { parseJsonResponse } from "@/lib/fetchJson";
import { MIN_JOB_DESCRIPTION_LENGTH } from "@/lib/validation";
import type { AnalysisResult, AmbitionModeResponse, SeniorityLevel } from "@/lib/types";

type Status = "idle" | "loading" | "error" | "done";
type Mode = "jd" | "ambition";

function StepBadge({ n }: { n: number }) {
  return (
    <span className="brand-gradient-bg flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
      {n}
    </span>
  );
}

export default function AnalyzePage() {
  const [mode, setMode] = useState<Mode>("jd");
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const [refining, setRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);

  const [targetRole, setTargetRole] = useState("");
  const [seniorityLevel, setSeniorityLevel] = useState<SeniorityLevel>("");
  const [location, setLocation] = useState("");
  const [ambitionStatus, setAmbitionStatus] = useState<Status>("idle");
  const [ambitionError, setAmbitionError] = useState<string | null>(null);
  const [ambitionResult, setAmbitionResult] = useState<AmbitionModeResponse | null>(null);

  const jobDescriptionTooShort =
    jobDescription.trim().length > 0 && jobDescription.trim().length < MIN_JOB_DESCRIPTION_LENGTH;
  const canSubmit = file !== null && jobDescription.trim().length >= MIN_JOB_DESCRIPTION_LENGTH;
  const canSubmitAmbition = file !== null && targetRole.trim().length >= 2;

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

  async function submitAmbition(domainOverride: string) {
    if (!file) return;

    setAmbitionStatus("loading");
    setAmbitionError(null);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("targetRole", targetRole);
    formData.append("seniorityLevel", seniorityLevel);
    formData.append("location", location);
    if (domainOverride.trim()) {
      formData.append("domainOverride", domainOverride.trim());
    }

    try {
      const res = await fetch("/api/ambition-mode", { method: "POST", body: formData });
      const data = await parseJsonResponse<AmbitionModeResponse>(
        res,
        "Something went wrong while building your composite picture. Please try again.",
      );
      setAmbitionResult(data);
      setAmbitionStatus("done");
    } catch (err) {
      setAmbitionError(err instanceof Error ? err.message : "Something went wrong.");
      setAmbitionStatus("error");
    }
  }

  async function handleAmbitionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmitAmbition || !file) return;
    await submitAmbition("");
  }

  async function handleAdjustDomain(newDomain: string) {
    await submitAmbition(newDomain);
  }

  return (
    <div className="gl-page-grid min-h-full font-sans">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-4 inline-flex rounded-xl border border-gl-ink/10 bg-gl-paper-card p-1 shadow-sm shadow-black/5">
          <button
            type="button"
            onClick={() => setMode("jd")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              mode === "jd" ? "bg-gl-teal-bg text-gl-teal" : "text-gl-ink-muted hover:text-gl-ink"
            }`}
          >
            I have a job description
          </button>
          <button
            type="button"
            onClick={() => setMode("ambition")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              mode === "ambition" ? "bg-gl-teal-bg text-gl-teal" : "text-gl-ink-muted hover:text-gl-ink"
            }`}
          >
            I don&apos;t have a specific posting
          </button>
        </div>

        {mode === "jd" && (
          <>
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
                  placeholder={
                    "Paste the full job description here.\n\nDon't have one yet? Search your target role on LinkedIn or Indeed and paste in a real listing."
                  }
                  className="h-48 flex-1 resize-y rounded-xl border border-gl-ink/15 p-3 text-sm shadow-inner shadow-black/5 transition-shadow focus:border-gl-teal focus:shadow-none focus:outline-none focus:ring-4 focus:ring-gl-teal/15 lg:h-auto"
                />
                {jobDescriptionTooShort ? (
                  <p className="mt-2 text-xs text-gl-crimson">
                    This looks like a job title rather than a full posting — paste the full
                    description for an accurate check.
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-gl-ink-faint">
                    GapLens works best checked against an actual posting, not a general idea of a
                    role.
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
          </>
        )}

        {mode === "ambition" && (
          <>
            <form
              onSubmit={handleAmbitionSubmit}
              className="grid grid-cols-1 gap-6 rounded-2xl border border-gl-ink/10 bg-gl-paper-card p-6 shadow-sm shadow-black/5 lg:grid-cols-2"
            >
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gl-ink">
                  <StepBadge n={1} />
                  Your resume
                </label>
                <ResumeUploader file={file} onFileSelected={setFile} />
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="target-role"
                    className="mb-2 flex items-center gap-2 text-sm font-semibold text-gl-ink"
                  >
                    <StepBadge n={2} />
                    Target role
                  </label>
                  <input
                    id="target-role"
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Data Analyst"
                    className="w-full rounded-xl border border-gl-ink/15 p-3 text-sm shadow-inner shadow-black/5 transition-shadow focus:border-gl-teal focus:shadow-none focus:outline-none focus:ring-4 focus:ring-gl-teal/15"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="seniority" className="mb-2 block text-xs font-medium text-gl-ink-muted">
                      Seniority (optional)
                    </label>
                    <select
                      id="seniority"
                      value={seniorityLevel}
                      onChange={(e) => setSeniorityLevel(e.target.value as SeniorityLevel)}
                      className="w-full rounded-xl border border-gl-ink/15 p-3 text-sm shadow-inner shadow-black/5 transition-shadow focus:border-gl-teal focus:shadow-none focus:outline-none focus:ring-4 focus:ring-gl-teal/15"
                    >
                      <option value="">Any</option>
                      <option value="entry">Entry</option>
                      <option value="mid">Mid</option>
                      <option value="senior">Senior</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="location" className="mb-2 block text-xs font-medium text-gl-ink-muted">
                      Location (optional)
                    </label>
                    <input
                      id="location"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. remote"
                      className="w-full rounded-xl border border-gl-ink/15 p-3 text-sm shadow-inner shadow-black/5 transition-shadow focus:border-gl-teal focus:shadow-none focus:outline-none focus:ring-4 focus:ring-gl-teal/15"
                    />
                  </div>
                </div>
                <p className="text-xs text-gl-ink-faint">
                  We&apos;ll search for 3-5 real, currently posted job listings for this role and
                  build a composite picture from what they actually ask for — not a guess from
                  general knowledge.
                </p>
              </div>

              <div className="lg:col-span-2">
                <button
                  type="submit"
                  disabled={!canSubmitAmbition || ambitionStatus === "loading"}
                  className="brand-gradient-bg group flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-semibold text-white shadow-md shadow-gl-teal/25 transition-all hover:shadow-lg hover:shadow-gl-teal/35 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none sm:w-auto"
                >
                  {ambitionStatus === "loading" ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Searching real postings and scoring…
                    </>
                  ) : (
                    <>
                      Build my composite picture
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
                  Your resume is processed once and never stored.
                </p>
                {ambitionError && <p className="mt-3 text-sm text-gl-crimson">{ambitionError}</p>}
              </div>
            </form>

            {ambitionStatus === "loading" && (
              <div className="mt-10 flex items-center justify-center gap-3 text-gl-ink-faint">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-gl-ink/20 border-t-gl-teal" />
                Searching for real postings and building a composite picture…
              </div>
            )}

            {ambitionStatus === "done" && ambitionResult && (
              <div className="mt-10 flex flex-col gap-6">
                {ambitionResult.insufficientData ? (
                  <div className="rounded-2xl border border-gl-ink/10 bg-gl-paper-card p-6 text-sm text-gl-ink-muted shadow-sm shadow-black/5">
                    {ambitionResult.message}
                  </div>
                ) : (
                  <AmbitionResultsView result={ambitionResult} onAdjustDomain={handleAdjustDomain} />
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
