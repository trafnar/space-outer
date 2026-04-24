"use client";

import { useState } from "react";
import type { ViewQuestion } from "@/lib/testViewData";
import { QuestionCard } from "./QuestionCard";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

export function QuestionDialog({
  questions,
  selectedIndex,
  onSelectedIndexChange,
  open,
  onOpenChange,
}: {
  questions: ViewQuestion[];
  selectedIndex: number | null;
  onSelectedIndexChange: (index: number) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const activeQuestion =
    selectedIndex !== null ? (questions[selectedIndex] ?? null) : null;

  // Cache the last-shown question so the dialog doesn't blank out while
  // animating closed.
  type Displayed = { question: ViewQuestion; index: number };
  const [displayed, setDisplayed] = useState<Displayed | null>(() =>
    activeQuestion !== null && selectedIndex !== null
      ? { question: activeQuestion, index: selectedIndex }
      : null,
  );
  if (
    activeQuestion !== null &&
    selectedIndex !== null &&
    (displayed?.index !== selectedIndex ||
      displayed?.question !== activeQuestion)
  ) {
    setDisplayed({ question: activeQuestion, index: selectedIndex });
  }

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) onSelectedIndexChange(index);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[20%] translate-y-0 sm:max-w-2xl max-h-[calc(100vh-40%)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <DialogHeader className="gap-0">
          <div className="flex items-center gap-0 -ml-1">
            <Button
              variant="link"
              size="xs"
              onClick={() => displayed && goToQuestion(displayed.index - 1)}
              disabled={!displayed || displayed.index === 0}
            >
              Previous
            </Button>
            <Button
              variant="link"
              size="xs"
              onClick={() => displayed && goToQuestion(displayed.index + 1)}
              disabled={!displayed || displayed.index === questions.length - 1}
            >
              Next
            </Button>
          </div>
          <DialogTitle>Question {displayed?.question.n}</DialogTitle>
        </DialogHeader>
        {displayed && <QuestionCard question={displayed.question} />}
      </DialogContent>
    </Dialog>
  );
}
