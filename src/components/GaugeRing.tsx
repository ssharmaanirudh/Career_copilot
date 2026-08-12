/**
 * Circular progress ring — decorative only, for the landing-page hero's
 * "analyzing" dashboard mockup and the mini step-3 preview. DESIGN.md bans
 * gauge/donut charts for the real score reads (ScoreCard, SamplePreview,
 * SecondSamplePreview all stay the plain BigScore number); this exists
 * only because the user explicitly approved a one-off exception here to
 * match a specific reference design. Do not reuse this on any page that
 * reports a real or sample score result.
 */
export function GaugeRing({
  score,
  size = 128,
  strokeWidth = 10,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const center = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
      <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--gl-teal-bg)" strokeWidth={strokeWidth} />
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="var(--gl-teal)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}
