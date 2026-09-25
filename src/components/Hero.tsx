"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DocumentMarkupDemo } from "./DocumentMarkupDemo";
import { HeroAnalyzingCard } from "./HeroAnalyzingCard";
import { PaperAirplaneMark, SparkleMark } from "./DecorativeMarks";
import { StatusPill } from "./StatusPill";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

// Lines up with DocumentMarkupDemo's own 400ms staged reveal (its stamp
// lands at stage 4 = 1600ms) — this rides that same signature motion
// rather than introducing a second, competing one.
const PILLS_DELAY_MS = 1600;

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
    </svg>
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
    <section className="mb-10 grid grid-cols-1 items-center gap-10 py-2 lg:grid-cols-2 lg:gap-14">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gl-teal-bg px-3 py-1 text-xs font-semibold text-gl-teal">
          <SparkleMark className="h-3 w-3" />
          AI-powered career copilot
        </span>

        <h1 className="font-serif mt-4 text-4xl font-semibold text-gl-ink sm:text-5xl">
          See what&apos;s{" "}
          <span className="relative inline-block text-gl-teal">
            missing
            <span className="absolute inset-x-0 -bottom-1 h-[3px] rounded-full bg-gl-teal" aria-hidden="true" />
          </span>{" "}
          before you hit send.
        </h1>
        <p className="mt-4 max-w-md text-gl-ink-muted">
          GapLens analyzes your resume against any job and shows you the real gaps, not just
          keyword matches.
        </p>

        <div className="mt-6">
          <Link
            href="/analyze"
            className="brand-gradient-bg group inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-semibold text-white shadow-md shadow-gl-teal/25 transition-all hover:shadow-lg hover:shadow-gl-teal/35"
          >
            Upload resume
            <ArrowIcon />
          </Link>
        </div>
      </div>

      <div className="relative">
        <SparkleMark className="pointer-events-none absolute -top-5 left-6 hidden h-4 w-4 text-gl-teal opacity-70 sm:block" />
        <PaperAirplaneMark
          className="pointer-events-none absolute -top-7 right-2 hidden h-9 w-14 -rotate-[8deg] text-gl-ink-faint opacity-60 sm:block"
        />

        <div className="relative z-10 sm:rotate-1">
          <HeroAnalyzingCard />
        </div>

        <div className="relative z-0 mt-6 sm:-mt-10 sm:ml-10 sm:-rotate-2">
          <DocumentMarkupDemo compact />
        </div>

        <div
          className="relative z-10 mt-8 transition-all duration-500 ease-out motion-reduce:transition-none"
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
            <StatusPill tone="teal" icon="check" label="Verified" />
            <StatusPill tone="teal" icon="check" label="Verified" />
            <StatusPill tone="crimson" icon="x" label="Gap" />
            <StatusPill tone="neutral" icon="bolt" label="Quick fix" />
          </div>
        </div>
      </div>
    </section>
  );
}
