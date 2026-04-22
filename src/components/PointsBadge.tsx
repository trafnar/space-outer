import { Badge } from "./ui/badge";

export function PointsBadge({
  earned,
  possible,
}: {
  earned: number;
  possible: number;
}) {
  const correct = earned === possible && possible > 0;
  return (
    <Badge variant={correct ? "green" : "red"} className="tabular-nums">
      {earned}
      <span className="opacity-75">/</span>
      {possible}
    </Badge>
  );
}
