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
    <div className="flex gap-3 rounded-2xl border border-zinc-200/70 bg-zinc-50 p-4 shadow-sm shadow-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-900/60 dark:shadow-none">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
          />
        </svg>
      </div>
      <div>
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
    </div>
  );
}
