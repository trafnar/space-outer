import {
  IconMoodAnnoyed,
  IconMoodHappy,
  IconMoodSadDizzy,
} from "@tabler/icons-react";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

export function PointsBadge({
  earned,
  possible,
}: {
  earned: number;
  possible: number;
}) {
  const score: 0 | 1 | 2 =
    earned === possible && possible > 0 ? 2 : earned > 0 ? 1 : 0;
  return (
    <Badge
      variant={score === 2 ? "green" : score === 1 ? "yellow" : "red"}
      className={cn("tabular-nums pl-0 gap-0.5 bg-transparent border-none")}
    >
      <div className="pr-0.5">
        {score === 2 ? (
          <IconMoodHappy className="size-4.5 stroke-[1.5px] translate-x-[0.5px]" />
        ) : score === 1 ? (
          <IconMoodAnnoyed className="size-4.5 stroke-[1.5px] translate-x-[0.5px]" />
        ) : (
          <IconMoodSadDizzy className="size-4.5 stroke-[1.5px] translate-x-[0.5px]" />
        )}
      </div>
      {earned}
      <span className="opacity-45">/</span>
      {possible}
    </Badge>
  );
}
