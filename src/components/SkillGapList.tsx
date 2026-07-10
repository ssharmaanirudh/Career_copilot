import type { SkillGap } from "@/lib/types";

const PRIORITY_STYLES: Record<SkillGap["priority"], string> = {
  high: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  low: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

const EFFORT_LABELS: Record<SkillGap["effortEstimate"], string> = {
  quick: "Quick (days)",
  medium: "Medium (weeks)",
  substantial: "Substantial (months+)",
};

const EFFORT_STYLES: Record<SkillGap["effortEstimate"], string> = {
  quick: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  medium: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  substantial: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export function SkillGapList({ skillGaps }: { skillGaps: SkillGap[] }) {
  if (skillGaps.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No genuine gaps found — your background lines up well with this role.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {skillGaps.map((gap, i) => (
        <li
          key={i}
          className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
              {gap.skill}
            </h4>
            <div className="flex shrink-0 items-center gap-1.5">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${PRIORITY_STYLES[gap.priority]}`}
              >
                {gap.priority} priority
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${EFFORT_STYLES[gap.effortEstimate]}`}
              >
                {EFFORT_LABELS[gap.effortEstimate]}
              </span>
            </div>
          </div>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{gap.whatsMissing}</p>
          {gap.howToBuildEvidence.length > 0 && (
            <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
              <span className="font-medium">How to build real evidence:</span>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {gap.howToBuildEvidence.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {gap.resourceUrl && (
            <a
              href={gap.resourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              {gap.resourceLabel || gap.resourceUrl}
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
                  d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                />
              </svg>
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
