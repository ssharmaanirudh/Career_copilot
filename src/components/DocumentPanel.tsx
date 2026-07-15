"use client";

import { useState } from "react";
import { downloadFromApi } from "@/lib/clientDownload";

interface DocumentPanelProps {
  text: string;
}

export function DocumentPanel({ text }: DocumentPanelProps) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<"docx" | "pdf" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownload(format: "docx" | "pdf") {
    setBusy(format);
    setError(null);
    try {
      await downloadFromApi(
        { kind: "cover-letter", format, text },
        `Cover-Letter.${format}`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
        {error && (
          <span className="mr-auto text-sm text-rose-600 dark:text-rose-400">{error}</span>
        )}
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
        <button
          type="button"
          onClick={() => handleDownload("docx")}
          disabled={busy !== null}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {busy === "docx" ? "Preparing…" : "Download .docx"}
        </button>
        <button
          type="button"
          onClick={() => handleDownload("pdf")}
          disabled={busy !== null}
          className="brand-gradient-bg rounded-lg px-3 py-1.5 text-sm font-medium text-white shadow-sm shadow-emerald-500/25 transition-shadow hover:shadow-md hover:shadow-emerald-500/30 disabled:opacity-60 disabled:shadow-none"
        >
          {busy === "pdf" ? "Preparing…" : "Download .pdf"}
        </button>
      </div>
      <textarea
        readOnly
        value={text}
        className="h-[28rem] w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50 p-4 font-mono text-sm leading-relaxed text-zinc-800 shadow-inner shadow-zinc-100 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:shadow-none"
      />
    </div>
  );
}
