"use client";

import type { Block, Choice, Inline, Question, Response } from "@/data/types";
import { TypoLarge } from "./ui/typo";
import { IconCircle, IconCircleCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useAnswerVisibility } from "@/lib/settings";

export function QuestionCard({ question }: { question: Question }) {
  const { showUserAnswer, showCorrectAnswer } = useAnswerVisibility();

  return (
    <div className="flex flex-col gap-2">
      {question.prompt.map((block, i) => (
        <BlockView
          key={i}
          block={block}
          response={question.userResponse}
          correct={question.correct}
          showUserAnswer={showUserAnswer}
          showCorrectAnswer={showCorrectAnswer}
        />
      ))}
    </div>
  );
}

function BlockView({
  block,
  response,
  correct,
  showUserAnswer,
  showCorrectAnswer,
}: {
  block: Block;
  response: Response;
  correct: Response;
  showUserAnswer: boolean;
  showCorrectAnswer: boolean;
}) {
  if (block.type === "paragraph") {
    return (
      <TypoLarge>
        {block.content.map((inline, i) => (
          <InlineView
            key={i}
            inline={inline}
            response={response}
            correct={correct}
            showUserAnswer={showUserAnswer}
            showCorrectAnswer={showCorrectAnswer}
          />
        ))}
      </TypoLarge>
    );
  }
  if (block.type === "diagram") {
    return block.svg ? (
      <div
        aria-label={block.alt}
        role="img"
        className="my-2"
        dangerouslySetInnerHTML={{ __html: block.svg }}
      />
    ) : null;
  }
  if (block.type === "choices") {
    return (
      <ChoicesView
        options={block.options}
        response={response}
        correct={correct}
        showUserAnswer={showUserAnswer}
        showCorrectAnswer={showCorrectAnswer}
      />
    );
  }
  return null;
}

function InlineView({
  inline,
  response,
  correct,
  showUserAnswer,
  showCorrectAnswer,
}: {
  inline: Inline;
  response: Response;
  correct: Response;
  showUserAnswer: boolean;
  showCorrectAnswer: boolean;
}) {
  if (inline.type === "text") return <>{inline.text}</>;
  if (inline.type === "blank")
    return (
      <BlankView
        id={inline.id}
        response={response}
        correct={correct}
        showUserAnswer={showUserAnswer}
        showCorrectAnswer={showCorrectAnswer}
      />
    );
  return null;
}

function BlankView({
  id,
  response,
  correct,
  showUserAnswer,
  showCorrectAnswer,
}: {
  id: string;
  response: Response;
  correct: Response;
  showUserAnswer: boolean;
  showCorrectAnswer: boolean;
}) {
  const userVal = response.type === "fillIn" ? response.values[id] : undefined;
  const correctVal = correct.type === "fillIn" ? correct.values[id] : undefined;
  const isRight = userVal === correctVal;
  const showIndicator = showUserAnswer && showCorrectAnswer;

  return (
    <span
      className={cn(
        "inline-block min-w-[2.5ch] px-1 mx-0.5 border-b-2 text-center",
        showIndicator
          ? isRight
            ? "border-correct-green text-correct-green"
            : "border-wrong-red text-wrong-red line-through"
          : "border-muted-foreground/40",
      )}
    >
      {showUserAnswer ? (userVal ?? " ") : " "}
    </span>
  );
}

function ChoicesView({
  options,
  response,
  correct,
  showUserAnswer,
  showCorrectAnswer,
}: {
  options: Choice[];
  response: Response;
  correct: Response;
  showUserAnswer: boolean;
  showCorrectAnswer: boolean;
}) {
  const userId = response.type === "choice" ? response.choiceId : null;
  const correctId = correct.type === "choice" ? correct.choiceId : null;

  return (
    <ul className="flex flex-col gap-1">
      {options.map((opt) => {
        const picked = opt.id === userId;
        const isCorrect = opt.id === correctId;
        const showPicked = showUserAnswer && picked;
        return (
          <li
            key={opt.id}
            className={cn(
              "flex items-center gap-2",
              showCorrectAnswer && isCorrect && "text-correct-green",
              showUserAnswer &&
                showCorrectAnswer &&
                picked &&
                !isCorrect &&
                "text-wrong-red line-through",
            )}
          >
            <span aria-hidden>
              {showPicked ? <IconCircleCheck /> : <IconCircle />}
            </span>
            <span>{opt.text}</span>
          </li>
        );
      })}
    </ul>
  );
}
