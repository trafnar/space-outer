"use client";

import { useEffect, useRef, useState } from "react";
import type { Question } from "@/data/types";
import { QuestionCard } from "./QuestionCard";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

const isTextEntryTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
};

export function QuestionDialog({
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
    <Dialog
      open={activeIndex !== null}
      onOpenChange={(open) => {
        if (!open) onIndexChange(null);
      }}
    >
      <DialogContent className="top-12 translate-y-0 sm:max-w-2xl max-h-[calc(100vh-6rem)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <DialogHeader className="gap-0">
          <div className="flex items-center gap-0 -ml-1 text-muted-foreground">
            <Button
              variant="link"
              size="xs"
              className="text-muted-foreground px-1"
              onClick={() => displayed && goToQuestion(displayed.index - 1)}
              disabled={!displayed || displayed.index === 0}
            >
              Previous
            </Button>
            <Button
              variant="link"
              size="xs"
              className="text-muted-foreground px-1"
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
