import type { RequirementCheck, ScoreBreakdown, ScoreResult } from "@/lib/types";

interface ScoreCardProps {
  original: ScoreResult;
  tailored: ScoreResult;
  requirementsChecklist: RequirementCheck[];
}

const STATUS_STYLES: Record<RequirementCheck["status"], string> = {
  met: "bg-gl-teal-bg text-gl-teal",
  not_met: "bg-gl-crimson-bg text-gl-crimson",
};

const STATUS_ICON: Record<RequirementCheck["status"], string> = {
  met: "✓",
  not_met: "✗",
};

const TYPE_STYLES: Record<RequirementCheck["type"], string> = {
  essential: "bg-gl-ink/10 text-gl-ink-muted",
  desirable: "bg-gl-ink/5 text-gl-ink-faint",
};

function RequirementsChecklist({ items }: { items: RequirementCheck[] }) {
  if (items.length === 0) return null;
  const unmet = items.filter((i) => i.status === "not_met").length;

  return (
    <details className="mt-5 border-t border-gl-ink/10 pt-4">
      <summary className="cursor-pointer text-sm font-medium text-gl-ink-muted transition-colors hover:text-gl-teal">
        Why this score? {items.length} requirement{items.length === 1 ? "" : "s"} checked
        {unmet > 0 && <span className="ml-1 text-gl-ink-faint">({unmet} not met)</span>}
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
              <span className="font-medium text-gl-ink">{item.requirement}</span>
              {item.evidence && (
                <span className="text-gl-ink-faint"> — &ldquo;{item.evidence}&rdquo;</span>
              )}
              {!item.evidence && item.reasoning && (
                <span className="text-gl-ink-faint"> — {item.reasoning}</span>
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
  if (score >= 80) return "text-gl-teal";
  if (score >= 60) return "text-amber-600";
  return "text-gl-crimson";
}

function scoreRingColor(score: number): string {
  if (score >= 80) return "stroke-gl-teal";
  if (score >= 60) return "stroke-amber-500";
  return "stroke-gl-crimson";
}

/** Meter: same-ramp track, fill carries severity — the score's headline visual. */
function ScoreRing({ score }: { score: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="10"
          className="stroke-gl-ink/10"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`transition-[stroke-dashoffset] duration-700 ease-out ${scoreRingColor(score)}`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-3xl font-bold tabular-nums ${scoreColor(score)}`}>{score}</span>
        <span className="text-[10px] uppercase tracking-wide text-gl-ink-faint">/ 100</span>
      </div>
    </div>
  );
}

function DeltaBadge({ before, after }: { before: number; after: number }) {
  const delta = after - before;
  if (delta === 0) {
    return (
      <span className="rounded-full bg-gl-ink/10 px-2 py-0.5 text-xs font-semibold text-gl-ink-muted">
        ±0
      </span>
    );
  }
  const positive = delta > 0;
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
        positive ? "bg-gl-teal-bg text-gl-teal" : "bg-gl-crimson-bg text-gl-crimson"
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
        wouldClear ? "bg-gl-teal-bg text-gl-teal" : "bg-gl-crimson-bg text-gl-crimson"
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
        <span className="text-gl-ink-faint">{label}</span>
        <span className="tabular-nums">
          <span className="text-gl-ink-faint">{before}</span>
          <span className="mx-1 text-gl-ink/30">→</span>
          <span className="font-semibold text-gl-ink">{after}</span>
        </span>
      </div>
      <div className="relative h-3">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gl-ink/10" />
        <div
          className="absolute top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-blue-600/30"
          style={{ left: `${lo}%`, width: `${hi - lo}%` }}
        />
        <div
          className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-gl-paper-card bg-blue-600/30"
          style={{ left: `${before}%` }}
        />
        <div
          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-gl-paper-card bg-blue-600"
          style={{ left: `${after}%` }}
        />
      </div>
    </div>
  );
}

export function ScoreCard({ original, tailored, requirementsChecklist }: ScoreCardProps) {
  return (
    <div className="rounded-2xl border border-gl-ink/10 bg-gl-paper-card p-6 shadow-sm shadow-black/5">
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center opacity-60">
            <span className="text-xl font-semibold tabular-nums text-gl-ink-faint">
              {original.matchScore}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-gl-ink-faint">Before</span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-4 w-4 text-gl-ink/30"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
          </svg>
          <ScoreRing score={tailored.matchScore} />
          <DeltaBadge before={original.matchScore} after={tailored.matchScore} />
        </div>
        <div className="min-w-[16rem] flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-gl-ink">Application strength</h3>
            <ScreenVerdictBadge wouldClear={tailored.wouldClearTechnicalScreen} />
          </div>
          <p className="mt-1 text-sm text-gl-ink-muted">{tailored.summary}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4 text-xs text-gl-ink-faint">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600/30" />
          Before tailoring
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-blue-600" />
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
