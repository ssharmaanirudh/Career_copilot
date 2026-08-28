import type { LengthCut } from "@/lib/types";

/**
 * Surfaces every bullet the length-trim pass removed — same visibility
 * standard as TraceabilityNotice: trimming is never silent. Renders
 * nothing when no target length is active or nothing needed to be cut.
 */
export function LengthCutNotice({ cuts }: { cuts: LengthCut[] }) {
  if (cuts.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gl-ink/10 bg-gl-paper-card p-5 shadow-sm shadow-black/5">
      <h4 className="text-sm font-semibold text-gl-ink-muted">
        Trimmed to fit — {cuts.length} item{cuts.length === 1 ? "" : "s"} removed
      </h4>
      <p className="mt-1 text-xs text-gl-ink-faint">
        Page count is an estimate — the export below reflects this trimmed version. Nothing is
        removed without appearing here.
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {cuts.map((cut, i) => (
          <li key={i} className="rounded-xl border border-gl-ink/10 p-3 text-sm">
            <p className="font-mono text-[10px] uppercase tracking-wide text-gl-ink-faint">
              {cut.section}
            </p>
            <p className="mt-1 text-gl-ink-muted">{cut.description}</p>
            <p className="mt-1 text-xs text-gl-ink-faint">{cut.reason}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
