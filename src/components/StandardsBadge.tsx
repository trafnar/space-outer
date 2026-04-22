import { IconCertificate } from "@tabler/icons-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export function StandardsBadge({
  standards,
  descriptions,
}: {
  standards: string[];
  descriptions?: Record<string, string>;
}) {
  const hasAnyDescription = standards.some((s) => descriptions?.[s]);
  const hasAnyStandards = standards.length > 0;

  const buttonContent = (
    <Button
      variant="ghost"
      size="icon-sm"
      disabled={!hasAnyStandards}
      className={cn(
        "font-medium uppercase text-muted-foreground cursor-default hover:bg-transparent",
        // optical adjustment if aligned left
        "-ml-2",
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <IconCertificate className="stroke-[1.5px]" />
    </Button>
  );

  return (
    <HoverCard>
      <HoverCardTrigger delay={0} closeDelay={0} render={buttonContent} />
      <HoverCardContent
        side="right"
        className="leading-snug w-82 flex flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        {standards.map((s) => (
          <div key={s}>
            <h2
              className={cn(
                "font-bold uppercase font-heading",
                hasAnyDescription ? "mb-1" : "mb-0",
              )}
            >
              {s}
            </h2>
            {descriptions?.[s] ? (
              <div>{descriptions[s]}</div>
            ) : (
              <div className="text-muted-foreground">
                No description available
              </div>
            )}
          </div>
        ))}
      </HoverCardContent>
    </HoverCard>
  );
}
