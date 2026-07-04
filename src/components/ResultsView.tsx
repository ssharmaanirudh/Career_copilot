"use client";

import { useState } from "react";
import type { AnalysisResult } from "@/lib/types";
import { ScoreCard } from "./ScoreCard";
import { DocumentPanel } from "./DocumentPanel";
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
      <ScoreCard
        matchScore={result.matchScore}
        scoreBreakdown={result.scoreBreakdown}
        scoreSummary={result.scoreSummary}
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
          {activeTab === "resume" && (
            <DocumentPanel text={result.tailoredResume} downloadKind="resume" />
          )}
          {activeTab === "cover-letter" && (
            <DocumentPanel text={result.coverLetter} downloadKind="cover-letter" />
          )}
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
