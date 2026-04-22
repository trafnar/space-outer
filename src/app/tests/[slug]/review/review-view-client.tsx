"use client";

import Link from "next/link";
import { QuestionCard } from "@/components/QuestionCard";
import { AnswerVisibilityToggle } from "@/components/AnswerVisibilityToggle";
import { Button } from "@/components/ui/button";
import { useReviewSheet } from "@/lib/reviewSheet";
import type { Manifest, Question } from "@/data/types";
import {
  IconArrowLeft,
  IconClipboardX,
  IconPrinter,
} from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";

export function ReviewViewClient({
  manifest,
  questions,
  slug,
}: {
  manifest: Manifest;
  questions: Question[];
  slug: string;
}) {
  const [reviewIds] = useReviewSheet(slug);
  const reviewQuestions = questions.filter((q) => reviewIds.has(q.n));

  // The review sheet lives in localStorage, which is only available
  // after the client hydrates. Don't commit to the "empty" state until
  // we're sure — otherwise the Empty component flashes before the
  // questions load.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  return (
    <div className="mx-auto w-full max-w-[8in] flex flex-col gap-6 p-8 print:p-0">
      <style>{`
        @page {
          margin: 0.2in;
        }
        @media print {
          * {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          [data-question-card] {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
      {reviewQuestions.length > 0 && (
        <header className="flex items-center justify-between gap-4 print:hidden">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={`/tests/${slug}`} />}
          >
            <IconArrowLeft />
            Back to test
          </Button>
          <div className="flex items-center gap-2">
            <AnswerVisibilityToggle size="sm" />
            <Button size="sm" onClick={() => window.print()}>
              <IconPrinter />
              Print
            </Button>
          </div>
        </header>
      )}
      <header>
        <h1 className="text-2xl font-heading font-bold">{manifest.title}</h1>
        <p className="text-sm text-muted-foreground">
          Review sheet — {reviewQuestions.length}{" "}
          {reviewQuestions.length === 1 ? "question" : "questions"}
        </p>
      </header>

      {!hydrated ? null : reviewQuestions.length === 0 ? (
        <Empty className="print:hidden">
          <EmptyMedia>
            <IconClipboardX />
          </EmptyMedia>
          <EmptyHeader>This review sheet is empty</EmptyHeader>
          <EmptyDescription>
            Add questions to the review sheet by marking them in the test view.
          </EmptyDescription>
          <EmptyContent>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href={`/tests/${slug}`} />}
            >
              <IconArrowLeft />
              Back to test
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="flex flex-col gap-6">
          {reviewQuestions.map((q) => (
            <React.Fragment key={q.n}>
              <div
                data-question-card
                className="break-inside-avoid flex flex-col gap-3"
              >
                <h2 className="font-heading font-bold text-lg">
                  Question {q.n}
                </h2>
                <QuestionCard question={q} />
              </div>
              <Separator />
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
