import { DocumentMarkupDemo } from "./DocumentMarkupDemo";

export function Hero() {
  return (
    <section className="mb-10">
      <h1 className="font-serif max-w-2xl text-3xl font-semibold text-gl-ink sm:text-4xl">
        Every claim, checked against real evidence.
      </h1>
      <p className="mt-3 max-w-xl text-gl-ink-muted">
        GapLens reads your resume the way a strict reviewer would — verifying
        what&apos;s real, flagging what&apos;s missing, before you ever hit send.
      </p>
      <div className="mt-8">
        <DocumentMarkupDemo />
      </div>
    </section>
  );
}
