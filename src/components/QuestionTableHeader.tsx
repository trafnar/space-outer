"use client";

import Link from "next/link";
import { CardAction, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { IconArrowLeft, IconChevronDown } from "@tabler/icons-react";

export function QuestionTableHeader({
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
  const reviewEmpty = reviewSize === 0;
  return (
    <div
      className="sticky top-0 z-10 bg-background border-b"
      style={{ height }}
    >
      <CardHeader className="py-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground"
            nativeButton={false}
            aria-label="Back to home"
            render={<Link href="/" />}
          >
            <IconArrowLeft />
          </Button>
          <CardTitle className="text-xl font-bold text-balance">
            {title}
          </CardTitle>
        </div>
        <CardAction>
          <div className="flex items-center gap-1">
            <Button
              variant="default"
              size="sm"
              nativeButton={false}
              disabled={reviewEmpty}
              className={cn(
                reviewEmpty ? "opacity-50 pointer-events-none" : "",
              )}
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
              Start Review
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label="Review sheet actions"
                  >
                    <IconChevronDown />
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
                  Clear all {reviewSize} review item
                  {reviewSize === 1 ? "" : "s"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardAction>
      </CardHeader>
    </div>
  );
}
