"use client";

import { useEffect, useRef } from "react";
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

const isTextEntryTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
};

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

  // Keep latest values in a ref so the keydown listener stays stable for the
  // lifetime of the sheet being open and never misses events between renders.
  const stateRef = useRef({ activeIndex, total: questions.length, onIndexChange });
  useEffect(() => {
    stateRef.current = { activeIndex, total: questions.length, onIndexChange };
  });

  const isOpen = activeIndex !== null;
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTextEntryTarget(e.target)) return;
      const { activeIndex: idx, total, onIndexChange: cb } = stateRef.current;
      if (idx === null) return;
      if (e.key === "ArrowLeft" && idx > 0) {
        e.preventDefault();
        cb(idx - 1);
      } else if (e.key === "ArrowRight" && idx < total - 1) {
        e.preventDefault();
        cb(idx + 1);
      }
    };
    window.addEventListener("keydown", handler, { capture: true });
    return () =>
      window.removeEventListener("keydown", handler, { capture: true });
  }, [isOpen]);

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
