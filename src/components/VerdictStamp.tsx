"use client";

import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

interface VerdictStampProps {
  label: string;
  tone: "teal" | "crimson";
  /** Plays the entrance animation once this becomes true. Renders instantly under prefers-reduced-motion. */
  trigger: boolean;
}

/** DESIGN.md's verdict stamp — capped-score / pass-fail moments. Reused as-is on the results page (Phase 4). */
export function VerdictStamp({ label, tone, trigger }: VerdictStampProps) {
  const reducedMotion = usePrefersReducedMotion();
  const color = tone === "teal" ? "var(--gl-teal)" : "var(--gl-crimson)";

  return (
    <div
      className="inline-block select-none font-mono text-sm font-medium"
      style={{
        border: `2px solid ${color}`,
        color,
        padding: "6px 10px",
        borderRadius: "4px",
        transform: trigger ? "rotate(-8deg) scale(1)" : "rotate(-8deg) scale(0.5)",
        opacity: trigger ? 1 : 0,
        transition: reducedMotion
          ? "none"
          : "transform 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease-out",
      }}
    >
      {label}
    </div>
  );
}
