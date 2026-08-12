import Link from "next/link";

/** Shared sticky site header — used identically on the landing page, the tool page, and the "How it works" page. Logo always links home (the marketing landing page). */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-gl-ink/10 bg-gl-paper-card">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="brand-solid-text h-8 w-8 shrink-0"
            aria-hidden="true"
          >
            <circle cx="10" cy="10" r="7" />
            <path d="M20.5 20.5 15.8 15.8" />
            <path d="M6.5 10.3 9 12.8 13.5 7.3" />
          </svg>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-gl-ink">
              Gap<span className="brand-solid-text">Lens</span>
            </h1>
            <p className="text-xs text-gl-ink-faint">
              See exactly what&apos;s missing — before you hit send.
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}
