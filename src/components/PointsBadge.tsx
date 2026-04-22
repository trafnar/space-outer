import { IconMoodHappy, IconMoodSad } from "@tabler/icons-react";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

export function PointsBadge({
  earned,
  possible,
}: {
  earned: number;
  possible: number;
}) {
  const correct = earned === possible && possible > 0;
  return (
    <Badge
      variant={correct ? "green" : "red"}
      className={cn("tabular-nums pl-0 gap-0.5")}
    >
      <div className="pr-0.5">
        {correct ? (
          <IconMoodHappy className="size-4.5 stroke-[1.5px] translate-x-[0.5px]" />
        ) : (
          <IconMoodSad className="size-4.5 stroke-[1.5px] translate-x-[0.5px]" />
        )}
      </div>
      {earned}
      <span className="opacity-45">/</span>
      {possible}
    </Badge>
  );
}
