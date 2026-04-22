"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Checkbox } from "./ui/checkbox";
import { useRowAction, useShowHeaderRow, type RowAction } from "@/lib/settings";
import { Separator } from "./ui/separator";

export function openDebugDialog() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("debug:open"));
}

const ROW_ACTIONS: { value: RowAction; label: string }[] = [
  { value: "expand", label: "Expand" },
  { value: "pop", label: "Pop" },
  { value: "sheet", label: "Sheet" },
  { value: "none", label: "None" },
];

export function DebugDialog() {
  const [open, setOpen] = useState(false);
  const [rowAction, setRowAction] = useRowAction();
  const [showHeaderRow, setShowHeaderRow] = useShowHeaderRow();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "d"
      ) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("debug:open", handler);
    return () => window.removeEventListener("debug:open", handler);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            These are mostly for testing purposes, not user-facing.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3">
          <Checkbox
            id="debug-show-header-row"
            checked={showHeaderRow}
            onCheckedChange={(next) => setShowHeaderRow(Boolean(next))}
          />
          <label htmlFor="debug-show-header-row" className="text-sm">
            Show table header row
          </label>
        </div>

        <Separator />

        <div className="flex flex-col gap-2">
          <div className="text-sm">Row action</div>
          <RadioGroup
            value={rowAction}
            onValueChange={(v) => setRowAction(v as RowAction)}
          >
            {ROW_ACTIONS.map((a) => {
              const id = `debug-row-action-${a.value}`;
              return (
                <div key={a.value} className="flex items-center gap-3">
                  <RadioGroupItem value={a.value} id={id} />
                  <label htmlFor={id} className="text-sm">
                    {a.label}
                  </label>
                </div>
              );
            })}
          </RadioGroup>
        </div>
      </DialogContent>
    </Dialog>
  );
}
