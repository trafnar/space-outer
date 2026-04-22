"use client";

import { QuestionTable } from "@/components/QuestionTable";
import { TypoH1 } from "@/components/ui/typo";
import type { Manifest, Question } from "@/data/types";

export function TestViewClient({
  manifest,
  questions,
}: {
  manifest: Manifest;
  questions: Question[];
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* <header className="p-8">
        <h1 className="text-2xl font-heading font-bold">{manifest.title}</h1>
      </header> */}

      <QuestionTable
        questions={questions}
        standards={manifest.standards}
        title={manifest.title}
      />

      {/* <div>
        Score: {manifest.score.earned}/{manifest.score.possible} (
        {manifest.score.percent}%)
      </div>


      {questions.map((q) => (
        <QuestionCard key={q.n} question={q} />
      ))} */}
    </div>
  );
}
