/**
 * Print-style pull quote — a single sharp claim set apart from its usual
 * paragraph position and given real typographic weight, the way a magazine
 * pulls a line out of body copy rather than shouting it in a banner.
 * DESIGN.md-compliant on purpose: Newsreader italic (the only serif this
 * project uses), no new color, no new shadow/motion vocabulary — just scale
 * and whitespace doing the work.
 */
export function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 py-2 text-center">
      <span className="h-px w-10 bg-gl-ink/15" aria-hidden="true" />
      <p className="font-serif max-w-2xl text-2xl italic leading-snug text-gl-ink sm:text-3xl">
        &ldquo;{children}&rdquo;
      </p>
      <span className="h-px w-10 bg-gl-ink/15" aria-hidden="true" />
    </div>
  );
}
