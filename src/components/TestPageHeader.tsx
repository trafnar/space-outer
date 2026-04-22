"use client";

import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { IconArrowLeft } from "@tabler/icons-react";
import { TypoH2 } from "./ui/typo";

export function TestPageHeader({
  title,
  slug,
  reviewSize,
  height,
  toolbar,
}: {
  title?: string;
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
        "flex flex-col",
      )}
    >
      <div className="grow flex justify-between px-6 items-center">
        <div className="flex items-center gap-2 min-w-0 grow">
          <BackHomeButton />
          <TypoH2 className="truncate min-w-0">{title}</TypoH2>
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
    <Button
      variant="default"
      size="sm"
      nativeButton={false}
      disabled={reviewEmpty}
      className={cn(
        reviewEmpty ? "opacity-50 pointer-events-none" : "",
        "group",
      )}
      render={<Link href={`/tests/${slug}/review`} />}
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
      Review
    </Button>
  );
}
