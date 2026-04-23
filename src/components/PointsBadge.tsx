import {
  IconMoodAnnoyed,
  IconMoodHappy,
  IconMoodSadDizzy,
} from "@tabler/icons-react";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

export type PointsIndicator = "wrong" | "partial" | "correct";

export function PointsBadge({
  earned,
  possible,
  forceIndicator,
}: {
  earned: number;
  possible: number;
  forceIndicator?: PointsIndicator;
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
    <Badge
      variant={score === 2 ? "green" : score === 1 ? "yellow" : "red"}
      className={cn(
        "flex tabular-nums pl-0 gap-0.5 bg-transparent border-none pointer-events-none",
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
        {earned}
        <span className="opacity-45">/</span>
        {possible}
      </span>
    </Badge>
  );
}
