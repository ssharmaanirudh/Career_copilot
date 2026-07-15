import type { WordingFix } from "@/lib/types";

export function WordingFixList({ fixes }: { fixes: WordingFix[] }) {
  if (fixes.length === 0) return null;

  return (
    <div className="mt-6 border-t border-zinc-100 pt-4 dark:border-zinc-800">
      <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        Wording fixes applied ({fixes.length})
      </h4>
      <p className="mt-1 text-xs text-zinc-500">
        Evidence for these already existed in your resume — it was just buried or not
        connected to the role&apos;s language. No new claims were added.
      </p>
      <ul className="mt-3 flex flex-col gap-3">
        {fixes.map((fix, i) => (
          <li key={i} className="rounded-xl border border-zinc-200 p-3 transition-shadow hover:shadow-sm dark:border-zinc-800">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              {fix.requirement}
            </p>
            <p className="mt-2 text-sm text-zinc-500 line-through decoration-zinc-300 dark:decoration-zinc-700">
              {fix.currentLine}
            </p>
            <p className="mt-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {fix.suggestedLine}
            </p>
            <p className="mt-1.5 text-xs text-zinc-500">{fix.whyItHelps}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
