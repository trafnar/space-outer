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
import { Badge } from "./ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { IconChevronRight } from "@tabler/icons-react";

export function QuestionTable({
  questions,
  standards,
}: {
  questions: Question[];
  standards?: Record<string, string>;
}) {
  type RowAction = "expand" | "pop" | "none";
  const rowAction = "none" as RowAction;
  const isExpandMode = rowAction === "expand";

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
              <TableHead>Question</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Standards</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((q) => {
              const correct = q.points.earned === q.points.possible;
              const isExpanded = isExpandMode && expandedRowIds.has(q.n);
              const colCount = isExpandMode ? 4 : 3;
              return (
                <React.Fragment key={q.n}>
                  <TableRow
                    onClick={isExpandMode ? () => toggleRow(q.n) : undefined}
                    onKeyDown={
                      isExpandMode
                        ? (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              toggleRow(q.n);
                            }
                          }
                        : undefined
                    }
                    role={isExpandMode ? "button" : undefined}
                    tabIndex={isExpandMode ? 0 : undefined}
                    aria-expanded={isExpandMode ? isExpanded : undefined}
                    aria-controls={
                      isExpandMode ? `question-${q.n}-details` : undefined
                    }
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
                              isExpanded ? "rotate-90" : "",
                            )}
                          />
                        </Button>
                      </TableCell>
                    )}
                    <TableCell>{q.n}</TableCell>
                    <TableCell>
                      <Badge
                        variant={correct ? "green" : "red"}
                        className="font-semibold tabular-nums"
                      >
                        {q.points.earned}
                        <span className="opacity-75">/</span>
                        {q.points.possible}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {q.standards.map((s) => {
                          const description = standards?.[s];
                          if (!description) {
                            return (
                              <Badge
                                key={s}
                                variant="secondary"
                                className="uppercase"
                              >
                                {s}
                              </Badge>
                            );
                          }
                          return (
                            <HoverCard key={s}>
                              <HoverCardTrigger
                                delay={0}
                                closeDelay={0}
                                render={
                                  <Badge
                                    variant="secondary"
                                    className="uppercase cursor-default w-full max-w-18"
                                  >
                                    {s}
                                  </Badge>
                                }
                              />
                              <HoverCardContent
                                side="left"
                                className="leading-tight"
                              >
                                {description}
                              </HoverCardContent>
                            </HoverCard>
                          );
                        })}
                      </div>
                    </TableCell>
                  </TableRow>
                  {isExpandMode && (
                    <TableRow
                      aria-hidden={!isExpanded}
                      className="hover:bg-transparent"
                    >
                      <TableCell colSpan={colCount} className="p-0">
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              key="expanded"
                              initial={{ height: 0 }}
                              animate={{ height: "auto" }}
                              exit={{ height: 0 }}
                              transition={{
                                duration: 0.2,
                                ease: "easeInOut",
                              }}
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
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
