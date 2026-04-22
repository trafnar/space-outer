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
  return (
    <QuestionTable
      questions={questions}
      standards={manifest.standards}
      title={manifest.title}
      slug={slug}
    />
  );
}
