import { Hero } from "@/components/Hero";
import { LandingHeader } from "@/components/LandingHeader";
import { FeatureRow } from "@/components/FeatureRow";
import { SecondSamplePreview } from "@/components/SecondSamplePreview";
import { SimpleSteps } from "@/components/SimpleSteps";
import { PullQuote } from "@/components/PullQuote";
import { TrustBand } from "@/components/TrustBand";
import { ScrollReveal } from "@/components/ScrollReveal";
import { HighlighterMark, PinMark } from "@/components/DecorativeMarks";

export default function Home() {
  return (
    <div className="gl-page-grid min-h-full font-sans">
      <LandingHeader />

      <main className="relative mx-auto max-w-5xl px-6 py-10">
        <Hero />

        <div id="features" className="mt-16 scroll-mt-24 sm:mt-20">
          <ScrollReveal translateYPx={16}>
            <FeatureRow />
          </ScrollReveal>
        </div>

        <div className="relative mt-16 sm:mt-20">
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

        <div className="mt-16 sm:mt-20">
          <ScrollReveal translateYPx={16}>
            <SimpleSteps />
          </ScrollReveal>
        </div>

        <div className="mt-16 sm:mt-20">
          <ScrollReveal translateYPx={16}>
            <PullQuote>
              We&apos;ll tell you when it&apos;s not a match, before an employer does.
            </PullQuote>
          </ScrollReveal>
        </div>

        <div className="mt-8">
          <ScrollReveal translateYPx={16} delayMs={100}>
            <TrustBand />
          </ScrollReveal>
        </div>

        <p className="mt-10 text-center text-sm font-medium text-gl-ink-muted">
          Built for job seekers. Backed by{" "}
          <span className="text-gl-teal underline decoration-2 underline-offset-2">AI</span>.
        </p>
      </main>
    </div>
  );
}
