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

export function WorksheetActionsMenu({
  slug,
  worksheetSize,
  numberOfIncorrect,
  allIncorrectInWorksheet,
  totalQuestions,
  onAddIncorrect,
  onAddAll,
  onClearWorksheet,
}: {
  slug: string;
  worksheetSize: number;
  numberOfIncorrect: number;
  allIncorrectInWorksheet: boolean;
  totalQuestions: number;
  onAddIncorrect: () => void;
  onAddAll: () => void;
  onClearWorksheet: () => void;
}) {
  const worksheetEmpty = worksheetSize === 0;
  const allInWorksheet = worksheetSize >= totalQuestions;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            className="h-full px-1 group/pad bg-debug-red"
            aria-label="Worksheet actions"
          />
        }
      >
        <Button
          variant="outline"
          nativeButton={false}
          render={<div />}
          size="xs"
        >
          Worksheet
          <IconChevronDown data-icon="inline-end" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80">
        <DropdownMenuItem
          disabled={worksheetEmpty}
          render={<Link href={`/tests/${slug}/worksheet`} />}
        >
          Go to worksheet
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onAddIncorrect}
          disabled={numberOfIncorrect === 0 || allIncorrectInWorksheet}
        >
          Add {numberOfIncorrect} incorrect question
          {numberOfIncorrect === 1 ? "" : "s"} to worksheet
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAddAll} disabled={allInWorksheet}>
          Add all {totalQuestions} question{totalQuestions === 1 ? "" : "s"} to
          worksheet
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onClearWorksheet} disabled={worksheetEmpty}>
          {worksheetSize === 0
            ? "Clear all worksheet questions"
            : worksheetSize === 1
              ? "Clear 1 worksheet question"
              : `Clear all ${worksheetSize} worksheet questions`}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
