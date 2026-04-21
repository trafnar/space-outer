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
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { PointsBadge } from "./PointsBadge";
import { StandardsBadge } from "./StandardsBadge";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

type RowAction = "expand" | "pop" | "none";
const rowAction = "pop" as RowAction;
const isExpandMode = rowAction === "expand";
const isPopMode = rowAction === "pop";
const isInteractive = isExpandMode || isPopMode;

export function QuestionTable({
  questions,
  standards,
}: {
  questions: Question[];
  standards?: Record<string, string>;
}) {
  const [expandedRowIds, setExpandedRowIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [poppedIndex, setPoppedIndex] = useState<number | null>(null);
  const poppedQuestion =
    poppedIndex !== null ? (questions[poppedIndex] ?? null) : null;

  const toggleRow = (n: number) => {
    setExpandedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };

  const activateRow = (q: Question, index: number) => {
    if (isExpandMode) toggleRow(q.n);
    else if (isPopMode) setPoppedIndex(index);
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) setPoppedIndex(index);
  };

  useEffect(() => {
    if (poppedIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToQuestion(poppedIndex - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToQuestion(poppedIndex + 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poppedIndex, questions.length]);

  const toggleAllRows = () => {
    // if more than half of the rows are expanded, collapse them
    if (expandedRowIds.size > questions.length / 2) {
      setExpandedRowIds(new Set());
    } else {
      setExpandedRowIds(new Set(questions.map((q) => q.n)));
    }
  };

  return (
    <Card className="px-0 pb-0 rounded-md">
      <CardHeader>
        <CardTitle>Questions</CardTitle>
        {isExpandMode && (
          <CardAction>
            <Button variant="outline" size="sm" onClick={toggleAllRows}>
              Toggle All
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {isExpandMode && <TableHead />}
              <TableHead className="w-full">Question</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Standards</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((q, i) => (
              <QuestionTableRow
                key={q.n}
                question={q}
                standards={standards}
                isExpanded={expandedRowIds.has(q.n)}
                onActivate={() => activateRow(q, i)}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
      {isPopMode && (
        <Dialog
          open={poppedIndex !== null}
          onOpenChange={(open) => {
            if (!open) setPoppedIndex(null);
          }}
        >
          <DialogContent className="max-w-2xl sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Question {poppedQuestion?.n}</DialogTitle>
            </DialogHeader>
            {poppedQuestion && <QuestionCard question={poppedQuestion} />}
            <DialogFooter className="flex-row items-center justify-between sm:justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  poppedIndex !== null && goToQuestion(poppedIndex - 1)
                }
                disabled={poppedIndex === null || poppedIndex === 0}
              >
                <IconChevronLeft />
                Previous
              </Button>
              <div className="text-xs text-muted-foreground tabular-nums">
                {poppedIndex !== null ? poppedIndex + 1 : 0} of{" "}
                {questions.length}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  poppedIndex !== null && goToQuestion(poppedIndex + 1)
                }
                disabled={
                  poppedIndex === null || poppedIndex === questions.length - 1
                }
              >
                Next
                <IconChevronRight />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}

function QuestionTableRow({
  question: q,
  standards,
  isExpanded,
  onActivate,
}: {
  question: Question;
  standards?: Record<string, string>;
  isExpanded: boolean;
  onActivate: () => void;
}) {
  const expanded = isExpandMode && isExpanded;
  const colCount = isExpandMode ? 4 : 3;

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
          <PointsBadge earned={q.points.earned} possible={q.points.possible} />
        </TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {q.standards.map((s) => (
              <StandardsBadge
                key={s}
                standard={s}
                description={standards?.[s]}
              />
            ))}
          </div>
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
