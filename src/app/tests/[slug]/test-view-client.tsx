"use client";

import { QuestionTable } from "@/components/QuestionTable";
import type { Manifest, Question } from "@/data/types";

export function TestViewClient({
  manifest,
  questions,
  slug,
}: {
  manifest: Manifest;
  questions: Question[];
  slug: string;
}) {
  const { earned, possible, percent } = manifest.score;
  const subtitle = (
    <>
      {earned}/{possible} ({percent}%) · {manifest.student}
    </>
  );
  return (
    <QuestionTable
      questions={questions}
      standards={manifest.standards}
      title={manifest.title}
      subtitle={subtitle}
      slug={slug}
    />
  );
}
