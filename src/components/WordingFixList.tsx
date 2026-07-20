import type { WordingFix } from "@/lib/types";

export function WordingFixList({ fixes }: { fixes: WordingFix[] }) {
  if (fixes.length === 0) return null;

  return (
    <div className="mt-6 border-t border-gl-ink/10 pt-4">
      <h4 className="text-sm font-semibold text-gl-ink-muted">
        Wording fixes applied ({fixes.length})
      </h4>
      <p className="mt-1 text-xs text-gl-ink-faint">
        Evidence for these already existed in your resume — it was just buried or not
        connected to the role&apos;s language. No new claims were added.
      </p>
      <ul className="mt-3 flex flex-col gap-3">
        {fixes.map((fix, i) => (
          <li key={i} className="rounded-xl border border-gl-ink/10 p-3 transition-shadow hover:shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gl-ink-faint">
              {fix.requirement}
            </p>
            <p className="mt-2 text-sm text-gl-ink-faint line-through decoration-gl-ink/20">
              {fix.currentLine}
            </p>
            <p className="mt-1.5 text-sm font-medium text-gl-ink">{fix.suggestedLine}</p>
            <p className="mt-1.5 text-xs text-gl-ink-faint">{fix.whyItHelps}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
