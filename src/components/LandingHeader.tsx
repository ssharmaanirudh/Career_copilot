import Link from "next/link";

/**
 * Marketing nav header — landing page only. The shared SiteHeader (used on
 * /analyze and /how-it-works) stays intentionally minimal per an earlier,
 * still-standing requirement that the tool page not carry full marketing
 * nav; this is a separate component rather than an edit to SiteHeader so
 * that requirement isn't disturbed. "Scoring" points at /how-it-works
 * (the page that actually explains scoring) rather than a page that
 * doesn't exist; "Features" and "Examples" scroll to sections on this page.
 */
export function LandingHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-gl-ink/10 bg-gl-paper-card">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="brand-solid-text h-7 w-7 shrink-0"
            aria-hidden="true"
          >
            <circle cx="10" cy="10" r="7" />
            <path d="M20.5 20.5 15.8 15.8" />
            <path d="M6.5 10.3 9 12.8 13.5 7.3" />
          </svg>
          <span className="text-lg font-bold tracking-tight text-gl-ink">
            Gap<span className="brand-solid-text">Lens</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-gl-ink-muted md:flex">
          <Link href="/how-it-works" className="hover:text-gl-ink">
            How it works
          </Link>
          <Link href="/how-it-works" className="hover:text-gl-ink">
            Scoring
          </Link>
          <a href="#features" className="hover:text-gl-ink">
            Features
          </a>
          <a href="#examples" className="hover:text-gl-ink">
            Examples
          </a>
        </nav>

        <Link
          href="/analyze"
          className="brand-gradient-bg inline-flex shrink-0 items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-shadow hover:shadow-md"
        >
          Upload resume
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
          </svg>
        </Link>
      </div>
    </header>
  );
}
