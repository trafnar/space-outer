"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { IconChevronDown } from "@tabler/icons-react";

export function ReviewActionsMenu({
  slug,
  reviewSize,
  numberOfIncorrect,
  onAddIncorrect,
  onClearReview,
}: {
  slug: string;
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
          <Button variant="outline" size="xs" aria-label="Review sheet actions">
            Review
            <IconChevronDown data-icon="inline-end" />
          </Button>
        }
      />
      <DropdownMenuContent className="w-56">
        <DropdownMenuItem
          disabled={reviewEmpty}
          render={<Link href={`/tests/${slug}/review`} />}
        >
          Go to review
        </DropdownMenuItem>
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
