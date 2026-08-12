"use client";

import { useEffect, useState } from "react";
import { DocumentMarkupDemo } from "./DocumentMarkupDemo";
import { PaperAirplaneMark, SparkleMark } from "./DecorativeMarks";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

// Lines up with DocumentMarkupDemo's own 400ms staged reveal (its stamp
// lands at stage 4 = 1600ms) — this rides that same signature motion
// rather than introducing a second, competing one.
const PILLS_DELAY_MS = 1600;

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3 w-3 shrink-0" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3 w-3 shrink-0" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3 w-3 shrink-0" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 2 4 14h7l-1 8 9-12h-7z" />
    </svg>
  );
}

type PillTone = "teal" | "crimson" | "neutral";

const PILL_STYLES: Record<PillTone, string> = {
  teal: "border-gl-teal/30 bg-gl-teal-bg text-gl-teal",
  crimson: "border-gl-crimson/30 bg-gl-crimson-bg text-gl-crimson",
  neutral: "border-gl-ink/15 bg-gl-paper-card text-gl-ink-muted",
};

function Pill({ tone, icon, label }: { tone: PillTone; icon: React.ReactNode; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide ${PILL_STYLES[tone]}`}
    >
      {icon}
      {label}
    </span>
  );
}

export function Hero() {
  const reducedMotion = usePrefersReducedMotion();
  const [pillsRevealed, setPillsRevealed] = useState(false);

  useEffect(() => {
    if (reducedMotion) return; // effectivePillsIn below jumps straight to the settled end state
    const timer = setTimeout(() => setPillsRevealed(true), PILLS_DELAY_MS);
    return () => clearTimeout(timer);
  }, [reducedMotion]);

  const effectivePillsIn = reducedMotion || pillsRevealed;

  return (
    <section className="mb-10">
      <h1 className="font-serif max-w-2xl text-3xl font-semibold text-gl-ink sm:text-4xl">
        Every claim, checked against real evidence.
      </h1>
      <p className="mt-3 max-w-xl text-gl-ink-muted">
        GapLens reads your resume the way a strict reviewer would — verifying
        what&apos;s real, flagging what&apos;s missing, before you ever hit send.
      </p>

      <div className="relative mt-8">
        <SparkleMark className="pointer-events-none absolute -top-5 left-6 hidden h-4 w-4 text-gl-teal opacity-70 sm:block" />
        <PaperAirplaneMark
          className="pointer-events-none absolute -top-7 right-2 hidden h-9 w-14 -rotate-[8deg] text-gl-ink-faint opacity-60 sm:block"
        />

        <DocumentMarkupDemo />

        <div
          className="mt-8 transition-all duration-500 ease-out motion-reduce:transition-none"
          style={{
            opacity: effectivePillsIn ? 1 : 0,
            transform: effectivePillsIn ? "translateY(0)" : "translateY(6px)",
          }}
        >
          <div
            className="mb-3 border-t border-dashed"
            style={{ borderColor: "color-mix(in srgb, var(--gl-ink) 16%, transparent)" }}
            aria-hidden="true"
          />
          <div className="flex flex-wrap gap-2">
            <Pill tone="teal" icon={<CheckIcon />} label="Verified" />
            <Pill tone="teal" icon={<CheckIcon />} label="Verified" />
            <Pill tone="crimson" icon={<XIcon />} label="Gap" />
            <Pill tone="neutral" icon={<BoltIcon />} label="Quick fix" />
          </div>
        </div>
      </div>
    </section>
  );
}
