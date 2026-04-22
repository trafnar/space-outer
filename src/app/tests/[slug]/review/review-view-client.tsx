"use client";

import Link from "next/link";
import { QuestionCard } from "@/components/QuestionCard";
import { AnswerVisibilityToggle } from "@/components/AnswerVisibilityToggle";
import { Button } from "@/components/ui/button";
import { useReviewSheet } from "@/lib/reviewSheet";
import { useShowReviewTitle } from "@/lib/settings";
import type { Manifest, Question } from "@/data/types";
import {
  IconArrowLeft,
  IconClipboardX,
  IconEye,
  IconEyeClosed,
  IconPrinter,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";

// Matches the sticky header height used on the main test page.
const stickyHeaderHeight = 96;

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
  const [showTitle, setShowTitle] = useShowReviewTitle();

  // The review sheet lives in localStorage, which is only available
  // after the client hydrates. Don't commit to the "empty" state until
  // we're sure — otherwise the Empty component flashes before the
  // questions load.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  return (
    <>
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

      {hydrated && reviewQuestions.length > 0 && (
        <header
          style={{ height: stickyHeaderHeight }}
          className="sticky top-0 z-10 bg-background border-b border-dashed flex items-center justify-between gap-4 px-6 print:hidden"
        >
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
            <Button
              variant="outline"
              size="sm"
              aria-label={showTitle ? "Hide title" : "Show title"}
              onClick={() => setShowTitle(!showTitle)}
            >
              {showTitle ? (
                <IconEye data-icon="inline-start" />
              ) : (
                <IconEyeClosed data-icon="inline-start" />
              )}
              Title
            </Button>
            <AnswerVisibilityToggle size="sm" />
            <Button size="sm" onClick={() => window.print()}>
              <IconPrinter />
              Print
            </Button>
          </div>
        </header>
      )}

      <div className="mx-auto w-full max-w-[7.5in] flex flex-col gap-6 p-8 print:p-0">
        {showTitle && (
          <h1 className="text-2xl font-heading font-bold">{manifest.title}</h1>
        )}

        {!hydrated ? null : reviewQuestions.length === 0 ? (
          <Empty className="print:hidden">
            <EmptyMedia>
              <IconClipboardX />
            </EmptyMedia>
            <EmptyHeader>This review sheet is empty</EmptyHeader>
            <EmptyDescription>
              Add questions to the review sheet by marking them in the test
              view.
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
          <div className="flex flex-col gap-12">
            {reviewQuestions.map((q) => (
              <div
                key={q.n}
                data-question-card
                className="break-inside-avoid relative"
              >
                <div
                  aria-hidden
                  className="absolute right-full top-0 pr-3 font-heading font-bold text-sm text-muted-foreground"
                >
                  {q.n}.
                </div>
                <QuestionCard question={q} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
