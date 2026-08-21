import { Fragment } from "react";
import { GaugeRing } from "./GaugeRing";

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0-4 4m4-4 4 4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3 w-3" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0-5-5m5 5-5 5" />
    </svg>
  );
}

function UploadMockup() {
  return (
    <div className="relative flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-gl-ink/15 bg-gl-paper">
      <span className="text-gl-teal">
        <UploadIcon />
      </span>
      <span className="absolute right-2 bottom-2 flex h-5 w-5 items-center justify-center rounded-full bg-gl-teal text-white">
        <CheckIcon />
      </span>
      <span className="absolute bottom-2 left-2 font-mono text-[9px] uppercase tracking-wide text-gl-ink-faint">
        PDF, DOCX
      </span>
    </div>
  );
}

function JobDescriptionMockup() {
  return (
    <div className="flex h-24 flex-col gap-2 rounded-lg border border-gl-ink/10 bg-gl-paper p-3">
      <div className="flex gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-gl-crimson/50" />
        <span className="h-1.5 w-1.5 rounded-full bg-gl-amber/60" />
        <span className="h-1.5 w-1.5 rounded-full bg-gl-teal/60" />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="h-1.5 w-full rounded-full bg-gl-ink/10" />
        <span className="h-1.5 w-4/5 rounded-full bg-gl-ink/10" />
        <span className="h-1.5 w-3/5 rounded-full bg-gl-ink/10" />
      </div>
    </div>
  );
}

function GapReportMockup() {
  return (
    <div className="flex h-24 items-center justify-between gap-2 rounded-lg border border-gl-ink/10 bg-gl-paper p-3">
      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
        <GaugeRing score={82} size={64} strokeWidth={6} />
        <span className="absolute font-mono text-xs font-bold text-gl-teal">82</span>
      </div>
      <div className="flex h-14 flex-1 items-end gap-1.5">
        <span className="h-full w-2 rounded-full bg-gl-teal" />
        <span className="h-2/3 w-2 rounded-full bg-gl-crimson" />
        <span className="h-1/2 w-2 rounded-full bg-gl-amber" />
        <span className="h-5/6 w-2 rounded-full bg-gl-teal" />
      </div>
    </div>
  );
}

const STEPS = [
  {
    n: 1,
    title: "Upload your resume",
    body: "PDF, DOCX, or plain text — read once for this check, never stored.",
    mockup: <UploadMockup />,
  },
  {
    n: 2,
    title: "Paste the job description",
    body: "The real posting you're applying to, not a general idea of the role.",
    mockup: <JobDescriptionMockup />,
  },
  {
    n: 3,
    title: "Get your gap report",
    body: "An honest score, a tailored resume and cover letter, and a plan for any real gaps.",
    mockup: <GapReportMockup />,
  },
] as const;

/**
 * A different visual treatment from VerificationProcess's crimson-thread
 * pinned-card pattern: numbered teal badges, arrow connectors, and a small
 * illustrative mockup per card — matching an approved reference design for
 * the landing page specifically, not a replacement for the how-it-works
 * process pattern elsewhere.
 */
export function SimpleSteps() {
  return (
    <section>
      <div className="flex items-center justify-center gap-3">
        <span className="h-px w-8 bg-gl-ink/15" aria-hidden="true" />
        <h2 className="font-serif text-xl font-semibold text-gl-ink">3 simple steps</h2>
        <span className="h-px w-8 bg-gl-ink/15" aria-hidden="true" />
      </div>

      <div className="mt-8 grid grid-cols-1 items-center gap-6 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
        {STEPS.map((step, i) => (
          <Fragment key={step.n}>
            <div className="rounded-2xl border border-gl-ink/10 bg-gl-paper-card p-5 shadow-sm shadow-black/5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gl-teal font-mono text-xs font-semibold text-white">
                  {step.n}
                </span>
                <p className="font-medium text-gl-ink">{step.title}</p>
              </div>
              <div className="mt-3">{step.mockup}</div>
              <p className="mt-3 text-xs text-gl-ink-muted">{step.body}</p>
            </div>
            {i < STEPS.length - 1 && (
              <div className="hidden justify-center text-gl-ink-faint sm:flex" aria-hidden="true">
                <ArrowIcon />
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
