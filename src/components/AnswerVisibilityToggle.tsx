"use client";

import { Button } from "./ui/button";
import { IconEye, IconEyeClosed } from "@tabler/icons-react";
import { useAnswerVisibility } from "@/lib/settings";
import type { ComponentProps } from "react";

export function AnswerVisibilityToggle({
  size = "xs",
}: {
  size?: ComponentProps<typeof Button>["size"];
}) {
  const {
    showUserAnswer,
    showCorrectAnswer,
    setShowUserAnswer,
    setShowCorrectAnswer,
  } = useAnswerVisibility();
  const showing = showUserAnswer || showCorrectAnswer;

  return (
    <button
      onClick={() => {
        const next = !showing;
        setShowUserAnswer(next);
        setShowCorrectAnswer(next);
      }}
      className="h-full px-1 group/pad bg-debug-red"
      aria-label={showing ? "Hide answers" : "Show answers"}
    >
      <Button variant="outline" nativeButton={false} render={<div />} size={size}>
        {showing ? (
          <IconEye data-icon="inline-start" />
        ) : (
          <IconEyeClosed data-icon="inline-start" />
        )}
        Answers
      </Button>
    </button>
  );
}
