"use client";

import { useEffect, useRef, useState } from "react";
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

const isTextEntryTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
};

// SHARED-SELECTION: `activeIndex` / `onIndexChange` are intentionally a
// controlled pair so this component works whether the selection lives in
// QuestionTable's local state today or in a lifted store/context tomorrow.
// If you switch to a context/store, you can drop these props and read the
// value directly here (or keep them and just wire them to the store at the
// call site).
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

  // Cache the last open question so the sheet doesn't blank out while it
  // animates closed (after activeIndex becomes null). We update the cache
  // during render only when there's a new active question; on close we keep
  // showing the previous one until the sheet is fully unmounted.
  type Displayed = { question: Question; index: number };
  const [displayed, setDisplayed] = useState<Displayed | null>(() =>
    activeQuestion !== null && activeIndex !== null
      ? { question: activeQuestion, index: activeIndex }
      : null,
  );
  if (
    activeQuestion !== null &&
    activeIndex !== null &&
    (displayed?.index !== activeIndex || displayed?.question !== activeQuestion)
  ) {
    setDisplayed({ question: activeQuestion, index: activeIndex });
  }

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) onIndexChange(index);
  };

  // Keep latest values in a ref so the keydown listener stays stable for the
  // lifetime of the sheet being open and never misses events between renders.
  const stateRef = useRef({
    activeIndex,
    total: questions.length,
    onIndexChange,
  });
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
          <SheetTitle>Question {displayed?.question.n}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6">
          {displayed && <QuestionCard question={displayed.question} />}
        </div>
        <SheetFooter className="flex-row items-center justify-between">
          <Button
            variant="link"
            size="xs"
            onClick={() => displayed && goToQuestion(displayed.index - 1)}
            disabled={!displayed || displayed.index === 0}
          >
            Previous
          </Button>
          <div className="text-xs text-muted-foreground tabular-nums">
            {displayed ? displayed.index + 1 : 0} of {questions.length}
          </div>
          <Button
            variant="link"
            size="xs"
            onClick={() => displayed && goToQuestion(displayed.index + 1)}
            disabled={!displayed || displayed.index === questions.length - 1}
          >
            Next
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
