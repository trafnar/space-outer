import { Badge } from "./ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";

export function StandardsBadge({
  standard,
  description,
}: {
  standard: string;
  description?: string;
}) {
  if (!description) {
    return (
      <Badge variant="secondary" className="uppercase">
        {standard}
      </Badge>
    );
  }

  return (
    <HoverCard>
      <HoverCardTrigger
        delay={0}
        closeDelay={0}
        render={
          <Badge
            variant="secondary"
            className="font-medium uppercase text-muted-foreground cursor-default"
          >
            {standard}
          </Badge>
        }
      />
      <HoverCardContent side="left" className="leading-snug w-82">
        {description}
      </HoverCardContent>
    </HoverCard>
  );
}
