import type { RequirementCheck, ScoreBreakdown, ScoreResult } from "@/lib/types";

interface ScoreCardProps {
  original: ScoreResult;
  tailored: ScoreResult;
  requirementsChecklist: RequirementCheck[];
}

const STATUS_STYLES: Record<RequirementCheck["status"], string> = {
  met: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  not_met: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
};

const STATUS_ICON: Record<RequirementCheck["status"], string> = {
  met: "✓",
  not_met: "✗",
};

const TYPE_STYLES: Record<RequirementCheck["type"], string> = {
  essential: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  desirable: "bg-zinc-50 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500",
};

function RequirementsChecklist({ items }: { items: RequirementCheck[] }) {
  if (items.length === 0) return null;
  const unmet = items.filter((i) => i.status === "not_met").length;

  return (
    <details className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
      <summary className="cursor-pointer text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Why this score? {items.length} requirement{items.length === 1 ? "" : "s"} checked
        {unmet > 0 && <span className="ml-1 text-zinc-500">({unmet} not met)</span>}
      </summary>
      <ul className="mt-3 flex flex-col gap-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${STATUS_STYLES[item.status]}`}
            >
              {STATUS_ICON[item.status]}
            </span>
            <span>
              <span
                className={`mr-1.5 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${TYPE_STYLES[item.type]}`}
              >
                {item.type}
              </span>
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                {item.requirement}
              </span>
              {item.evidence && (
                <span className="text-zinc-500"> — &ldquo;{item.evidence}&rdquo;</span>
              )}
              {!item.evidence && item.reasoning && (
                <span className="text-zinc-500"> — {item.reasoning}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}

const BREAKDOWN_LABELS: Record<keyof ScoreBreakdown, string> = {
  skillsMatch: "Skills match",
  experienceMatch: "Experience match",
  keywordAlignment: "Keyword alignment",
  overallPresentation: "Presentation",
};

function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

function DeltaBadge({ before, after }: { before: number; after: number }) {
  const delta = after - before;
  if (delta === 0) {
    return (
      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
        ±0
      </span>
    );
  }
  const positive = delta > 0;
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
        positive
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
          : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
      }`}
    >
      {positive ? "+" : ""}
      {delta}
    </span>
  );
}

/** Blunt pass/fail pill — the headline verdict, not softened by score or writing quality. */
function ScreenVerdictBadge({ wouldClear }: { wouldClear: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        wouldClear
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
          : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
      }`}
    >
      {wouldClear ? "Would clear a screen" : "Would not clear a screen"}
    </span>
  );
}

/** Before → after per metric: a dumbbell (one hue, two shades) rather than a status color. */
function DumbbellRow({
  label,
  before,
  after,
}: {
  label: string;
  before: number;
  after: number;
}) {
  const lo = Math.min(before, after);
  const hi = Math.max(before, after);
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-xs">
        <span className="text-zinc-500">{label}</span>
        <span className="tabular-nums">
          <span className="text-zinc-400">{before}</span>
          <span className="mx-1 text-zinc-300 dark:text-zinc-600">→</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">{after}</span>
        </span>
      </div>
      <div className="relative h-3">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-zinc-100 dark:bg-zinc-800" />
        <div
          className="absolute top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-indigo-600/30 dark:bg-indigo-400/30"
          style={{ left: `${lo}%`, width: `${hi - lo}%` }}
        />
        <div
          className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-indigo-600/30 dark:border-zinc-900 dark:bg-indigo-400/30"
          style={{ left: `${before}%` }}
        />
        <div
          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-indigo-600 dark:border-zinc-900 dark:bg-indigo-400"
          style={{ left: `${after}%` }}
        />
      </div>
    </div>
  );
}

export function ScoreCard({ original, tailored, requirementsChecklist }: ScoreCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center opacity-70">
            <span className="text-2xl font-semibold tabular-nums text-zinc-400">
              {original.matchScore}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-zinc-400">Before</span>
          </div>
          <span className="text-xl text-zinc-300 dark:text-zinc-600">→</span>
          <div className="flex flex-col items-center">
            <span
              className={`text-5xl font-bold tabular-nums ${scoreColor(tailored.matchScore)}`}
            >
              {tailored.matchScore}
            </span>
            <span className="text-xs uppercase tracking-wide text-zinc-500">After / 100</span>
          </div>
          <DeltaBadge before={original.matchScore} after={tailored.matchScore} />
        </div>
        <div className="min-w-[16rem] flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Application strength
            </h3>
            <ScreenVerdictBadge wouldClear={tailored.wouldClearTechnicalScreen} />
          </div>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{tailored.summary}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-600/30 dark:bg-indigo-400/30" />
          Before tailoring
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-indigo-600 dark:bg-indigo-400" />
          After tailoring
        </span>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(Object.keys(BREAKDOWN_LABELS) as (keyof ScoreBreakdown)[]).map((key) => (
          <DumbbellRow
            key={key}
            label={BREAKDOWN_LABELS[key]}
            before={original.scoreBreakdown[key]}
            after={tailored.scoreBreakdown[key]}
          />
        ))}
      </div>

      <RequirementsChecklist items={requirementsChecklist} />
    </div>
  );
}
