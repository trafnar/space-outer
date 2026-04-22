import { IconCertificate } from "@tabler/icons-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { TypoH3, TypoMuted } from "./ui/typo";

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
      aria-label={
        hasAnyStandards ? "Show standards" : "No standards for this question"
      }
      className={cn(
        "font-medium uppercase text-muted-foreground cursor-default hover:bg-transparent",
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
        className="leading-snug w-82 flex flex-col gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        <TypoMuted className="text-xs">Standards Assessed</TypoMuted>
        {standards.map((s) => (
          <div key={s}>
            <TypoH3
              className={cn("uppercase", hasAnyDescription ? "mb-1" : "mb-0")}
            >
              {s}
            </TypoH3>
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
