"use client";

import Link from "next/link";
import { QuestionCard } from "@/components/QuestionCard";
import { AnswerVisibilityToggle } from "@/components/AnswerVisibilityToggle";
import { Button } from "@/components/ui/button";
import { TypoH2 } from "@/components/ui/typo";
import { useWorksheet } from "@/lib/worksheet";
import {
  AnswerVisibilityProvider,
  useScopedAnswerVisibility,
  useShowWorksheetTitle,
} from "@/lib/settings";
import { cn } from "@/lib/utils";
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
const stickyHeaderHeight = 108;

export function WorksheetViewClient({
  manifest,
  questions,
  slug,
}: {
  manifest: Manifest;
  questions: Question[];
  slug: string;
}) {
  const [worksheetIds] = useWorksheet(slug);
  const worksheetQuestions = questions.filter((q) => worksheetIds.has(q.n));
  const [showTitle, setShowTitle] = useShowWorksheetTitle();
  const visibility = useScopedAnswerVisibility(`worksheet:${slug}`, false);

  // The worksheet lives in localStorage, which is only available
  // after the client hydrates. Don't commit to the "empty" state until
  // we're sure — otherwise the Empty component flashes before the
  // questions load.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  return (
    <AnswerVisibilityProvider value={visibility}>
      <style>{`
        @page {
          margin: 0.5in;
        }
        [data-question-card] [role="img"] {
          max-width: 50%;
        }
        [data-question-card] [role="img"] svg,
        [data-question-card] [role="img"] img {
          max-width: 100%;
          height: auto;
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

      {hydrated && worksheetQuestions.length > 0 && (
        <div
          style={{ height: stickyHeaderHeight }}
          className="sticky top-0 z-10 bg-background border-b border-dashed flex flex-col justify-between print:hidden"
        >
          <div className="h-[52px] flex justify-between px-6 items-center">
            <div className="flex items-center gap-2 min-w-0 grow">
              <Button
                variant="ghost"
                size="icon-sm"
                className={cn(
                  "text-muted-foreground",
                  // optical adjustment
                  "-ml-2",
                )}
                nativeButton={false}
                aria-label="Back to test"
                render={<Link href={`/tests/${slug}`} />}
              >
                <IconArrowLeft />
              </Button>
              <div className="relative min-w-0 grow">
                <TypoH2 className="truncate">Worksheet</TypoH2>
                <div className="absolute top-full left-0 right-0 -mt-[1px] text-xs text-muted-foreground truncate">
                  {manifest.title}
                </div>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="h-full pl-2 -ml-2 pr-6 -mr-6 group/pad bg-debug-red flex items-center"
              aria-label="Print"
            >
              <Button
                variant="default"
                size="sm"
                nativeButton={false}
                render={<div />}
              >
                <IconPrinter data-icon="inline-start" />
                Print Worksheet
              </Button>
            </button>
          </div>
          <div className={cn("px-6 flex items-center -ml-1", "h-11")}>
            <button
              onClick={() => setShowTitle(!showTitle)}
              className="h-full px-1 group/pad bg-debug-red"
              aria-label={showTitle ? "Hide title" : "Show title"}
            >
              <Button
                variant="outline"
                nativeButton={false}
                render={<div />}
                size="xs"
              >
                {showTitle ? (
                  <IconEye data-icon="inline-start" />
                ) : (
                  <IconEyeClosed data-icon="inline-start" />
                )}
                Title
              </Button>
            </button>
            <AnswerVisibilityToggle />
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-[8.5in] flex flex-col gap-6 px-[0.5in] py-12 mt-8 border print:border-0 print:p-0 print:m-0">
        {showTitle && (
          <h1 className="text-2xl font-heading font-bold">{manifest.title}</h1>
        )}

        {!hydrated ? null : worksheetQuestions.length === 0 ? (
          <Empty className="print:hidden">
            <EmptyMedia>
              <IconClipboardX />
            </EmptyMedia>
            <EmptyHeader>This worksheet is empty</EmptyHeader>
            <EmptyDescription>
              Add questions to the worksheet by marking them in the test view.
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
            {worksheetQuestions.map((q) => (
              <div
                key={q.n}
                data-question-card
                className="break-inside-avoid relative pl-8"
              >
                <div
                  aria-hidden
                  className="absolute left-0 top-0 font-heading font-bold"
                >
                  {q.n}.
                </div>
                <QuestionCard question={q} />
              </div>
            ))}
          </div>
        )}
      </div>
    </AnswerVisibilityProvider>
  );
}
