import type { Metadata } from "next";
import BlackHoleHeroSectionDemo from "@/components/ui/blackhole-hero-section-demo";

// Component demo, not a real marketing page — kept out of search results and
// off GapLens's own nav so it doesn't read as part of the actual product.
export const metadata: Metadata = {
  title: "Black hole hero — component demo",
  robots: { index: false, follow: false },
};

export default function BlackholeDemoPage() {
  return <BlackHoleHeroSectionDemo />;
}
