"use client";

import type {
  Block,
  Choice,
  Inline,
  Manifest,
  Question,
  Response,
} from "@/data/types";

export function TestsClient({
  manifest,
  questions,
}: {
  manifest: Manifest;
  questions: Question[];
}) {
  return (
    <div className="mx-auto max-w-4xl p-6 flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-heading font-bold">{manifest.title}</h1>
      </header>

      <div>
        Score: {manifest.score.earned}/{manifest.score.possible} (
        {manifest.score.percent}%)
      </div>

      {questions.map((q) => (
        <QuestionCard key={q.n} question={q} />
      ))}
    </div>
  );
}

function QuestionCard({ question }: { question: Question }) {
  return (
    <article className="border p-4 flex flex-col gap-3">
      <div className="flex justify-between">
        <h2 className="font-semibold">Question {question.n}</h2>
        <span>
          {question.points.earned} / {question.points.possible}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {question.prompt.map((block, i) => (
          <BlockView
            key={i}
            block={block}
            response={question.userResponse}
            correct={question.correct}
          />
        ))}
      </div>

      <ResponseSummary correct={question.correct} user={question.userResponse} />
    </article>
  );
}

function BlockView({
  block,
  response,
  correct,
}: {
  block: Block;
  response: Response;
  correct: Response;
}) {
  if (block.type === "paragraph") {
    return (
      <p>
        {block.content.map((inline, i) => (
          <InlineView
            key={i}
            inline={inline}
            response={response}
            correct={correct}
          />
        ))}
      </p>
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
      />
    );
  }
  return null;
}

function InlineView({
  inline,
  response,
  correct,
}: {
  inline: Inline;
  response: Response;
  correct: Response;
}) {
  if (inline.type === "text") return <>{inline.text}</>;
  if (inline.type === "blank")
    return <BlankView id={inline.id} response={response} correct={correct} />;
  return null;
}

function BlankView({
  id,
  response,
  correct,
}: {
  id: string;
  response: Response;
  correct: Response;
}) {
  const userVal =
    response.type === "fillIn" ? response.values[id] : undefined;
  const correctVal =
    correct.type === "fillIn" ? correct.values[id] : undefined;
  const isRight = userVal === correctVal;

  return (
    <span
      className={`inline-block min-w-[2.5ch] px-1 mx-0.5 border-b-2 text-center ${
        isRight
          ? "border-green-600 text-green-700"
          : "border-red-600 text-red-700 line-through"
      }`}
    >
      {userVal ?? " "}
    </span>
  );
}

function ChoicesView({
  options,
  response,
  correct,
}: {
  options: Choice[];
  response: Response;
  correct: Response;
}) {
  const userId = response.type === "choice" ? response.choiceId : null;
  const correctId = correct.type === "choice" ? correct.choiceId : null;

  return (
    <ul className="flex flex-col gap-1">
      {options.map((opt) => {
        const picked = opt.id === userId;
        const isCorrect = opt.id === correctId;
        return (
          <li
            key={opt.id}
            className={`flex items-center gap-2 ${
              isCorrect ? "text-green-700 font-medium" : ""
            } ${picked && !isCorrect ? "text-red-700 line-through" : ""}`}
          >
            <span aria-hidden>{picked ? "●" : "○"}</span>
            <span>{opt.text}</span>
          </li>
        );
      })}
    </ul>
  );
}

function ResponseSummary({
  correct,
  user,
}: {
  correct: Response;
  user: Response;
}) {
  return (
    <div className="text-sm grid grid-cols-2 gap-4 pt-2 border-t">
      <div>
        <div className="opacity-60 text-xs uppercase tracking-wide">
          Correct
        </div>
        <div>{formatResponse(correct)}</div>
      </div>
      <div>
        <div className="opacity-60 text-xs uppercase tracking-wide">You</div>
        <div>{formatResponse(user)}</div>
      </div>
    </div>
  );
}

function formatResponse(r: Response): string {
  if (r.type === "choice") return r.choiceId;
  return Object.entries(r.values)
    .map(([k, v]) => (k === "answer" ? v : `${k}=${v}`))
    .join(", ");
}
