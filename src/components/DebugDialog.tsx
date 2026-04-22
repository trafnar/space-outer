"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ButtonGroup } from "./ui/button-group";
import { Button } from "./ui/button";
import { useRowAction, type RowAction } from "@/lib/debugSettings";

const ROW_ACTIONS: { value: RowAction; label: string }[] = [
  { value: "expand", label: "Expand" },
  { value: "pop", label: "Pop" },
  { value: "sheet", label: "Sheet" },
  { value: "none", label: "None" },
];

export function DebugDialog() {
  const [open, setOpen] = useState(false);
  const [rowAction, setRowAction] = useRowAction();

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Debug settings</DialogTitle>
          <DialogDescription>
            Toggle experimental UI behaviors. Settings persist in localStorage.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium">Row action</div>
          <ButtonGroup>
            {ROW_ACTIONS.map((a) => (
              <Button
                key={a.value}
                variant={rowAction === a.value ? "default" : "outline"}
                size="sm"
                onClick={() => setRowAction(a.value)}
              >
                {a.label}
              </Button>
            ))}
          </ButtonGroup>
        </div>
      </DialogContent>
    </Dialog>
  );
}
