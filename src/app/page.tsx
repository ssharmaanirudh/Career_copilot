import Link from "next/link";
import { Hero } from "@/components/Hero";
import { SiteHeader } from "@/components/SiteHeader";
import { SecondSamplePreview } from "@/components/SecondSamplePreview";
import { SimpleSteps } from "@/components/SimpleSteps";
import { ScrollReveal } from "@/components/ScrollReveal";
import { HighlighterMark, PinMark } from "@/components/DecorativeMarks";

export default function Home() {
  return (
    <div className="gl-page-grid min-h-full font-sans">
      <SiteHeader />

      <main className="relative mx-auto max-w-5xl px-6 py-10">
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

        <div className="relative mt-16">
          <HighlighterMark
            className="pointer-events-none absolute -right-4 -top-9 hidden h-7 w-24 -rotate-[4deg] text-gl-amber opacity-40 lg:block xl:-right-10"
          />
          <PinMark
            className="pointer-events-none absolute -left-6 bottom-6 hidden h-12 w-10 rotate-[10deg] text-gl-ink-faint opacity-[0.18] lg:block xl:-left-14"
          />

          <ScrollReveal translateYPx={16} delayMs={100}>
            <SecondSamplePreview />
          </ScrollReveal>
        </div>

        <div className="mt-20">
          <ScrollReveal translateYPx={16}>
            <SimpleSteps />
          </ScrollReveal>
        </div>
      </main>
    </div>
  );
}
