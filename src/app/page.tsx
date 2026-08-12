import Link from "next/link";
import { Hero } from "@/components/Hero";
import { SiteHeader } from "@/components/SiteHeader";

export default function Home() {
  return (
    <div className="gl-page-grid min-h-full font-sans">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <Hero />

        <div className="-mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href="/analyze"
            className="brand-gradient-bg group inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-semibold text-white shadow-md shadow-gl-teal/25 transition-all hover:shadow-lg hover:shadow-gl-teal/35"
          >
            Try GapLens free
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
            </svg>
          </Link>

          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-1 text-sm font-medium text-gl-teal hover:underline"
          >
            See how the scoring actually works
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
      </main>
    </div>
  );
}
