"use client";

import { QuestionTable } from "@/components/QuestionTable";
import type { Manifest, Question } from "@/data/types";
import {
  AnswerVisibilityProvider,
  useScopedAnswerVisibility,
} from "@/lib/settings";

export function TestViewClient({
  manifest,
  questions,
  slug,
}: {
  manifest: Manifest;
  questions: Question[];
  slug: string;
}) {
  const visibility = useScopedAnswerVisibility(`test:${slug}`, true);
  const { earned, possible, percent } = manifest.score;
  const subtitle = (
    <>
      {earned}/{possible} ({percent}%) · {manifest.student}
    </>
  );
  return (
    <AnswerVisibilityProvider value={visibility}>
      <QuestionTable
        questions={questions}
        standards={manifest.standards}
        title={manifest.title}
        subtitle={subtitle}
        slug={slug}
      />
    </AnswerVisibilityProvider>
  );
}
