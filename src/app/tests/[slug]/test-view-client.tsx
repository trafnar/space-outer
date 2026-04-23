"use client";

import { QuestionTable } from "@/components/QuestionTable";
import type { TestViewData } from "@/lib/testViewData";
import {
  AnswerVisibilityProvider,
  useScopedAnswerVisibility,
} from "@/lib/settings";

export function TestViewClient({
  test,
  slug,
}: {
  test: TestViewData;
  slug: string;
}) {
  const visibility = useScopedAnswerVisibility(`test:${slug}`, true);
  const { earned, possible, percent } = test.score;
  const subtitle = (
    <>
      {earned}/{possible} ({percent}%) · {test.student}
    </>
  );
  return (
    <AnswerVisibilityProvider value={visibility}>
      <QuestionTable
        questions={test.questions}
        standards={test.standards}
        title={test.title}
        subtitle={subtitle}
        slug={slug}
      />
    </AnswerVisibilityProvider>
  );
}
