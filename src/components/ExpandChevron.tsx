import React from "react";
import { IconChevronRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const chevronClass =
  "size-4 transition-transform duration-200 ease-in-out reduce-motion:transition-none";

export function ExpandChevron({
  expanded,

  ...props
}: {
  expanded: boolean;
} & Omit<
  React.ComponentProps<typeof Button>,
  "children" | "variant" | "size"
>) {
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      className="text-muted-foreground"
      {...props}
    >
      <IconChevronRight className={cn(chevronClass, expanded && "rotate-90")} />
    </Button>
  );
}
