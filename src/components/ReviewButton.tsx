import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export function ReviewButton({
  slug,
  reviewSize,
  label = "Review Worksheet",
  className,
}: {
  slug: string;
  reviewSize: number;
  label?: React.ReactNode;
  className?: string;
}) {
  const reviewEmpty = reviewSize === 0;
  return (
    <Link
      href={`/tests/${slug}/review`}
      className={cn(
        "group/pad bg-debug-red flex items-center",
        reviewEmpty && "opacity-50 pointer-events-none",
        className,
      )}
      aria-disabled={reviewEmpty || undefined}
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
            <span className="translate-x-[-0.5px]">{reviewSize}</span>
          </div>
        </div>
        {label}
      </Button>
    </Link>
  );
}
