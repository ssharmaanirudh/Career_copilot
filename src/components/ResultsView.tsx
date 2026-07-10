"use client";

import { useState } from "react";
import type { AnalysisResult } from "@/lib/types";
import { ScoreCard } from "./ScoreCard";
import { DocumentPanel } from "./DocumentPanel";
import { TailoredResumeView } from "./TailoredResumeView";
import { SkillGapList } from "./SkillGapList";

const TABS = [
  { id: "resume", label: "Tailored Resume" },
  { id: "cover-letter", label: "Cover Letter" },
  { id: "changes", label: "What Changed" },
  { id: "skills", label: "Skills to Learn" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ResultsView({ result }: { result: AnalysisResult }) {
  const [activeTab, setActiveTab] = useState<TabId>("resume");

  return (
    <div className="flex flex-col gap-6">
      {result.flags.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
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

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex overflow-x-auto border-b border-zinc-200 dark:border-zinc-800">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "resume" && <TailoredResumeView resume={result.tailoredResume} />}
          {activeTab === "cover-letter" && <DocumentPanel text={result.coverLetter} />}
          {activeTab === "changes" && (
            <ul className="list-disc space-y-2 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
              {result.keyChanges.length === 0 && (
                <p className="text-zinc-500">No changes were recorded.</p>
              )}
              {result.keyChanges.map((change, i) => (
                <li key={i}>{change}</li>
              ))}
            </ul>
          )}
          {activeTab === "skills" && <SkillGapList skillGaps={result.skillGaps} />}
        </div>
      </div>
    </div>
  );
}
