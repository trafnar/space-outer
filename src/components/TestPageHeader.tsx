"use client";

import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { IconArrowLeft } from "@tabler/icons-react";
import { TypoH2 } from "./ui/typo";
import { WorksheetButton } from "./WorksheetButton";

export function TestPageHeader({
  title,
  subtitle,
  slug,
  worksheetSize,
  height,
  toolbar,
}: {
  title?: string;
  subtitle?: React.ReactNode;
  slug: string;
  worksheetSize: number;
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
        <WorksheetButton
          slug={slug}
          worksheetSize={worksheetSize}
          className="h-full pl-2 -ml-2 pr-6 -mr-6"
        />
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
