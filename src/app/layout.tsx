import type { Metadata } from "next";
import { Newsreader, IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";

// DESIGN.md typography, applied sitewide as of Phase 2 (the hero rebuild):
// Newsreader for h1/h2 only, IBM Plex Mono for evidence/citations/labels,
// Inter for body copy and UI chrome. Geist Sans/Mono dropped — DESIGN.md
// specifies exactly these three fonts, no more.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "GapLens",
  description:
    "See exactly what's missing between your resume and the job description — an honest score, a tailored resume and cover letter, and a plan to close real gaps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${ibmPlexMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
