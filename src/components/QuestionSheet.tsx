"use client";

import { useEffect } from "react";
import type { Question } from "@/data/types";
import { QuestionCard } from "./QuestionCard";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

export function QuestionSheet({
  questions,
  activeIndex,
  onIndexChange,
}: {
  questions: Question[];
  activeIndex: number | null;
  onIndexChange: (index: number | null) => void;
}) {
  const activeQuestion =
    activeIndex !== null ? (questions[activeIndex] ?? null) : null;

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) onIndexChange(index);
  };

  useEffect(() => {
    if (activeIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && activeIndex > 0) {
        e.preventDefault();
        onIndexChange(activeIndex - 1);
      } else if (e.key === "ArrowRight" && activeIndex < questions.length - 1) {
        e.preventDefault();
        onIndexChange(activeIndex + 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeIndex, questions.length, onIndexChange]);

  return (
    <Sheet
      open={activeIndex !== null}
      onOpenChange={(open) => {
        if (!open) onIndexChange(null);
      }}
      modal={false}
    >
      <SheetContent
        side="right"
        className="sm:max-w-lg data-[side=right]:sm:max-w-lg"
      >
        <SheetHeader>
          <SheetTitle>Question {activeQuestion?.n}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6">
          {activeQuestion && <QuestionCard question={activeQuestion} />}
        </div>
        <SheetFooter className="flex-row items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              activeIndex !== null && goToQuestion(activeIndex - 1)
            }
            disabled={activeIndex === null || activeIndex === 0}
          >
            <IconChevronLeft />
            Previous
          </Button>
          <div className="text-xs text-muted-foreground tabular-nums">
            {activeIndex !== null ? activeIndex + 1 : 0} of {questions.length}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              activeIndex !== null && goToQuestion(activeIndex + 1)
            }
            disabled={
              activeIndex === null || activeIndex === questions.length - 1
            }
          >
            Next
            <IconChevronRight />
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
