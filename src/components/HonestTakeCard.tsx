function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

export function HonestTakeCard({
  ceiling,
  summary,
}: {
  ceiling: number;
  summary: string;
}) {
  if (!summary) return null;

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">The honest take</p>
        <p className="text-xs text-zinc-500">
          Ceiling from wording fixes alone:{" "}
          <span className={`font-semibold tabular-nums ${scoreColor(ceiling)}`}>
            {ceiling}/100
          </span>
        </p>
      </div>
      <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">{summary}</p>
    </div>
  );
}
