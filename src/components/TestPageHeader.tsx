"use client";

import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { IconArrowLeft } from "@tabler/icons-react";
import { TypoH2 } from "./ui/typo";

export function TestPageHeader({
  title,
  subtitle,
  slug,
  reviewSize,
  height,
  toolbar,
}: {
  title?: string;
  subtitle?: React.ReactNode;
  slug: string;
  reviewSize: number;
  height: number;
  toolbar?: React.ReactNode;
}) {
  return (
    <div
      style={{ height }}
      className={cn(
        "sticky top-0 z-15 bg-background border-b",
        "flex flex-col justify-between",
      )}
    >
      <div className="h-[52px] flex justify-between px-6 items-center">
        <div className="flex items-center gap-2 min-w-0 grow">
          <BackHomeButton />
          <div className="relative min-w-0 grow">
            <TypoH2 className="truncate">{title}</TypoH2>
            {subtitle && (
              <div className="absolute top-full left-0 right-0 -mt-[1px] text-xs text-muted-foreground truncate">
                {subtitle}
              </div>
            )}
          </div>
        </div>
        <ReviewButton slug={slug} reviewSize={reviewSize} />
      </div>
      {toolbar}
    </div>
  );
}

function BackHomeButton() {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={cn(
        "text-muted-foreground",
        // optical adjustment
        "-ml-2",
      )}
      nativeButton={false}
      aria-label="Back to home"
      render={<Link href="/" />}
    >
      <IconArrowLeft />
    </Button>
  );
}

function ReviewButton({
  slug,
  reviewSize,
}: {
  slug: string;
  reviewSize: number;
}) {
  const reviewEmpty = reviewSize === 0;
  return (
    <Link
      href={`/tests/${slug}/review`}
      className={cn(
        "h-full pl-2 -ml-2 pr-6 -mr-6 group/pad bg-debug-red flex items-center",
        reviewEmpty && "opacity-50 pointer-events-none",
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
            {reviewSize}
          </div>
        </div>
        Review Worksheet
      </Button>
    </Link>
  );
}
