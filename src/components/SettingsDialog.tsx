"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Checkbox } from "./ui/checkbox";
import {
  useRowAction,
  useShowHeaderRow,
  useShowDebugRegions,
  type RowAction,
} from "@/lib/settings";
import { Separator } from "./ui/separator";

const ROW_ACTIONS: { value: RowAction; label: string }[] = [
  { value: "expand", label: "Expand" },
  { value: "pop", label: "Pop" },
  { value: "sheet", label: "Sheet" },
  { value: "none", label: "None" },
];

export function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [rowAction, setRowAction] = useRowAction();
  const [showHeaderRow, setShowHeaderRow] = useShowHeaderRow();
  const [showDebugRegions, setShowDebugRegions] = useShowDebugRegions();

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.debugRegions = showDebugRegions
      ? "true"
      : "false";
  }, [showDebugRegions]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize how questions, answers, and worksheet controls appear.
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

        <div className="flex items-center gap-3">
          <Checkbox
            id="debug-show-debug-regions"
            checked={showDebugRegions}
            onCheckedChange={(next) => setShowDebugRegions(Boolean(next))}
          />
          <label htmlFor="debug-show-debug-regions" className="text-sm">
            Show debug regions
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
