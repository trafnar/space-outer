import React from "react";
import type { Block } from "@/data/types";

export function QuestionPreview({ prompt }: { prompt: Block[] }) {
  const paragraphs = prompt.filter((b) => b.type === "paragraph");
  return (
    <>
      {paragraphs.map((block, blockIdx) => (
        <React.Fragment key={blockIdx}>
          {blockIdx > 0 && " "}
          {block.content.map((inline, inlineIdx) =>
            inline.type === "text" ? (
              <React.Fragment key={inlineIdx}>{inline.text}</React.Fragment>
            ) : (
              <span
                key={inlineIdx}
                className="inline-block align-bottom h-[1.1lh] border-b border-muted-foreground/25 w-8"
              ></span>
            ),
          )}
        </React.Fragment>
      ))}
    </>
  );
}
