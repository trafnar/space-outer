"use client";

import { getImageProps } from "next/image";
import ReactDOM from "react-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import type { ViewQuestion } from "@/lib/testViewData";
import { QuestionCard } from "./QuestionCard";
import React, {
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { PointsBadge } from "./PointsBadge";
import { StandardsBadge } from "./StandardsBadge";
import { QuestionSheet } from "./QuestionSheet";
import { QuestionDialog } from "./QuestionDialog";
import { useWorksheet } from "@/lib/worksheet";
import { useBrushSelect } from "@/lib/useBrushSelect";
import { useRowAction, useShowHeaderRow } from "@/lib/settings";
import { TestPageHeader } from "./TestPageHeader";
import { WorksheetActionsMenu } from "./WorksheetActionsMenu";
import { ExpandChevron } from "./ExpandChevron";
import { AnswerVisibilityToggle } from "./AnswerVisibilityToggle";
import { QuestionPreview } from "./QuestionPreview";
import {
  IconAdjustments,
  IconChevronRight,
  IconClipboardCheckFilled,
  IconClipboardPlus,
} from "@tabler/icons-react";
import { SettingsDialog } from "./SettingsDialog";

// Height of the sticky card-header wrapper. Used both as its fixed
// height and as the top offset for the sticky thead so they line up.
const stickyHeaderHeight = 108;

function isTextEntryTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

export function QuestionTable({
  questions,
  standards,
  title,
  subtitle,
  slug,
}: {
  questions: ViewQuestion[];
  standards?: Record<string, string>;
  title?: string;
  subtitle?: React.ReactNode;
  slug: string;
}) {
  const [rowAction] = useRowAction();
  const [showHeaderRow] = useShowHeaderRow();
  const isExpandMode = rowAction === "expand";
  const isPopMode = rowAction === "pop";
  const isSheetMode = rowAction === "sheet";
  const isInteractive = isExpandMode || isPopMode || isSheetMode;
  const [expandedRowIds, setExpandedRowIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [worksheet, setWorksheet] = useWorksheet(slug);
  // Row "cursor": which row is selected. Drives the modal/sheet content
  // when open, and persists independently of open/closed state so arrow-key
  // nav keeps working after closing.
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewEmptyWorksheetAdd, setPreviewEmptyWorksheetAdd] =
    useState(false);
  // Tracks the row index the sheet/dialog is currently open for. Used
  // by `activateRow` to detect a second activation on the same row
  // (which should toggle the modal closed). We can't compare against
  // `selectedIndex` for this because a row's `onFocus` fires before
  // `onClick` and updates `selectedIndex` to the clicked row, so by the
  // time the click handler runs the two always look equal.
  const openForIndexRef = useRef<number | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // const { scrollY } = useScroll();
  // const shadowAlpha = useTransform(scrollY, [0, 10], [0, 0.08], {
  //   clamp: true,
  // });
  // const headerBoxShadow = useMotionTemplate`0 1px 5px 0 rgba(0, 0, 0, ${shadowAlpha})`;
  const headerBoxShadow = "0 0.5px 0px 0 var(--border)";

  const toggleRow = (n: number) => {
    setExpandedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };

  const toggleInWorksheet = (n: number) => {
    setWorksheet((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };

  const handleMarkPointerDown = useBrushSelect<number>({
    current: worksheet,
    setState: setWorksheet,
    selector: "[data-question-n]",
    parseId: (el) => Number(el.dataset.questionN),
  });

  const activateRow = (q: ViewQuestion, index: number) => {
    if (isExpandMode) {
      setSelectedIndex(index);
      toggleRow(q.n);
    } else if (isPopMode || isSheetMode) {
      const sameRow = index === openForIndexRef.current;
      if (isModalOpen && sameRow) {
        setIsModalOpen(false);
        openForIndexRef.current = null;
      } else {
        setSelectedIndex(index);
        setIsModalOpen(true);
        openForIndexRef.current = index;
      }
    }
  };

  // Global keyboard nav: Up/Down move the cursor, x toggles worksheet.
  // Enter is handled at the row level so it always runs exactly once
  // through `activateRow` in whichever mode is current.
  const handleGlobalKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (isTextEntryTarget(e.target)) return;
    const isDown = e.key === "ArrowDown" || e.key === "j";
    const isUp = e.key === "ArrowUp" || e.key === "k";
    if (isDown || isUp) {
      e.preventDefault();
      setSelectedIndex((prev) => {
        const next =
          prev === null
            ? 0
            : Math.max(
                0,
                Math.min(questions.length - 1, prev + (isDown ? 1 : -1)),
              );
        // Keep the "currently-displayed-sheet-row" ref in sync so a
        // subsequent click on the displayed row closes the sheet.
        if (isModalOpen) openForIndexRef.current = next;
        return next;
      });
    } else if (e.key === "x") {
      if (selectedIndex === null) return;
      e.preventDefault();
      toggleInWorksheet(questions[selectedIndex].n);
    } else if (e.key === "Escape") {
      if (isModalOpen) return;
      if (selectedIndex === null) return;
      e.preventDefault();
      const el = document.querySelector<HTMLElement>(
        `[data-row-index="${selectedIndex}"]`,
      );
      el?.blur();
      setSelectedIndex(null);
    }
  });

  useEffect(() => {
    if (!isInteractive) return;
    const handler = (e: KeyboardEvent) => {
      handleGlobalKeyDown(e);
    };
    window.addEventListener("keydown", handler, { capture: true });
    return () =>
      window.removeEventListener("keydown", handler, { capture: true });
  }, [isInteractive]);

  // Keep focus + viewport aligned with the cursor. Moving the cursor
  // moves DOM focus to the same row so "focused" and "selected" are
  // always the same thing — this keeps Space/Enter activating the row
  // the user just arrowed to rather than whichever row they last clicked.
  // Skip focus() only when the modal Dialog (pop mode) is open, since
  // its focus trap would yank focus back. Sheet is non-modal, so syncing
  // focus while it's open is fine.
  useEffect(() => {
    if (selectedIndex === null) return;
    const el = document.querySelector<HTMLElement>(
      `[data-row-index="${selectedIndex}"]`,
    );
    if (!el) return;
    el.scrollIntoView({ block: "nearest" });
    const dialogOpen = isPopMode && isModalOpen;
    if (!dialogOpen) el.focus({ preventScroll: true });
  }, [selectedIndex, isModalOpen, isPopMode]);

  const toggleAllWillCollapse = expandedRowIds.size > questions.length / 2;
  const toggleAllRows = () => {
    if (toggleAllWillCollapse) {
      setExpandedRowIds(new Set());
    } else {
      setExpandedRowIds(new Set(questions.map((q) => q.n)));
    }
  };

  const incorrectQuestions = questions.filter(
    (q) => q.points.earned < q.points.possible,
  );
  const numberOfIncorrect = incorrectQuestions.length;
  const emptyWorksheetAddQuestions =
    numberOfIncorrect > 0 ? incorrectQuestions : questions;
  const emptyWorksheetAddQuestionNumbers = useMemo(
    () => new Set(emptyWorksheetAddQuestions.map((q) => q.n)),
    [emptyWorksheetAddQuestions],
  );
  const allIncorrectInWorksheet =
    numberOfIncorrect > 0 &&
    incorrectQuestions.every((q) => worksheet.has(q.n));

  const addIncorrectToWorksheet = () => {
    setWorksheet(
      (prev) => new Set([...prev, ...incorrectQuestions.map((q) => q.n)]),
    );
  };

  const addAllToWorksheet = () => {
    setWorksheet(new Set(questions.map((q) => q.n)));
  };

  const addEmptyWorksheetQuestions = () => {
    setWorksheet(new Set(emptyWorksheetAddQuestionNumbers));
    setPreviewEmptyWorksheetAdd(false);
  };

  const clearWorksheet = () => setWorksheet(new Set());

  // When the sheet is open, squeeze the table (and sticky header)
  // leftward so the sheet sits beside it rather than over it. The sheet
  // is `clamp(25rem, 50vw, 32rem)`: cap 32rem, floor 25rem, otherwise
  // 50% of viewport. The padding normally matches the sheet's width,
  // but is further clamped so the table never shrinks below ~33rem
  // (~528px). Below that point the sheet just overlaps.
  const sheetSqueezeOpen = isSheetMode && isModalOpen;

  return (
    <div
      className={cn(
        sheetSqueezeOpen &&
          "pr-[min(clamp(25rem,50vw,32rem),max(0px,calc(100vw_-_33rem)))]",
      )}
    >
      <TestPageHeader
        title={title}
        subtitle={subtitle}
        slug={slug}
        worksheetSize={worksheet.size}
        height={stickyHeaderHeight}
        onEmptyWorksheetClick={addEmptyWorksheetQuestions}
        onEmptyWorksheetHoverChange={setPreviewEmptyWorksheetAdd}
        toolbar={
          <div
            className={cn(
              "px-6 border-t flex items-center -ml-1 h-11",
              "overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            )}
          >
            {isExpandMode && (
              <button
                onClick={toggleAllRows}
                className=" h-full px-1 group/pad bg-debug-red"
                aria-label={
                  toggleAllWillCollapse ? "Collapse all" : "Expand all"
                }
              >
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={<div />}
                  size="xs"
                >
                  <IconChevronRight
                    data-icon="inline-start"
                    className={cn(
                      "transition-transform",
                      toggleAllWillCollapse && "rotate-90",
                    )}
                  />
                  Toggle all
                </Button>
              </button>
            )}
            <WorksheetActionsMenu
              slug={slug}
              worksheetSize={worksheet.size}
              numberOfIncorrect={numberOfIncorrect}
              allIncorrectInWorksheet={allIncorrectInWorksheet}
              totalQuestions={questions.length}
              onAddIncorrect={addIncorrectToWorksheet}
              onAddAll={addAllToWorksheet}
              onClearWorksheet={clearWorksheet}
            />
            <AnswerVisibilityToggle />
            <button
              onClick={() => setSettingsOpen(true)}
              className="h-full px-1 group/pad bg-debug-red"
              aria-label="Open settings"
            >
              <Button
                variant="outline"
                nativeButton={false}
                render={<div />}
                size="xs"
              >
                <IconAdjustments data-icon="inline-start" />
                Settings
              </Button>
            </button>
          </div>
        }
      />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <Table>
        {showHeaderRow && (
          <motion.thead
            data-slot="table-header"
            className="[&_tr]:border-b sticky bg-background z-10"
            style={{ top: stickyHeaderHeight, boxShadow: headerBoxShadow }}
          >
            <TableRow className="hover:bg-transparent">
              {isExpandMode && <TableHead />}
              <TableHead>Add</TableHead>
              <TableHead className="w-full">Question</TableHead>
              <TableHead>Points</TableHead>
            </TableRow>
          </motion.thead>
        )}
        <TableBody>
          {questions.map((q, i) => (
            <QuestionTableRow
              key={q.n}
              index={i}
              question={q}
              standards={standards}
              isExpanded={expandedRowIds.has(q.n)}
              isMarked={worksheet.has(q.n)}
              isPreviewMarked={
                previewEmptyWorksheetAdd &&
                worksheet.size === 0 &&
                emptyWorksheetAddQuestionNumbers.has(q.n)
              }
              isSelected={i === selectedIndex}
              // Roving tabindex: only the selected row is tabbable.
              // When nothing is selected, make the first row the Tab
              // entry point — focusing it will set selection.
              isTabbable={
                isInteractive &&
                (i === selectedIndex || (selectedIndex === null && i === 0))
              }
              isExpandMode={isExpandMode}
              isPopMode={isPopMode}
              isInteractive={isInteractive}
              hideStandards={isSheetMode && isModalOpen}
              onToggleMark={() => toggleInWorksheet(q.n)}
              onMarkPointerDown={(e) =>
                handleMarkPointerDown(e, q.n, worksheet.has(q.n))
              }
              onActivate={() => activateRow(q, i)}
              onFocusRow={() => setSelectedIndex(i)}
            />
          ))}
        </TableBody>
      </Table>
      {isSheetMode && (
        <QuestionSheet
          questions={questions}
          selectedIndex={selectedIndex}
          onSelectedIndexChange={setSelectedIndex}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
      {isPopMode && (
        <QuestionDialog
          questions={questions}
          selectedIndex={selectedIndex}
          onSelectedIndexChange={setSelectedIndex}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
      <ImagePreloader questions={questions} />
    </div>
  );
}

// Emits <link rel="preload" as="image"> into <head> for every question
// image so the browser starts fetching them during initial HTML parse.
// We derive src/srcSet/sizes via getImageProps so the preload hints match
// exactly what next/image requests when the sheet/dialog later renders
// the image — giving an HTTP cache hit and instant appearance.
function ImagePreloader({ questions }: { questions: ViewQuestion[] }) {
  for (const q of questions) {
    for (const block of q.prompt) {
      if (
        block.type === "diagram" &&
        block.imageSrc &&
        block.imageWidth &&
        block.imageHeight
      ) {
        preloadImage(block.imageSrc, block.imageWidth, block.imageHeight);
      } else if (block.type === "choices") {
        for (const opt of block.options) {
          if (opt.imageSrc && opt.imageWidth && opt.imageHeight) {
            preloadImage(opt.imageSrc, opt.imageWidth, opt.imageHeight);
          }
        }
      }
    }
  }
  return null;
}

function preloadImage(src: string, width: number, height: number) {
  const { props } = getImageProps({ src, alt: "", width, height });
  ReactDOM.preload(props.src, {
    as: "image",
    imageSrcSet: props.srcSet,
    imageSizes: props.sizes,
    fetchPriority: "low",
  });
}

function QuestionTableRow({
  index,
  question: q,
  standards,
  isExpanded,
  isMarked,
  isPreviewMarked,
  isSelected,
  isTabbable,
  isExpandMode,
  isPopMode,
  isInteractive,
  hideStandards,
  onToggleMark,
  onMarkPointerDown,
  onActivate,
  onFocusRow,
}: {
  index: number;
  question: ViewQuestion;
  standards?: Record<string, string>;
  isExpanded: boolean;
  isMarked: boolean;
  isPreviewMarked: boolean;
  isSelected: boolean;
  isTabbable: boolean;
  isExpandMode: boolean;
  isPopMode: boolean;
  isInteractive: boolean;
  hideStandards: boolean;
  onToggleMark: () => void;
  onMarkPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
  onActivate: () => void;
  onFocusRow: () => void;
}) {
  const expanded = isExpandMode && isExpanded;
  const colCount = isExpandMode ? 5 : 4;
  const visuallyMarked = isMarked || isPreviewMarked;

  const handleMarkClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onToggleMark();
  };

  return (
    <React.Fragment>
      <TableRow
        data-row-index={index}
        data-question-n={q.n}
        data-state={isSelected ? "selected" : undefined}
        aria-current={isSelected ? "true" : undefined}
        style={{ scrollMarginTop: stickyHeaderHeight - 1 }}
        onClick={isInteractive ? onActivate : undefined}
        onFocus={isInteractive ? onFocusRow : undefined}
        onKeyDown={
          isInteractive
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onActivate();
                }
              }
            : undefined
        }
        role={isInteractive ? "button" : undefined}
        tabIndex={isInteractive ? (isTabbable ? 0 : -1) : undefined}
        aria-expanded={isExpandMode ? expanded : undefined}
        aria-haspopup={isPopMode ? "dialog" : undefined}
        aria-controls={isExpandMode ? `question-${q.n}-details` : undefined}
        className={cn(
          "outline-none",
          // Override TableRow's default full-row backgrounds so the
          // inset rounded highlight below isn't stacked on top of a
          // full-bleed muted bar.
          "hover:bg-transparent has-aria-expanded:bg-transparent data-[state=selected]:bg-transparent",
          // Paint hover/selected state as a rounded rectangle slightly
          // inset from the row. `isolate` scopes the ::after's z-index
          // to the row so it sits behind cell content without needing
          // the cells themselves to be positioned.
          "relative isolate",
          "after:content-[''] after:pointer-events-none after:absolute after:-z-1",
          // "hover:after:bg-muted/50",
          // "has-aria-expanded:after:bg-muted/50",
          "data-[state=selected]:after:bg-muted",

          // "data-[state=selected]:after:border",
          // "data-[state=selected]:after:border-muted",

          "after:inset-y-0.75 after:inset-x-0.75",
          "after:rounded-md",
          isInteractive && "cursor-pointer",
          isExpandMode && "border-b-0",
        )}
      >
        {isExpandMode && (
          <TableCell className="pr-0">
            <div className="group/pad h-full px-2 -ml-2 -mr-2 flex items-center bg-debug-red">
              <ExpandChevron
                expanded={expanded}
                tabIndex={-1}
                aria-hidden
                nativeButton={false}
                render={<div />}
              />
            </div>
          </TableCell>
        )}
        <TableCell>
          <button
            onPointerDown={onMarkPointerDown}
            onClick={handleMarkClick}
            className="h-full px-1.5 -ml-1.5 -mr-1.5  group/pad bg-debug-red touch-none select-none"
            aria-pressed={isMarked}
            aria-label={isMarked ? "Remove from worksheet" : "Add to worksheet"}
          >
            <Button
              variant={visuallyMarked ? "default" : "outline"}
              className={cn(
                "text-muted-foreground hover:text-foreground group-hover/pad:text-foreground",
                visuallyMarked &&
                  "text-background bg-foreground hover:bg-foreground hover:text-background group-hover/pad:bg-foreground group-hover/pad:text-background",
              )}
              size="icon-sm"
              nativeButton={false}
              render={<div />}
            >
              {visuallyMarked ? (
                <IconClipboardCheckFilled className="size-4.5" />
              ) : (
                <IconClipboardPlus className="size-4.5" />
              )}
            </Button>
          </button>
        </TableCell>
        <TableCell className="w-full max-w-0 whitespace-normal">
          <div className="flex items-center w-full">
            <div className="font-semibold tabular-nums text-xs ">
              <span className="opacity-45 pr-0.5 font-light">#</span>
              {q.n}
            </div>
            <div
              className={cn(
                "text-xs text-muted-foreground overflow-hidden whitespace-nowrap min-w-0 flex-1 px-3",
                "transition-opacity duration-200 ease-in-out reduce-motion:transition-none",
                isExpandMode && isExpanded && "opacity-0",
              )}
              style={{
                maskImage:
                  "linear-gradient(to right, black calc(100% - 40px), transparent)",
                WebkitMaskImage:
                  "linear-gradient(to right, black calc(100% - 40px), transparent)",
              }}
            >
              <QuestionPreview prompt={q.prompt} />
            </div>
            {!hideStandards && (
              <div className="-mr-2.5">
                <StandardsBadge
                  standards={q.standards}
                  descriptions={standards}
                />
              </div>
            )}
          </div>
        </TableCell>
        <TableCell>
          {/* adjust for alignment with other text in cells */}
          <div className="flex justify-center">
            <PointsBadge
              earned={q.points.earned}
              possible={q.points.possible}
            />
          </div>
        </TableCell>
      </TableRow>
      {isExpandMode && (
        <TableRow
          aria-hidden={!expanded}
          className="hover:bg-transparent h-auto"
        >
          <TableCell
            colSpan={colCount}
            className="p-0 whitespace-normal h-auto!"
          >
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  key="expanded"
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <div
                    id={`question-${q.n}-details`}
                    role="region"
                    aria-label={`Question ${q.n} details`}
                    className="px-1.5 pt-1 pb-6"
                  >
                    <QuestionCard question={q} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
}
