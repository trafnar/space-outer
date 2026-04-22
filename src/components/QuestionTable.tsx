"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import type { Question } from "@/data/types";
import { QuestionCard } from "./QuestionCard";
import React, { useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { PointsBadge } from "./PointsBadge";
import { StandardsBadge } from "./StandardsBadge";
import { QuestionSheet } from "./QuestionSheet";
import { QuestionDialog } from "./QuestionDialog";
import { useReviewSheet } from "@/lib/reviewSheet";
import { useRowAction } from "@/lib/settings";
import { TestPageHeader } from "./QuestionTableHeader";
import { ExpandChevron } from "./ExpandChevron";
import { QuestionPreview } from "./QuestionPreview";
import {
  IconClipboardCheckFilled,
  IconClipboardPlus,
} from "@tabler/icons-react";

// Height of the sticky card-header wrapper. Used both as its fixed
// height and as the top offset for the sticky thead so they line up.
const stickyHeaderHeight = 96;

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
  const [rowAction] = useRowAction();
  const isExpandMode = rowAction === "expand";
  const isPopMode = rowAction === "pop";
  const isSheetMode = rowAction === "sheet";
  const isInteractive = isExpandMode || isPopMode || isSheetMode;
  const [expandedRowIds, setExpandedRowIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [reviewSheet, setReviewSheet] = useReviewSheet(slug);
  // SHARED-SELECTION: this is the source of truth for the "active" row.
  // To lift it, replace this useState with `selectedIndex` / `onSelectedIndexChange`
  // props (or a context/store hook) and remove this local state.
  const [poppedIndex, setPoppedIndex] = useState<number | null>(null);

  const { scrollY } = useScroll();
  const shadowAlpha = useTransform(scrollY, [0, 10], [0, 0.08], {
    clamp: true,
  });
  const headerBoxShadow = useMotionTemplate`0 1px 5px 0 rgba(0, 0, 0, ${shadowAlpha})`;

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
    else if (isPopMode || isSheetMode) setPoppedIndex(index);
  };

  const toggleAllWillCollapse = expandedRowIds.size > questions.length / 2;
  const toggleAllRows = () => {
    if (toggleAllWillCollapse) {
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
    <div>
      <TestPageHeader
        title={title}
        slug={slug}
        reviewSize={reviewSheet.size}
        numberOfIncorrect={numberOfIncorrect}
        onAddIncorrect={addIncorrectToReview}
        onClearReview={clearReview}
        height={stickyHeaderHeight}
      />
      <Table>
        <motion.thead
          data-slot="table-header"
          className="[&_tr]:border-b sticky bg-background z-10"
          style={{ top: stickyHeaderHeight, boxShadow: headerBoxShadow }}
        >
          <TableRow className="hover:bg-transparent">
            {isExpandMode && (
              <TableHead className="pr-0">
                <ExpandChevron
                  expanded={toggleAllWillCollapse}
                  onClick={toggleAllRows}
                  aria-label={
                    toggleAllWillCollapse ? "Collapse all" : "Expand all"
                  }
                />
              </TableHead>
            )}
            <TableHead>Add</TableHead>
            <TableHead className="w-full">Question</TableHead>
            <TableHead>Points</TableHead>
          </TableRow>
        </motion.thead>
        <TableBody>
          {questions.map((q, i) => (
            <QuestionTableRow
              key={q.n}
              question={q}
              standards={standards}
              isExpanded={expandedRowIds.has(q.n)}
              isMarked={reviewSheet.has(q.n)}
              isExpandMode={isExpandMode}
              isPopMode={isPopMode}
              isInteractive={isInteractive}
              onToggleMark={() => toggleInReviewSheet(q.n)}
              // SHARED-SELECTION: pass `isSelected={i === poppedIndex}` here
              // (and accept it on QuestionTableRow) to render a highlight on
              // the row that's currently open in the sheet.
              onActivate={() => activateRow(q, i)}
            />
          ))}
        </TableBody>
      </Table>
      {isSheetMode && (
        // SHARED-SELECTION: the sheet already takes the selection as props;
        // when the state is lifted, just forward the lifted value/setter here
        // (or pull them from the same context/store).
        <QuestionSheet
          questions={questions}
          activeIndex={poppedIndex}
          onIndexChange={setPoppedIndex}
        />
      )}
      {isPopMode && (
        <QuestionDialog
          questions={questions}
          activeIndex={poppedIndex}
          onIndexChange={setPoppedIndex}
        />
      )}
    </div>
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
  isExpandMode,
  isPopMode,
  isInteractive,
  onToggleMark,
  onActivate,
}: {
  question: Question;
  standards?: Record<string, string>;
  isExpanded: boolean;
  isMarked: boolean;
  isExpandMode: boolean;
  isPopMode: boolean;
  isInteractive: boolean;
  onToggleMark: () => void;
  onActivate: () => void;
}) {
  const expanded = isExpandMode && isExpanded;
  const colCount = isExpandMode ? 5 : 4;

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
            <ExpandChevron expanded={expanded} tabIndex={-1} aria-hidden />
          </TableCell>
        )}
        <TableCell>
          <Button
            variant={isMarked ? "default" : "secondary"}
            // className={cn(
            //   "text-muted-foreground hover:text-foreground",
            //   isMarked &&
            //     "text-background bg-foreground hover:bg-foreground hover:text-background",
            // )}
            size="icon-sm"
            aria-pressed={isMarked}
            aria-label={
              isMarked ? "Remove from review sheet" : "Add to review sheet"
            }
            onClick={handleMarkClick}
          >
            {isMarked ? (
              <IconClipboardCheckFilled className="size-4.5" />
            ) : (
              <IconClipboardPlus className="size-4.5" />
            )}
          </Button>
        </TableCell>
        <TableCell className="max-w-0 whitespace-normal">
          <div className="flex items-center w-full">
            <div className="font-semibold tabular-nums text-xs ">
              <span className="opacity-45 pr-0.5 font-light">#</span>
              {q.n}
            </div>
            <div
              className={cn(
                "text-xs text-muted-foreground overflow-hidden whitespace-nowrap min-w-0 flex-1 px-3",
                "transition-opacity duration-200 ease-in-out reduce-motion:transition-none",
                isExpandMode && isExpanded && "opacity-0",
              )}
              style={{
                maskImage:
                  "linear-gradient(to right, black calc(100% - 40px), transparent)",
                WebkitMaskImage:
                  "linear-gradient(to right, black calc(100% - 40px), transparent)",
              }}
            >
              <QuestionPreview prompt={q.prompt} />
            </div>
            <div className="-mr-2">
              <StandardsBadge
                standards={q.standards}
                descriptions={standards}
              />
            </div>
          </div>
        </TableCell>
        <TableCell>
          {/* adjust for alignment with other text in cells */}
          <div className="flex justify-center">
            <PointsBadge
              earned={q.points.earned}
              possible={q.points.possible}
            />
          </div>
        </TableCell>
      </TableRow>
      {isExpandMode && (
        <TableRow
          aria-hidden={!expanded}
          className="hover:bg-transparent h-auto"
        >
          <TableCell
            colSpan={colCount}
            className="p-0 whitespace-normal h-auto!"
          >
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
                    className="px-1.5 pt-1 pb-6"
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
