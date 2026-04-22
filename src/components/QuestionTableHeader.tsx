"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { IconArrowLeft, IconDots } from "@tabler/icons-react";
import { AnswerVisibilityToggle } from "./AnswerVisibilityToggle";
import { TypoH2 } from "./ui/typo";

export function TestPageHeader({
  title,
  slug,
  reviewSize,
  numberOfIncorrect,
  onAddIncorrect,
  onClearReview,
  height,
}: {
  title?: string;
  slug: string;
  reviewSize: number;
  numberOfIncorrect: number;
  onAddIncorrect: () => void;
  onClearReview: () => void;
  height: number;
}) {
  return (
    <div
      style={{ height }}
      className={cn(
        "sticky top-0 z-10 bg-background border-b",
        "px-6",
        "flex flex-col items-start justify-between",
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <BackHomeButton />
        <TypoH2 className="truncate min-w-0">{title}</TypoH2>
      </div>

      <div>
        <div className="flex items-center gap-1">
          <AnswerVisibilityToggle />
          <ReviewActionsMenu
            reviewSize={reviewSize}
            numberOfIncorrect={numberOfIncorrect}
            onAddIncorrect={onAddIncorrect}
            onClearReview={onClearReview}
          />
          <ReviewButton slug={slug} reviewSize={reviewSize} />
        </div>
      </div>
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

function ReviewActionsMenu({
  reviewSize,
  numberOfIncorrect,
  onAddIncorrect,
  onClearReview,
}: {
  reviewSize: number;
  numberOfIncorrect: number;
  onAddIncorrect: () => void;
  onClearReview: () => void;
}) {
  const reviewEmpty = reviewSize === 0;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Review sheet actions"
            className="text-muted-foreground"
          >
            <IconDots />
          </Button>
        }
      />
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuItem
          onClick={onAddIncorrect}
          disabled={numberOfIncorrect === 0}
        >
          Add {numberOfIncorrect} incorrect item
          {numberOfIncorrect === 1 ? "" : "s"} to review
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onClearReview} disabled={reviewEmpty}>
          {reviewSize === 0
            ? "Clear all review items"
            : `Clear all ${reviewSize} review item${reviewSize === 1 ? "" : "s"}`}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
      className={cn(reviewEmpty ? "opacity-50 pointer-events-none" : "")}
      render={<Link href={`/tests/${slug}/review`} />}
    >
      <div>
        <div
          data-icon="inline-start"
          className={cn(
            "tabular-nums truncate text-[10px] tracking-tighter font-bold bg-background size-4.5 rounded-full",
            "text-foreground flex items-center justify-center -translate-x-0.5",
          )}
        >
          {reviewSize}
        </div>
      </div>
      Review
    </Button>
  );
}
