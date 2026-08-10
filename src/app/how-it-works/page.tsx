import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { WhyDifferent } from "@/components/WhyDifferent";
import { VerificationProcess } from "@/components/VerificationProcess";
import { SamplePreview } from "@/components/SamplePreview";

export const metadata = {
  title: "How GapLens works",
  description:
    "How GapLens checks a resume against a job posting — what makes it different, and the four-step verification process behind every score.",
};

export default function HowItWorks() {
  return (
    <div className="gl-page-grid min-h-full font-sans">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-gl-teal hover:underline"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to GapLens
        </Link>

        <h1 className="font-serif mb-8 max-w-2xl text-3xl font-semibold text-gl-ink sm:text-4xl">
          How the check actually works
        </h1>

        <WhyDifferent />
        <VerificationProcess />
        <SamplePreview />
      </main>
    </div>
  );
}
