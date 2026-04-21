"use client";

import type { Manifest, Question } from "@/data/types";

export function TestsClient({
  manifest,
  questions,
}: {
  manifest: Manifest;
  questions: Question[];
}) {
  return (
    <div className="mx-auto max-w-4xl p-6 flex flex-col gap-6">
      <header className="">
        <h1 className="text-2xl font-bold">{manifest.title}</h1>
      </header>

      <div>
        Score: {manifest.score.earned}/{manifest.score.possible} (
        {manifest.score.percent}%)
      </div>

      {questions.map((q) => (
        <article key={q.n} className="border p-4">
          <div className="mb-3 flex justify-between">
            <h2 className="font-semibold">Question {q.n}</h2>
            <span>
              {q.points.earned} / {q.points.possible}
            </span>
          </div>

          {q.parts.map((part, i) => (
            <div key={i}>
              {i > 0 && <hr className="my-2" />}
              <pre className="whitespace-pre-wrap text-xs">
                <strong>{part.role}:</strong>
                {"\n"}
                {part.innerHTML}
              </pre>
            </div>
          ))}
        </article>
      ))}
    </div>
  );
}
