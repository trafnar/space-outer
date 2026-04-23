"use client";

import { useEffect, useState } from "react";
import type { ViewQuestion } from "@/lib/testViewData";
import { QuestionCard } from "./QuestionCard";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";

export function QuestionSheet({
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

  // Cache the last-shown question so the sheet doesn't blank out while it
  // animates closed.
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

  // Manage outside-click dismissal ourselves. Base UI's built-in
  // outside-press / focus-out handlers can't distinguish "the click
  // landed on a row" from "the click landed anywhere else", so we
  // disable them below and run this detector instead.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const el = e.target instanceof Element ? e.target : null;
      if (!el) return;
      // Anywhere inside the sheet, the test-page header/toolbar, or
      // any open dropdown / dialog popup counts as "still interacting
      // with the page" — don't dismiss the sheet.
      if (
        el.closest(
          '[data-slot="sheet-content"],[data-row-index],[data-test-page-header],[data-slot="dropdown-menu-content"],[data-slot="dialog-content"],[data-slot="dialog-overlay"]',
        )
      )
        return;
      onOpenChange(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onOpenChange]);

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen, details) => {
        // Ignore Base UI's auto-dismiss on outside click / focus
        // change — the effect above handles dismissal explicitly so
        // clicking a row never triggers a close.
        if (!nextOpen) {
          const reason = details?.reason;
          if (reason === "outside-press" || reason === "focus-out") return;
        }
        onOpenChange(nextOpen);
      }}
      modal={false}
    >
      <SheetContent
        side="right"
        className="w-[clamp(25rem,50vw,32rem)] max-w-none data-[side=right]:w-[clamp(25rem,50vw,32rem)] data-[side=right]:max-w-none data-[side=right]:sm:max-w-none"
      >
        <SheetHeader>
          <SheetTitle>Question {displayed?.question.n}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6">
          {displayed && <QuestionCard question={displayed.question} />}
        </div>
        <SheetFooter className="flex-row items-center justify-between">
          <button
            onClick={() => displayed && goToQuestion(displayed.index - 1)}
            disabled={!displayed || displayed.index === 0}
            className="py-1 -my-1 px-2 -mx-2 group/pad bg-debug-red disabled:pointer-events-none disabled:opacity-50"
            aria-label="Previous question"
          >
            <Button
              variant="link"
              size="xs"
              nativeButton={false}
              render={<div />}
            >
              Previous
            </Button>
          </button>
          <div className="text-xs text-muted-foreground tabular-nums">
            {displayed ? displayed.index + 1 : 0} of {questions.length}
          </div>
          <button
            onClick={() => displayed && goToQuestion(displayed.index + 1)}
            disabled={!displayed || displayed.index === questions.length - 1}
            className="py-1 -my-1 px-2 -mr-2 group/pad bg-debug-red disabled:pointer-events-none disabled:opacity-50"
            aria-label="Next question"
          >
            <Button
              variant="link"
              size="xs"
              nativeButton={false}
              render={<div />}
            >
              Next
            </Button>
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
