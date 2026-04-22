"use client";

import { Toggle } from "./ui/toggle";
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
    <Toggle
      variant="ghost"
      size="xs"
      pressed={showing}
      onPressedChange={(next) => {
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
    </Toggle>
  );
}
