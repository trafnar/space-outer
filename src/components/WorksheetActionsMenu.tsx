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
  onAddIncorrect,
  onClearWorksheet,
}: {
  slug: string;
  worksheetSize: number;
  numberOfIncorrect: number;
  onAddIncorrect: () => void;
  onClearWorksheet: () => void;
}) {
  const worksheetEmpty = worksheetSize === 0;
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
      <DropdownMenuContent className="w-64">
        <DropdownMenuItem
          disabled={worksheetEmpty}
          render={<Link href={`/tests/${slug}/worksheet`} />}
        >
          Go to worksheet
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onAddIncorrect}
          disabled={numberOfIncorrect === 0}
        >
          Add {numberOfIncorrect} incorrect item
          {numberOfIncorrect === 1 ? "" : "s"} to worksheet
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onClearWorksheet} disabled={worksheetEmpty}>
          {worksheetSize === 0
            ? "Clear all worksheet items"
            : `Clear all ${worksheetSize} worksheet item${worksheetSize === 1 ? "" : "s"}`}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
