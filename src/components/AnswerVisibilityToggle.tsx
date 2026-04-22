"use client";

import { Button } from "./ui/button";
import { IconEye, IconEyeClosed } from "@tabler/icons-react";
import { useAnswerVisibility } from "@/lib/settings";

export function AnswerVisibilityToggle() {
  const {
    showUserAnswer,
    showCorrectAnswer,
    setShowUserAnswer,
    setShowCorrectAnswer,
  } = useAnswerVisibility();
  const showing = showUserAnswer || showCorrectAnswer;

  return (
    <Button
      variant="outline"
      size="xs"
      aria-label={showing ? "Hide answers" : "Show answers"}
      onClick={() => {
        const next = !showing;
        setShowUserAnswer(next);
        setShowCorrectAnswer(next);
      }}
    >
      {showing ? (
        <IconEye data-icon="inline-start" />
      ) : (
        <IconEyeClosed data-icon="inline-start" />
      )}
      Answers
    </Button>
  );
}
