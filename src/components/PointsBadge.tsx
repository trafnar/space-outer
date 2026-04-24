import type { ReactNode } from "react";
import {
  IconMoodAnnoyed,
  IconMoodHappy,
  IconMoodSadDizzy,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export type PointsIndicator = "wrong" | "partial" | "correct";

export function indicatorForPercent(percent: number): PointsIndicator {
  if (percent >= 75) return "correct";
  if (percent >= 50) return "partial";
  return "wrong";
}

export function PointsBadge({
  earned,
  possible,
  forceIndicator,
  customText,
}: {
  earned: number;
  possible: number;
  forceIndicator?: PointsIndicator;
  customText?: ReactNode;
}) {
  const indicator: PointsIndicator =
    forceIndicator ??
    (earned === possible && possible > 0
      ? "correct"
      : earned > 0
        ? "partial"
        : "wrong");
  const score: 0 | 1 | 2 =
    indicator === "correct" ? 2 : indicator === "partial" ? 1 : 0;
  return (
    <div
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-0.5 overflow-hidden text-xs font-semibold whitespace-nowrap tabular-nums pointer-events-none",
        score === 2 && "text-correct-green",
        score === 1 && "text-amber-600",
        score === 0 && "text-wrong-red",
      )}
    >
      <div className="pr-1">
        {score === 2 ? (
          <IconMoodHappy className="size-4.5 stroke-[1.5px] translate-x-[0.5px]" />
        ) : score === 1 ? (
          <IconMoodAnnoyed className="size-4.5 stroke-[1.5px] translate-x-[0.5px]" />
        ) : (
          <IconMoodSadDizzy className="size-4.5 stroke-[1.5px] translate-x-[0.5px]" />
        )}
      </div>
      <span className="text-foreground contents">
        {customText ?? (
          <>
            {earned}
            <span className="opacity-45">/</span>
            {possible}
          </>
        )}
      </span>
    </div>
  );
}
