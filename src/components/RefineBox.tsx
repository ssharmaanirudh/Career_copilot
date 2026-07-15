"use client";

import { useState } from "react";

interface RefineBoxProps {
  questions: string[];
  notes: string[];
  busy: boolean;
  error: string | null;
  onSubmit: (note: string) => void;
}

export function RefineBox({ questions, notes, busy, error, onSubmit }: RefineBoxProps) {
  const [input, setInput] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || busy) return;
    onSubmit(trimmed);
    setInput("");
  }

  return (
    <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm shadow-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex items-center gap-2">
        <div className="brand-gradient-bg flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 8.25h16.5a1.5 1.5 0 0 0 1.5-1.5V6.75a1.5 1.5 0 0 0-1.5-1.5H3.75a1.5 1.5 0 0 0-1.5 1.5v12a1.5 1.5 0 0 0 1.5 1.5Z"
            />
          </svg>
        </div>
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
          Anything to add or correct?
        </h3>
      </div>

      {questions.length > 0 && (
        <div className="mt-3 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200">
          <p className="font-medium">A few quick questions that could strengthen this:</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-2 text-sm text-zinc-500">
        Tell us about experience that isn&apos;t on your resume, or ask for edits like
        &ldquo;make the cover letter shorter&rdquo; — we&apos;ll only use facts you actually
        confirm, never invent anything.
      </p>

      {notes.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1.5 text-xs text-zinc-500">
          {notes.map((n, i) => (
            <li key={i} className="rounded-lg bg-zinc-50 px-2.5 py-1.5 dark:bg-zinc-800/60">
              {n}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. I actually used Python for two years at my last job automating reports…"
          rows={2}
          className="flex-1 resize-y rounded-xl border border-zinc-300 p-2.5 text-sm transition-shadow focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 dark:border-zinc-700 dark:bg-zinc-950"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="brand-gradient-bg shrink-0 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-500/25 transition-shadow hover:shadow-md hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          {busy ? "Updating…" : "Update my resume"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}
