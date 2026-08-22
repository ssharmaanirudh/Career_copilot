import type { RequirementCheck } from "@/lib/types";

interface ScoreBand {
  id: "capped-hard" | "capped-one" | "essentials-met" | "strong";
  label: string;
  range: string;
  tone: "crimson" | "amber" | "teal";
}

const BANDS: ScoreBand[] = [
  { id: "capped-hard", label: "Core or multiple essentials unmet", range: "0–20", tone: "crimson" },
  { id: "capped-one", label: "One essential unmet", range: "21–55", tone: "amber" },
  { id: "essentials-met", label: "All essentials met", range: "56–84", tone: "teal" },
  { id: "strong", label: "Strong across the board", range: "85–100", tone: "teal" },
];

function bandForScore(score: number): ScoreBand {
  if (score <= 20) return BANDS[0];
  if (score <= 55) return BANDS[1];
  if (score <= 84) return BANDS[2];
  return BANDS[3];
}

const TONE_STYLES: Record<ScoreBand["tone"], string> = {
  crimson: "border-gl-crimson/30 bg-gl-crimson-bg text-gl-crimson",
  amber: "border-gl-amber/40 bg-gl-amber/15 text-gl-ink",
  teal: "border-gl-teal/30 bg-gl-teal-bg text-gl-teal",
};

/** Names the requirement plainly, without the JD's full run-on phrasing, for a tight inline list. */
function shortLabel(req: RequirementCheck): string {
  const text = req.requirement;
  if (text.length <= 70) return text;
  const truncated = text.slice(0, 67);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${lastSpace > 40 ? truncated.slice(0, lastSpace) : truncated}...`;
}

/**
 * Explains the cap tier behind a specific score, using this result's own
 * requirementsChecklist — never a generic per-band description. DESIGN.md:
 * reuses the existing teal/crimson/amber palette and mono-label convention,
 * no new visual vocabulary.
 */
export function ScoreBandExplainer({
  score,
  requirementsChecklist,
}: {
  score: number;
  requirementsChecklist: RequirementCheck[];
}) {
  const band = bandForScore(score);
  const essentials = requirementsChecklist.filter((r) => r.type === "essential");
  const unmetEssentials = essentials.filter((r) => r.status === "not_met");
  const coreItem = requirementsChecklist.find((r) => r.isCoreRequirement);
  const coreUnmet = coreItem?.status === "not_met";

  let explanation: string;
  if (coreUnmet && coreItem) {
    explanation = `Capped because "${shortLabel(coreItem)}" — the requirement this role is fundamentally built around — is unmet. That's a hard ceiling regardless of how the rest of the resume reads.`;
  } else if (unmetEssentials.length >= 2) {
    explanation = `Capped because ${unmetEssentials.length} essential requirements are unmet: ${unmetEssentials
      .map((r) => `"${shortLabel(r)}"`)
      .join(", ")}.`;
  } else if (unmetEssentials.length === 1) {
    explanation = `Capped because one essential requirement is unmet: "${shortLabel(unmetEssentials[0])}".`;
  } else if (band.id === "essentials-met") {
    explanation =
      "Every essential requirement is met, so there's no hard cap here — the remaining points reflect desirable requirements and overall polish, not a missing gate.";
  } else {
    explanation =
      "Every essential requirement is met with strong evidence, and desirable extras add real polish on top.";
  }

  return (
    <div className="rounded-2xl border border-gl-ink/10 bg-gl-paper-card p-5 shadow-sm shadow-black/5">
      <p className="text-sm text-gl-ink-muted">
        This tells you where you honestly stand against this specific role — not whether to
        apply. That decision is yours.
      </p>

      <div className="mt-3 flex items-center gap-2.5">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide ${TONE_STYLES[band.tone]}`}
        >
          {band.range} · {band.label}
        </span>
      </div>

      <p className="mt-2.5 text-sm text-gl-ink">{explanation}</p>

      <ul className="mt-4 flex flex-col gap-1 border-t border-gl-ink/10 pt-3 text-xs text-gl-ink-faint">
        {BANDS.map((b) => (
          <li
            key={b.id}
            className={`flex items-center gap-2 ${b.id === band.id ? "font-semibold text-gl-ink" : ""}`}
          >
            <span className="font-mono tabular-nums">{b.range}</span>
            <span>{b.label}</span>
            {b.id === band.id && <span className="text-gl-ink-faint">← this result</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
