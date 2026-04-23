"use client";

import type { Block, Choice, Inline, Question, Response } from "@/data/types";
import { TypoLarge } from "./ui/typo";
import { IconCircle, IconCircleCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useAnswerVisibility } from "@/lib/settings";

export function QuestionCard({ question }: { question: Question }) {
  const { showUserAnswer, showCorrectAnswer } = useAnswerVisibility();

  // Map of choices-block id -> options, so a blank with a matching id
  // can render the selected option's text in the sentence.
  const choicesById = new Map<string, Choice[]>();
  for (const block of question.prompt) {
    if (block.type === "choices") choicesById.set(block.id, block.options);
  }

  // Label bound blanks/choices with numbers (1, 2, 3, ...) in the
  // order blanks appear in the prompt. Standalone choices (no matching
  // blank) are not labeled.
  const labelById = new Map<string, string>();
  let labelIdx = 0;
  for (const block of question.prompt) {
    if (block.type !== "paragraph") continue;
    for (const inline of block.content) {
      if (
        inline.type === "blank" &&
        choicesById.has(inline.id) &&
        !labelById.has(inline.id)
      ) {
        labelById.set(inline.id, String(labelIdx + 1));
        labelIdx += 1;
      }
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {question.prompt.map((block, i) => (
        <BlockView
          key={i}
          block={block}
          response={question.userResponse}
          correct={question.correct}
          choicesById={choicesById}
          labelById={labelById}
          showUserAnswer={showUserAnswer}
          showCorrectAnswer={showCorrectAnswer}
        />
      ))}
    </div>
  );
}

const blankLabelClassName = cn(
  "text-[0.7em] text-muted-foreground font-bold font-heading inline-flex",
  "after:content-['.'] pl-0.5 pr-0.5",
  // "rounded-full",
  // "size-3 ring-1 ring-muted-foreground/40",
  // "items-center justify-center",
);

function BlockView({
  block,
  response,
  correct,
  choicesById,
  labelById,
  showUserAnswer,
  showCorrectAnswer,
}: {
  block: Block;
  response: Response;
  correct: Response;
  choicesById: Map<string, Choice[]>;
  labelById: Map<string, string>;
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
            choicesById={choicesById}
            labelById={labelById}
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
        id={block.id}
        options={block.options}
        multiple={block.multiple}
        response={response}
        correct={correct}
        label={labelById.get(block.id)}
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
  choicesById,
  labelById,
  showUserAnswer,
  showCorrectAnswer,
}: {
  inline: Inline;
  response: Response;
  correct: Response;
  choicesById: Map<string, Choice[]>;
  labelById: Map<string, string>;
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
        boundOptions={choicesById.get(inline.id)}
        label={labelById.get(inline.id)}
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
  boundOptions,
  label,
  showUserAnswer,
  showCorrectAnswer,
}: {
  id: string;
  response: Response;
  correct: Response;
  boundOptions?: Choice[];
  label?: string;
  showUserAnswer: boolean;
  showCorrectAnswer: boolean;
}) {
  const userVal = response.values[id];
  const correctVal = correct.values[id];
  const isRight = userVal !== undefined && userVal === correctVal;
  const showIndicator = showUserAnswer && showCorrectAnswer;

  // If the blank is bound to a choices block, resolve the choice id to
  // its visible text so the sentence reads naturally.
  const displayText = boundOptions
    ? (boundOptions.find((o) => o.id === userVal)?.text ?? userVal)
    : userVal;

  return (
    <span className="whitespace-nowrap">
      {label && <span className={blankLabelClassName}>{label}</span>}
      <span
        className={cn("inline-block min-w-[3.5ch] mx-0.5 text-center relative")}
      >
        {showUserAnswer ? (displayText ?? " ") : " "}
        <div
          className={cn(
            "w-full h-[2.5px] print:h-[1.5px] translate-y-px bg-current rounded-full",

            showIndicator
              ? isRight
                ? "border-correct-green text-correct-green"
                : "border-wrong-red text-wrong-red line-through"
              : "border-current",
          )}
        />
      </span>
    </span>
  );
}

function splitIds(v: string | undefined): Set<string> {
  if (!v) return new Set();
  return new Set(
    v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

function ChoicesView({
  id,
  options,
  multiple,
  response,
  correct,
  label,
  showUserAnswer,
  showCorrectAnswer,
}: {
  id: string;
  options: Choice[];
  multiple?: boolean;
  response: Response;
  correct: Response;
  label?: string;
  showUserAnswer: boolean;
  showCorrectAnswer: boolean;
}) {
  const userIds = multiple
    ? splitIds(response.values[id])
    : new Set([response.values[id]].filter(Boolean) as string[]);
  const correctIds = multiple
    ? splitIds(correct.values[id])
    : new Set([correct.values[id]].filter(Boolean) as string[]);

  return (
    <div className="flex flex-col gap-1">
      {label && <div className={blankLabelClassName}>{label}</div>}
      <ul className="flex flex-col gap-2">
        {options.map((opt) => {
          const picked = userIds.has(opt.id);
          const isCorrect = correctIds.has(opt.id);
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
              {opt.imageSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={opt.imageSrc}
                  alt={opt.text || `Option ${opt.id}`}
                  className="max-h-40"
                />
              ) : (
                <span>{opt.text}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
