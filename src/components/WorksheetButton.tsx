import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export function WorksheetButton({
  slug,
  worksheetSize,
  label = "Worksheet",
  className,
}: {
  slug: string;
  worksheetSize: number;
  label?: React.ReactNode;
  className?: string;
}) {
  const worksheetEmpty = worksheetSize === 0;
  return (
    <Link
      href={`/tests/${slug}/worksheet`}
      className={cn(
        "group/pad bg-debug-red flex items-center",
        worksheetEmpty && "opacity-50 pointer-events-none",
        className,
      )}
      aria-disabled={worksheetEmpty || undefined}
    >
      <Button
        variant="default"
        size="sm"
        nativeButton={false}
        render={<div />}
        className="group"
      >
        <div>
          <div
            data-icon="inline-start"
            className={cn(
              "tabular-nums truncate text-[10px] tracking-tighter font-bold bg-background size-4.5 rounded-full",
              "text-primary group-hover:text-primary/90 flex items-center justify-center -translate-x-0.5",
            )}
          >
            <span className="translate-x-[-0.5px]">{worksheetSize}</span>
          </div>
        </div>
        {label}
      </Button>
    </Link>
  );
}
