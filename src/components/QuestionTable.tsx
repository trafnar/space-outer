"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Question } from "@/data/types";
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
import { IconChevronRight } from "@tabler/icons-react";

type RowAction = "expand" | "pop" | "none";
const rowAction = "none" as RowAction;
const isExpandMode = rowAction === "expand";

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

  const toggleRow = (n: number) => {
    setExpandedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };

  const toggleAllRows = () => {
    // if more than half of the rows are expanded, collapse them
    if (expandedRowIds.size > questions.length / 2) {
      setExpandedRowIds(new Set());
    } else {
      setExpandedRowIds(new Set(questions.map((q) => q.n)));
    }
  };

  return (
    <Card className="px-0">
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
            {questions.map((q) => (
              <QuestionTableRow
                key={q.n}
                question={q}
                standards={standards}
                isExpanded={expandedRowIds.has(q.n)}
                onToggle={() => toggleRow(q.n)}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function QuestionTableRow({
  question: q,
  standards,
  isExpanded,
  onToggle,
}: {
  question: Question;
  standards?: Record<string, string>;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const expanded = isExpandMode && isExpanded;
  const colCount = isExpandMode ? 4 : 3;

  return (
    <React.Fragment>
      <TableRow
        onClick={isExpandMode ? onToggle : undefined}
        onKeyDown={
          isExpandMode
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggle();
                }
              }
            : undefined
        }
        role={isExpandMode ? "button" : undefined}
        tabIndex={isExpandMode ? 0 : undefined}
        aria-expanded={isExpandMode ? expanded : undefined}
        aria-controls={isExpandMode ? `question-${q.n}-details` : undefined}
        className={cn(
          "hover:bg-transparent",
          isExpandMode &&
            "cursor-pointer border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        {isExpandMode && (
          <TableCell>
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
              {q.questionText}
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
