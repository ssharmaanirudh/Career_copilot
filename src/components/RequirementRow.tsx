function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 shrink-0" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 shrink-0" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

interface RequirementRowProps {
  type: "essential" | "desirable";
  status: "met" | "not_met";
  requirement: string;
  /** Quoted resume evidence, or plain reasoning text when no evidence exists. */
  detail: string;
  isEvidence: boolean;
  /** Play the pale-crimson flash-on-reveal once this row mounts. Ignored for met rows. */
  flash?: boolean;
  /** Exact JD phrase behind the essential/desirable call — a citation safety net so a misclassification is visible right next to its own justification, not hidden. Omit to render nothing extra. */
  jdQuote?: string;
}

/** DESIGN.md "Requirement row" — icon + mono label line + evidence line, shared by the results checklist and the landing-page sample. */
export function RequirementRow({
  type,
  status,
  requirement,
  detail,
  isEvidence,
  flash = false,
  jdQuote,
}: RequirementRowProps) {
  const met = status === "met";
  return (
    <li
      className={`-mx-2 flex items-start gap-2.5 rounded px-2 py-1.5 ${
        !met && flash ? "motion-safe:animate-[gl-flash-crimson_900ms_ease-out]" : ""
      }`}
    >
      <span className={`mt-0.5 shrink-0 ${met ? "text-gl-teal" : "text-gl-crimson"}`}>
        {met ? <CheckIcon /> : <XIcon />}
      </span>
      <div className="min-w-0">
        <p className="text-sm">
          <span className="mr-1.5 font-mono text-[10px] uppercase tracking-wide text-gl-ink-faint">
            {type}
          </span>
          <span className="font-medium text-gl-ink">{requirement}</span>
        </p>
        {detail && (
          <p className="mt-0.5 text-sm text-gl-ink-muted">
            {isEvidence ? `“${detail}”` : detail}
          </p>
        )}
        {jdQuote && (
          <p className="mt-0.5 font-mono text-xs text-gl-ink-faint">JD: &ldquo;{jdQuote}&rdquo;</p>
        )}
      </div>
    </li>
  );
}
