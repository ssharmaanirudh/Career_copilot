import type { ScoreBreakdown } from "@/lib/types";

interface ScoreCardProps {
  matchScore: number;
  scoreBreakdown: ScoreBreakdown;
  scoreSummary: string;
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

function barColor(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-rose-500";
}

export function ScoreCard({ matchScore, scoreBreakdown, scoreSummary }: ScoreCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center">
          <span className={`text-5xl font-bold tabular-nums ${scoreColor(matchScore)}`}>
            {matchScore}
          </span>
          <span className="text-xs uppercase tracking-wide text-zinc-500">/ 100</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Application strength
          </h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{scoreSummary}</p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(Object.keys(BREAKDOWN_LABELS) as (keyof ScoreBreakdown)[]).map((key) => (
          <div key={key}>
            <div className="mb-1 flex justify-between text-xs text-zinc-500">
              <span>{BREAKDOWN_LABELS[key]}</span>
              <span className="tabular-nums">{scoreBreakdown[key]}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className={`h-full rounded-full ${barColor(scoreBreakdown[key])}`}
                style={{ width: `${scoreBreakdown[key]}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
