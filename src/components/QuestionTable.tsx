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
import { IconChevronRight } from "@tabler/icons-react";

export function QuestionTable({ questions }: { questions: Question[] }) {
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
        <CardAction>
          <Button variant="outline" size="sm" onClick={toggleAllRows}>
            Toggle All
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead />
              <TableHead>Question</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Standards</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((q) => {
              const correct = q.points.earned === q.points.possible;
              const isExpanded = expandedRowIds.has(q.n);
              return (
                <React.Fragment key={q.n}>
                  <TableRow
                    onClick={() => toggleRow(q.n)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleRow(q.n);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    aria-controls={`question-${q.n}-details`}
                    className={cn(
                      "cursor-pointer border-b-0 hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    )}
                    // data-state={isExpanded ? "selected" : undefined}
                  >
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <IconChevronRight
                          className={cn(
                            "size-4 transition-transform duration-200 ease-in-out reduce-motion:transition-none",
                            isExpanded ? "rotate-90" : "",
                          )}
                        />
                      </Button>
                    </TableCell>
                    <TableCell>{q.n}</TableCell>
                    <TableCell>
                      <div
                        className={cn(
                          "rounded-full ring ring-white font-semibold tabular-nums text-xs flex items-center justify-center py-0.5 px-2 max-w-fit",
                          correct
                            ? "bg-[#EBF7ED] text-[#4CC06B]"
                            : "bg-[#FCEDEF] text-[#EC6353]",
                        )}
                      >
                        {q.points.earned}{" "}
                        <span className="opacity-75 mx-0.5">/</span>
                        {q.points.possible}
                      </div>
                    </TableCell>
                    <TableCell>{q.standards.join(", ")}</TableCell>
                  </TableRow>
                  <TableRow
                    aria-hidden={!isExpanded}
                    className="hover:bg-transparent"
                  >
                    <TableCell colSpan={4} className="p-0">
                      <AnimatePresence initial={false}>
                        {isExpanded && (
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
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
