"use client";

import { useState } from "react";
import type { AnalysisResult } from "@/lib/types";
import { ScoreCard } from "./ScoreCard";
import { ScoreBandExplainer } from "./ScoreBandExplainer";
import { DocumentPanel } from "./DocumentPanel";
import { TailoredResumeView } from "./TailoredResumeView";
import { SkillGapList } from "./SkillGapList";
import { WordingFixList } from "./WordingFixList";
import { HonestTakeCard } from "./HonestTakeCard";

const TABS = [
  {
    id: "resume",
    label: "Tailored Resume",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
      />
    ),
  },
  {
    id: "cover-letter",
    label: "Cover Letter",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
      />
    ),
  },
  {
    id: "changes",
    label: "What Changed",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    ),
  },
  {
    id: "skills",
    label: "Skills to Learn",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m4.26 10.147 7.44-4.147 7.44 4.147-7.44 4.147-7.44-4.147ZM4.26 10.147v5.559a2 2 0 0 0 .965 1.713L11.7 21.5l6.475-4.081a2 2 0 0 0 .965-1.713v-5.559"
      />
    ),
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ResultsView({ result }: { result: AnalysisResult }) {
  const [activeTab, setActiveTab] = useState<TabId>("resume");

  return (
    <div className="flex flex-col gap-6">
      {result.flags.length > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 shadow-sm shadow-amber-100">
          <p className="font-semibold">Flagged during review</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {result.flags.map((flag, i) => (
              <li key={i}>{flag}</li>
            ))}
          </ul>
        </div>
      )}
      <ScoreCard
        original={result.originalScore}
        tailored={result.tailoredScore}
        requirementsChecklist={result.requirementsChecklist}
      />

      <ScoreBandExplainer
        score={result.tailoredScore.matchScore}
        requirementsChecklist={result.requirementsChecklist}
      />

      <HonestTakeCard
        ceiling={result.maxRealisticScoreAfterWordingFixesOnly}
        summary={result.honestSummary}
      />

      <div className="rounded-2xl border border-gl-ink/10 bg-gl-paper-card shadow-sm shadow-black/5">
        <div className="flex overflow-x-auto border-b border-gl-ink/10 px-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-gl-teal text-gl-teal"
                  : "border-transparent text-gl-ink-faint hover:text-gl-ink"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                className="h-4 w-4"
                aria-hidden="true"
              >
                {tab.icon}
              </svg>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "resume" && <TailoredResumeView resume={result.tailoredResume} />}
          {activeTab === "cover-letter" && <DocumentPanel text={result.coverLetter} />}
          {activeTab === "changes" && (
            <div>
              <ul className="list-disc space-y-2 pl-5 text-sm text-gl-ink-muted">
                {result.keyChanges.length === 0 && (
                  <p className="text-gl-ink-faint">No changes were recorded.</p>
                )}
                {result.keyChanges.map((change, i) => (
                  <li key={i}>{change}</li>
                ))}
              </ul>
              <WordingFixList fixes={result.wordingFixes} />
            </div>
          )}
          {activeTab === "skills" && <SkillGapList skillGaps={result.skillGaps} />}
        </div>
      </div>
    </div>
  );
}
