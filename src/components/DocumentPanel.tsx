"use client";

import { useState } from "react";
import { downloadFromApi } from "@/lib/clientDownload";

interface DocumentPanelProps {
  text: string;
}

export function DocumentPanel({ text }: DocumentPanelProps) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<"docx" | "pdf" | "txt" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownload(format: "docx" | "pdf" | "txt") {
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
          onClick={() => handleDownload("txt")}
          disabled={busy !== null}
          className="rounded-lg border border-gl-ink/15 px-3 py-1.5 text-sm font-medium text-gl-ink-muted transition-colors hover:bg-gl-ink/5 disabled:opacity-60"
        >
          {busy === "txt" ? "Preparing…" : "Download .txt"}
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
      <textarea
        readOnly
        value={text}
        className="h-[28rem] w-full resize-y rounded-xl border border-gl-ink/10 bg-gl-ink/5 p-4 font-mono text-sm leading-relaxed text-gl-ink-muted shadow-inner shadow-black/5 focus:border-gl-teal focus:outline-none focus:ring-4 focus:ring-gl-teal/15"
      />
    </div>
  );
}
