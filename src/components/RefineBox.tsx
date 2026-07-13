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
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
        Anything to add or correct?
      </h3>

      {questions.length > 0 && (
        <div className="mt-2 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200">
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
            <li key={i} className="rounded bg-zinc-50 px-2 py-1 dark:bg-zinc-800/60">
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
          className="flex-1 resize-y rounded-lg border border-zinc-300 p-2.5 text-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Updating…" : "Update my resume"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}
