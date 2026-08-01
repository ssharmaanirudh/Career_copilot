function scoreColor(score: number): string {
  if (score >= 80) return "text-gl-teal";
  if (score >= 60) return "text-amber-600";
  return "text-gl-crimson";
}

/** DESIGN.md-aligned score readout: a big colored number, no gauge/donut. */
export function BigScore({ score, size = "lg" }: { score: number; size?: "lg" | "md" }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className={`font-bold leading-none tabular-nums ${scoreColor(score)} ${
          size === "lg" ? "text-6xl" : "text-4xl"
        }`}
      >
        {score}
      </span>
      <span className="mt-1.5 font-mono text-[10px] uppercase tracking-wide text-gl-ink-faint">
        / 100
      </span>
    </div>
  );
}
