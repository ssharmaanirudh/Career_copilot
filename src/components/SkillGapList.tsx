import type { SkillGap } from "@/lib/types";

const PRIORITY_STYLES: Record<SkillGap["priority"], string> = {
  high: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  low: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export function SkillGapList({ skillGaps }: { skillGaps: SkillGap[] }) {
  if (skillGaps.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No major skill gaps found — your background lines up well with this role.
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
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
              {gap.skill}
            </h4>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${PRIORITY_STYLES[gap.priority]}`}
            >
              {gap.priority} priority
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{gap.why}</p>
          <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
            <span className="font-medium">How to close it: </span>
            {gap.howToLearn}
          </p>
        </li>
      ))}
    </ul>
  );
}
