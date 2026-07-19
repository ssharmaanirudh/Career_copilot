/** Static, hardcoded sample output for the landing page — never wired to real data. */

const SCORE = 42;

const CHECKLIST = [
  {
    type: "essential",
    status: "met",
    requirement: "3+ years of backend development",
    detail: "“5 years building backend services in Node.js and Python”",
  },
  {
    type: "essential",
    status: "not_met",
    requirement: "AWS (EC2, S3, Lambda)",
    detail: "No mention of AWS or any cloud infrastructure work.",
  },
  {
    type: "essential",
    status: "not_met",
    requirement: "Kubernetes / container orchestration",
    detail: "No mention of Kubernetes or container orchestration.",
  },
  {
    type: "desirable",
    status: "met",
    requirement: "CI/CD pipeline experience",
    detail: "“Built CI/CD pipelines using GitHub Actions”",
  },
] as const;

const STATUS_STYLES: Record<"met" | "not_met", string> = {
  met: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  not_met: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
};

const STATUS_ICON: Record<"met" | "not_met", string> = { met: "✓", not_met: "✗" };

const TYPE_STYLES: Record<"essential" | "desirable", string> = {
  essential: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  desirable: "bg-zinc-50 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500",
};

export function SamplePreview() {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          What you get back
        </h2>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          Sample — not a real result
        </span>
      </div>

      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/70 p-6 dark:border-zinc-700 dark:bg-zinc-900/70">
        <div className="flex flex-wrap items-center gap-6">
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle
                cx="50"
                cy="50"
                r={42}
                fill="none"
                strokeWidth="10"
                className="stroke-zinc-100 dark:stroke-zinc-800"
              />
              <circle
                cx="50"
                cy="50"
                r={42}
                fill="none"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 42}
                strokeDashoffset={2 * Math.PI * 42 * (1 - SCORE / 100)}
                className="stroke-rose-500"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-bold tabular-nums text-rose-600 dark:text-rose-400">
                {SCORE}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-zinc-400">/ 100</span>
            </div>
          </div>
          <div className="min-w-[16rem] flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                Application strength
              </h3>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                Would not clear a screen
              </span>
            </div>
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              Score capped: 2 essential requirements are unmet — AWS and Kubernetes.
            </p>
          </div>
        </div>

        <ul className="mt-5 flex flex-col gap-2.5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          {CHECKLIST.map((item) => (
            <li key={item.requirement} className="flex items-start gap-2 text-sm">
              <span
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${STATUS_STYLES[item.status]}`}
              >
                {STATUS_ICON[item.status]}
              </span>
              <span>
                <span
                  className={`mr-1.5 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${TYPE_STYLES[item.type]}`}
                >
                  {item.type}
                </span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {item.requirement}
                </span>
                <span className="text-zinc-500"> — {item.detail}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-zinc-100 pt-4 dark:border-zinc-800 lg:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Quick fix &middot; REST API design
            </p>
            <p className="mt-2 text-sm text-zinc-500 line-through decoration-zinc-300 dark:decoration-zinc-700">
              Worked on backend services
            </p>
            <p className="mt-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Designed and built 6 REST APIs powering the core backend service
            </p>
            <p className="mt-1.5 text-xs text-zinc-500">
              The evidence was already there — it just wasn&apos;t stated in the posting&apos;s
              terms.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Real gap &middot; AWS (EC2, S3, Lambda)
              </p>
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                High priority
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              No cloud infrastructure experience shown anywhere in the resume.
            </p>
            <p className="mt-2 text-xs text-zinc-700 dark:text-zinc-300">
              Deploy a personal project on AWS free tier and document the architecture, or
              complete AWS Cloud Practitioner and add it to the resume.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
