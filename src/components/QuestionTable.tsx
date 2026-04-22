"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Block, Question } from "@/data/types";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { QuestionCard } from "./QuestionCard";
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { PointsBadge } from "./PointsBadge";
import { StandardsBadge } from "./StandardsBadge";
import { QuestionSheet } from "./QuestionSheet";
import { useReviewSheet } from "@/lib/reviewSheet";
import Link from "next/link";
import {
  IconArrowRight,
  IconChevronRight,
  IconClipboard,
  IconClipboardCheckFilled,
  IconClipboardPlus,
  IconX,
} from "@tabler/icons-react";

type RowAction = "expand" | "pop" | "none";
const rowAction = "pop" as RowAction;
const isExpandMode = rowAction === "expand";
const isPopMode = rowAction === "pop";
const isInteractive = isExpandMode || isPopMode;

export function QuestionTable({
  questions,
  standards,
  title,
  slug,
}: {
  questions: Question[];
  standards?: Record<string, string>;
  title?: string;
  slug: string;
}) {
  const [expandedRowIds, setExpandedRowIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [reviewSheet, setReviewSheet] = useReviewSheet(slug);
  // SHARED-SELECTION: this is the source of truth for the "active" row.
  // To lift it, replace this useState with `selectedIndex` / `onSelectedIndexChange`
  // props (or a context/store hook) and remove this local state.
  const [poppedIndex, setPoppedIndex] = useState<number | null>(null);

  const toggleRow = (n: number) => {
    setExpandedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };

  const toggleInReviewSheet = (n: number) => {
    setReviewSheet((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };

  const activateRow = (q: Question, index: number) => {
    if (isExpandMode) toggleRow(q.n);
    // SHARED-SELECTION: when the selection is shared, swap `setPoppedIndex`
    // for the lifted setter (e.g. `onSelectedIndexChange(index)`).
    else if (isPopMode) setPoppedIndex(index);
  };

  const toggleAllRows = () => {
    // if more than half of the rows are expanded, collapse them
    if (expandedRowIds.size > questions.length / 2) {
      setExpandedRowIds(new Set());
    } else {
      setExpandedRowIds(new Set(questions.map((q) => q.n)));
    }
  };

  const addIncorrectToReview = () => {
    const incorrect = questions.filter(
      (q) => q.points.earned < q.points.possible,
    );
    setReviewSheet((prev) => new Set([...prev, ...incorrect.map((q) => q.n)]));
  };

  const clearReview = () => setReviewSheet(new Set());

  const numberOfIncorrect = questions.filter(
    (q) => q.points.earned < q.points.possible,
  ).length;

  return (
    <Card className="px-0 py-0 rounded-none overflow-visible">
      <div className="sticky top-0 z-10 bg-background border-b">
        <CardHeader className="py-6">
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          {isExpandMode && (
            <CardAction>
              <Button variant="outline" size="sm" onClick={toggleAllRows}>
                Toggle All
              </Button>
            </CardAction>
          )}
        </CardHeader>
        <div className={cn("gap-3 px-6 py-2 border-t flex justify-between")}>
          <Button
            variant="ghost"
            nativeButton={false}
            disabled={reviewSheet.size === 0}
            className="-ml-3.5 text-foreground"
            render={<Link href={`/tests/${slug}/review`} />}
          >
            <IconClipboard />
            <span className="font-medium truncate">Review sheet</span>

            <span className="text-xs text-muted-foreground tabular-nums truncate">
              {reviewSheet.size} item
              <span className={cn(reviewSheet.size === 1 ? "invisible" : "")}>
                s
              </span>
            </span>
            <IconArrowRight className="text-muted-foreground/75" />
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="xs"
              onClick={clearReview}
              disabled={reviewSheet.size === 0}
            >
              <IconX />
              Clear
            </Button>
            <Button
              variant="secondary"
              size="xs"
              onClick={addIncorrectToReview}
            >
              <IconClipboardPlus />
              Add {numberOfIncorrect} Incorrect
            </Button>
          </div>
        </div>
      </div>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {isExpandMode && <TableHead />}
              <TableHead>Review</TableHead>
              <TableHead className="w-full">Question</TableHead>
              <TableHead>Standards</TableHead>
              <TableHead>Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((q, i) => (
              <QuestionTableRow
                key={q.n}
                question={q}
                standards={standards}
                isExpanded={expandedRowIds.has(q.n)}
                isMarked={reviewSheet.has(q.n)}
                onToggleMark={() => toggleInReviewSheet(q.n)}
                // SHARED-SELECTION: pass `isSelected={i === poppedIndex}` here
                // (and accept it on QuestionTableRow) to render a highlight on
                // the row that's currently open in the sheet.
                onActivate={() => activateRow(q, i)}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
      {isPopMode && (
        // SHARED-SELECTION: the sheet already takes the selection as props;
        // when the state is lifted, just forward the lifted value/setter here
        // (or pull them from the same context/store).
        <QuestionSheet
          questions={questions}
          activeIndex={poppedIndex}
          onIndexChange={setPoppedIndex}
        />
      )}
    </Card>
  );
}

// SHARED-SELECTION: add an `isSelected: boolean` prop here and use it below
// to apply a "selected" style on the row (e.g. a `data-selected` attribute or
// extra classes on <TableRow>). Also consider setting `aria-current="true"`
// on the selected row for a11y.
function QuestionTableRow({
  question: q,
  standards,
  isExpanded,
  isMarked,
  onToggleMark,
  onActivate,
}: {
  question: Question;
  standards?: Record<string, string>;
  isExpanded: boolean;
  isMarked: boolean;
  onToggleMark: () => void;
  onActivate: () => void;
}) {
  const expanded = isExpandMode && isExpanded;
  const colCount = isExpandMode ? 4 : 3;

  const handleMarkClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onToggleMark();
  };

  return (
    <React.Fragment>
      <TableRow
        onClick={isInteractive ? onActivate : undefined}
        onKeyDown={
          isInteractive
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onActivate();
                }
              }
            : undefined
        }
        role={isInteractive ? "button" : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        aria-expanded={isExpandMode ? expanded : undefined}
        aria-haspopup={isPopMode ? "dialog" : undefined}
        aria-controls={isExpandMode ? `question-${q.n}-details` : undefined}
        className={cn(
          "hover:bg-transparent",
          isInteractive &&
            "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isExpandMode && "border-b-0",
        )}
      >
        {isExpandMode && (
          <TableCell className="pr-0">
            <Button variant="ghost" size="icon" tabIndex={-1}>
              <IconChevronRight
                className={cn(
                  "size-4 transition-transform duration-200 ease-in-out reduce-motion:transition-none",
                  expanded ? "rotate-90" : "",
                )}
              />
            </Button>
          </TableCell>
        )}
        <TableCell>
          <Button
            variant="ghost"
            className={cn(
              "bg-muted rounded-lg",
              // isMarked && "text-primary hover:text-primary",

              // filled blue style
              // isMarked &&
              //   "text-primary-foreground bg-primary hover:bg-primary hover:text-primary-foreground",

              // filled black style
              isMarked &&
                "text-background bg-foreground hover:bg-foreground hover:text-background",
            )}
            size="icon"
            aria-pressed={isMarked}
            onClick={handleMarkClick}
          >
            {isMarked ? (
              <IconClipboardCheckFilled className="size-4.5" />
            ) : (
              <IconClipboardPlus className="size-4.5 text-muted-foreground" />
            )}
          </Button>
        </TableCell>
        <TableCell className="max-w-0 whitespace-normal">
          <div className="flex items-center w-full">
            <div className="font-semibold">{q.n}</div>
            <div
              className="text-xs text-muted-foreground overflow-hidden whitespace-nowrap min-w-0 flex-1 px-3"
              style={{
                maskImage:
                  "linear-gradient(to right, black calc(100% - 40px), transparent)",
                WebkitMaskImage:
                  "linear-gradient(to right, black calc(100% - 40px), transparent)",
              }}
            >
              <QuestionPreview prompt={q.prompt} />
            </div>
          </div>
        </TableCell>
        <TableCell>
          <StandardsBadge standards={q.standards} descriptions={standards} />
        </TableCell>
        <TableCell>
          <PointsBadge earned={q.points.earned} possible={q.points.possible} />
        </TableCell>
      </TableRow>
      {isExpandMode && (
        <TableRow aria-hidden={!expanded} className="hover:bg-transparent">
          <TableCell colSpan={colCount} className="p-0">
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  key="expanded"
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <div
                    id={`question-${q.n}-details`}
                    role="region"
                    aria-label={`Question ${q.n} details`}
                    className="p-3"
                  >
                    <QuestionCard question={q} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
}

function QuestionPreview({ prompt }: { prompt: Block[] }) {
  const paragraphs = prompt.filter((b) => b.type === "paragraph");
  return (
    <>
      {paragraphs.map((block, blockIdx) => (
        <React.Fragment key={blockIdx}>
          {blockIdx > 0 && " "}
          {block.content.map((inline, inlineIdx) =>
            inline.type === "text" ? (
              <React.Fragment key={inlineIdx}>{inline.text}</React.Fragment>
            ) : (
              <span
                key={inlineIdx}
                className="inline-block align-bottom h-[1.1lh] rounded-[4px] border border-muted-foreground/15 bg-accent-foreground w-8"
              ></span>
            ),
          )}
        </React.Fragment>
      ))}
    </>
  );
}
