#!/usr/bin/env node
// Ingest a ThinkCentral archive (produced by think-central-archive.js) and
// write ready-to-use test data and assets for the app.
//
// Parses the archive offline with linkedom — no browser needed. Iterate on
// extractor logic here rather than re-running the view/extract browser dance.
//
// Usage:
//   node scripts/ingest-archive.mjs <archive.json> <target-slug>
//
// Example:
//   node scripts/ingest-archive.mjs \
//     ~/Downloads/pmt-chapter-10-post-test-...archive.json \
//     chapter-10-test
//
// Writes JSON to src/data/tests/<target-slug>/ and images to
// public/test-assets/<target-slug>/.
// Existing generated JSON and image assets are removed first so stale files
// don't linger.

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { parseHTML } from "linkedom";

// Shared image cache: each remote URL is fetched once, keyed by a hash of
// the URL, then copied into each target folder that references it. Keeps
// re-ingestion offline after the first run.
const IMAGE_CACHE_DIR = path.resolve(
  process.env.HOME ?? "",
  "Code/think-central-extractor/archives/images",
);

const [, , archiveArg, slug] = process.argv;
if (!archiveArg || !slug) {
  console.error(
    "Usage: ingest-archive.mjs <archive.json> <target-slug>",
  );
  process.exit(1);
}
if (!/^[a-z0-9-]+$/.test(slug)) {
  console.error(`slug must match /^[a-z0-9-]+$/: ${slug}`);
  process.exit(1);
}

const archivePath = path.resolve(
  archiveArg.replace(/^~(?=$|\/)/, process.env.HOME ?? ""),
);
const repoRoot = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
);
const dst = path.join(repoRoot, "src/data/tests", slug);
const assetDst = path.join(repoRoot, "public/test-assets", slug);

const archive = JSON.parse(await fs.readFile(archivePath, "utf8"));

// ---------- Outer-page metadata ----------

const outer = parseHTML(archive.outerHtml).document;
const pageUrl = archive.pageUrl || "";
const BASE = pageUrl ? new URL(pageUrl).origin : "https://www-k6.thinkcentral.com";

const titleNode = outer.querySelector(".ass_test_name_header");
const nameRaw = (titleNode?.textContent || "test").replace(/\s+/g, " ").trim();
const title = nameRaw.replace(/^Test Results:\s*/i, "");

const fieldCells = [
  ...outer.querySelectorAll("td.fieldName, td.fieldNameBold"),
];
const byLabel = {};
for (let i = 0; i < fieldCells.length - 1; i++) {
  const a = (fieldCells[i].textContent || "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/:$/, "");
  const b = (fieldCells[i + 1].textContent || "").replace(/\s+/g, " ").trim();
  if (a && b && !byLabel[a]) byLabel[a] = b;
}

const summary =
  (outer.querySelector("table.ass_scored_tblmrg")?.textContent || "").replace(
    / /g,
    " ",
  );

const takenOnMatch = summary.match(
  /Taken On\s+([A-Z][a-z]+\s+\d+,\s+\d{4})/,
);
let takenOn = null;
if (takenOnMatch) {
  const d = new Date(takenOnMatch[1]);
  if (!isNaN(d.getTime())) takenOn = d.toISOString().slice(0, 10);
}

const student = byLabel["Student Name"] || "";
const teacher = byLabel["Teacher Name"] || null;

const scoreMatch = summary.match(/Score:\s*(\d+)%\s*\((\d+)\/(\d+)\)/);
const score = scoreMatch
  ? {
      percent: parseInt(scoreMatch[1], 10),
      earned: parseInt(scoreMatch[2], 10),
      possible: parseInt(scoreMatch[3], 10),
    }
  : { percent: 0, earned: 0, possible: 0 };

const perQMeta = {};
for (const tr of outer.querySelectorAll("tr.evenrow, tr.odd")) {
  const txt = (tr.textContent || "").replace(/\s+/g, " ").trim();
  const m = txt.match(/^(\d+)\s+(.+?)\s+(\d+)\/(\d+)$/);
  if (m) {
    perQMeta[parseInt(m[1], 10)] = {
      type: m[2].trim(),
      points: {
        earned: parseInt(m[3], 10),
        possible: parseInt(m[4], 10),
      },
    };
  }
}

const standardsByQ = {};
const standardsMap = {};
for (const item of outer.querySelectorAll('tr.TestItem[id^="TestItem_"]')) {
  const m = item.id.match(/TestItem_(\d+)/);
  if (!m) continue;
  const qNum = parseInt(m[1], 10);
  const stds = [];
  const stdLabel = [...item.querySelectorAll("td")].find(
    (td) =>
      td.children.length === 0 && (td.textContent || "").trim() === "Standards:",
  );
  if (stdLabel) {
    let next = stdLabel.closest("tr").nextElementSibling;
    while (next) {
      const tds = [...next.children];
      if (
        tds.length === 2 &&
        (tds[0].textContent || "").trim() &&
        (tds[1].textContent || "").trim()
      ) {
        const code = (tds[0].textContent || "").trim();
        const desc = (tds[1].textContent || "").replace(/\s+/g, " ").trim();
        stds.push(code);
        standardsMap[code] = desc;
        next = next.nextElementSibling;
      } else break;
    }
  }
  standardsByQ[qNum] = stds;
}

// ---------- Per-question prompt + response parsing ----------

const images = []; // { localName, url }

function registerImage(src, qNum, counterRef) {
  const fullUrl = src.startsWith("http") ? src : BASE + src;
  const existing = images.find((im) => im.url === fullUrl);
  if (existing) return existing.localName;
  counterRef.value += 1;
  const extM = src.match(/\.(\w+)(?:\?|$)/);
  const ext = extM ? extM[1] : "png";
  const localName = `q${String(qNum).padStart(2, "0")}-d${counterRef.value}.${ext}`;
  images.push({ localName, url: fullUrl });
  return localName;
}

function isSkippableImg(el) {
  const src = el.getAttribute("src") || "";
  if (/h5styles|keypad/i.test(src)) return true;
  const w = parseInt(el.getAttribute("width") || "0", 10);
  if (w && w <= 50) return true;
  return false;
}

function parsePart(partEl, qNum, imgCounterRef) {
  const blocks = [];
  let para = [];
  const blankIds = [];
  const selectOptionsByBlankId = {};
  let blankCounter = 0;

  const firstLabel = partEl.querySelector("label.ansMS, label.ansMC");
  const answerTable = firstLabel?.closest("table");
  const isMultiSelect = !!firstLabel?.classList.contains("ansMS");

  const flushPara = () => {
    const merged = [];
    for (const item of para) {
      if (
        item.type === "text" &&
        merged.length &&
        merged[merged.length - 1].type === "text"
      ) {
        merged[merged.length - 1].text += item.text;
      } else {
        merged.push({ ...item });
      }
    }
    for (const item of merged) {
      if (item.type === "text") item.text = item.text.replace(/\s+/g, " ");
    }
    if (merged[0]?.type === "text") {
      merged[0].text = merged[0].text.replace(/^\s+/, "");
    }
    const last = merged[merged.length - 1];
    if (last?.type === "text") last.text = last.text.replace(/\s+$/, "");
    const nonEmpty = merged.filter(
      (x) => x.type !== "text" || x.text.length > 0,
    );
    if (nonEmpty.length) blocks.push({ type: "paragraph", content: nonEmpty });
    para = [];
  };

  const blockTags = new Set(["p"]);

  function visit(node) {
    if (answerTable && node === answerTable) return;
    if (node.nodeType === 3) {
      if (node.textContent) para.push({ type: "text", text: node.textContent });
      return;
    }
    if (node.nodeType !== 1) return;
    const tag = node.tagName.toLowerCase();

    if (tag === "img") {
      if (isSkippableImg(node)) return;
      flushPara();
      const localName = registerImage(
        node.getAttribute("src") || "",
        qNum,
        imgCounterRef,
      );
      const diag = { type: "diagram", file: localName };
      const alt = node.getAttribute("alt");
      if (alt) diag.alt = alt;
      blocks.push(diag);
      return;
    }

    if (tag === "input") {
      const inputType = (node.getAttribute("type") || "text").toLowerCase();
      if (inputType === "text" || inputType === "") {
        blankCounter += 1;
        const id = `b${blankCounter}`;
        blankIds.push(id);
        para.push({ type: "blank", id });
      }
      return;
    }

    if (tag === "select") {
      blankCounter += 1;
      const id = `b${blankCounter}`;
      blankIds.push(id);
      const filteredOpts = [...node.options].filter(
        (opt) => (opt.textContent || "").trim().length > 0,
      );
      const options = [];
      for (let idx = 0; idx < filteredOpts.length; idx++) {
        options.push({
          id: String.fromCharCode(65 + idx),
          text: (filteredOpts[idx].textContent || "").trim(),
        });
      }
      selectOptionsByBlankId[id] = options;
      para.push({ type: "blank", id });
      return;
    }

    if (tag === "br") {
      flushPara();
      return;
    }

    if (tag === "table") {
      const rows = [
        ...node.querySelectorAll(":scope > tbody > tr, :scope > tr"),
      ];
      const rowsWithBlanks = rows.filter((r) =>
        r.querySelector('input[type="text"], input:not([type]), select'),
      );
      if (rows.length >= 2 && rowsWithBlanks.length === rows.length) {
        flushPara();
        for (const row of rows) {
          for (const child of row.childNodes) visit(child);
          flushPara();
        }
        return;
      }
    }

    const isBlock = blockTags.has(tag);
    if (isBlock) flushPara();
    for (const child of node.childNodes) visit(child);
    if (isBlock) flushPara();
  }

  visit(partEl);
  flushPara();

  if (answerTable) {
    const options = [];
    const labels = [
      ...answerTable.querySelectorAll("label.ansMS, label.ansMC"),
    ];
    for (let i = 0; i < labels.length; i++) {
      const l = labels[i];
      const labelText = (l.textContent || "").trim();
      const letter = labelText || String.fromCharCode(65 + i);
      const td = l.closest("td");
      const contentTd = td?.nextElementSibling;
      const parts = [];
      if (contentTd) {
        const img = contentTd.querySelector?.("img");
        if (img && !isSkippableImg(img)) {
          const localName = registerImage(
            img.getAttribute("src") || "",
            qNum,
            imgCounterRef,
          );
          parts.push(`[image:${localName}]`);
        }
        const t = (contentTd.textContent || "").replace(/\s+/g, " ").trim();
        if (t) parts.push(t);
      }
      options.push({ id: letter, text: parts.join(" ").trim() });
    }
    const choicesBlock = { type: "choices", id: "answer", options };
    if (isMultiSelect) choicesBlock.multiple = true;
    blocks.push(choicesBlock);
  }

  for (const [blankId, options] of Object.entries(selectOptionsByBlankId)) {
    blocks.push({ type: "choices", id: blankId, options });
  }

  return {
    blocks,
    blankIds,
    selectOptionsByBlankId,
  };
}

function extractResponse(partEl, blankIds, selectOptionsByBlankId) {
  const firstLabel = partEl.querySelector("label.ansMS, label.ansMC");
  const answerTable = firstLabel?.closest("table");
  const isMultiSelect = !!firstLabel?.classList.contains("ansMS");
  const values = {};

  if (answerTable) {
    const labels = [
      ...answerTable.querySelectorAll("label.ansMS, label.ansMC"),
    ];
    const checked = [];
    for (let i = 0; i < labels.length; i++) {
      const l = labels[i];
      const cb = l.parentElement.querySelector(
        "input[type=checkbox], input[type=radio]",
      );
      // linkedom reflects the `checked` attribute (which archive.js freezes).
      if (cb?.hasAttribute("checked")) {
        const labelText = (l.textContent || "").trim();
        checked.push(labelText || String.fromCharCode(65 + i));
      }
    }
    if (isMultiSelect) {
      if (checked.length > 0) values.answer = checked.join(",");
    } else if (checked.length > 0) values.answer = checked[0];
  }

  const blanks = [
    ...partEl.querySelectorAll(
      'input[type="text"], input:not([type]), select',
    ),
  ];
  for (let i = 0; i < blanks.length; i++) {
    const el = blanks[i];
    const id = blankIds[i] || `b${i + 1}`;
    if (el.tagName === "SELECT") {
      const sel = [...el.options].find((o) => o.hasAttribute("selected"));
      const selectedText = sel ? (sel.textContent || "").trim() : "";
      const opts = selectOptionsByBlankId?.[id] || [];
      const match = opts.find((o) => o.text === selectedText);
      values[id] = match ? match.id : selectedText;
    } else {
      values[id] = el.getAttribute("value") || "";
    }
  }
  return { values };
}

function guessQid(src) {
  if (!src) return null;
  const m = src.match(/[?&](?:id|questionId|qid|itemId)=([^&]+)/i);
  return m ? decodeURIComponent(m[1]) : null;
}

const questions = [];

for (const q of archive.questions) {
  const qNum = q.n;
  const meta = perQMeta[qNum] || {
    type: "Unknown",
    points: { earned: 0, possible: 1 },
  };
  const baseQ = {
    n: qNum,
    url: q.src || null,
    qid: guessQid(q.src),
    type: meta.type,
    points: meta.points,
    standards: standardsByQ[qNum] || [],
  };

  if (!q.partsHtml?.length) {
    questions.push({
      ...baseQ,
      prompt: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "(iframe unreadable)" }],
        },
      ],
      correct: { values: {} },
      userResponse: { values: {} },
    });
    continue;
  }

  // Parse both parts. Each partsHtml entry is the outerHTML of a .rrPartBody.
  const parsedParts = q.partsHtml.map((html) => {
    const { document: d } = parseHTML(`<!doctype html><html><body>${html}</body></html>`);
    return d.querySelector(".rrPartBody");
  });
  const correctPart = parsedParts[0];
  const userPart = parsedParts[1] || parsedParts[0];

  const imgCounterRef = { value: 0 };
  const parsed = parsePart(correctPart, qNum, imgCounterRef);
  const correct = extractResponse(
    correctPart,
    parsed.blankIds,
    parsed.selectOptionsByBlankId,
  );
  const userResponse = extractResponse(
    userPart,
    parsed.blankIds,
    parsed.selectOptionsByBlankId,
  );

  questions.push({
    ...baseQ,
    prompt: parsed.blocks,
    correct,
    userResponse,
  });
}

const manifest = {
  title,
  takenOn,
  student,
  teacher,
  numQuestions: questions.length,
  score,
  questions: questions.map((q) => ({
    n: q.n,
    url: q.url,
    qid: q.qid,
    type: q.type,
    points: q.points,
    standards: q.standards,
  })),
  standards: standardsMap,
};

// ---------- Write files ----------

await fs.mkdir(dst, { recursive: true });
await fs.mkdir(assetDst, { recursive: true });

// Clear stale per-question JSON and diagrams so renames/removals apply.
for (const entry of await fs.readdir(dst)) {
  if (/^q\d+\.json$/i.test(entry) || entry === "manifest.json") {
    await fs.unlink(path.join(dst, entry));
  }
}
for (const entry of await fs.readdir(assetDst)) {
  if (/^q\d+(-d\d+)?\.(png|jpg|jpeg|gif|svg)$/i.test(entry)) {
    await fs.unlink(path.join(assetDst, entry));
  }
}

await fs.writeFile(
  path.join(dst, "manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n",
);

for (const q of questions) {
  const file = `q${String(q.n).padStart(2, "0")}.json`;
  await fs.writeFile(
    path.join(dst, file),
    JSON.stringify(q, null, 2) + "\n",
  );
}

// ---------- Copy images from cache (fetch on miss) ----------

await fs.mkdir(IMAGE_CACHE_DIR, { recursive: true });

function cacheKey(url) {
  const hash = crypto.createHash("sha256").update(url).digest("hex").slice(0, 16);
  const extM = url.match(/\.(\w+)(?:\?|$)/);
  const ext = extM ? extM[1] : "png";
  return `${hash}.${ext}`;
}

let fromCache = 0;
let downloaded = 0;
let failed = 0;
for (const img of images) {
  const out = path.join(assetDst, img.localName);
  const cachePath = path.join(IMAGE_CACHE_DIR, cacheKey(img.url));
  try {
    let buf;
    try {
      buf = await fs.readFile(cachePath);
      fromCache += 1;
    } catch {
      const res = await fetch(img.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      buf = Buffer.from(await res.arrayBuffer());
      await fs.writeFile(cachePath, buf);
      downloaded += 1;
    }
    await fs.writeFile(out, buf);
  } catch (err) {
    console.error(`image failed: ${img.url} — ${err.message}`);
    failed += 1;
  }
}

const imgSummary =
  downloaded && fromCache
    ? `${downloaded + fromCache} images (${downloaded} fetched, ${fromCache} cached${failed ? `, ${failed} failed` : ""})`
    : downloaded
      ? `${downloaded} images fetched${failed ? ` (${failed} failed)` : ""}`
      : fromCache
        ? `${fromCache} images from cache${failed ? ` (${failed} failed)` : ""}`
        : failed
          ? `0 images (${failed} failed)`
          : `0 images`;

console.log(
  `wrote ${questions.length} questions, ${imgSummary} → ${path.relative(repoRoot, dst)} (+ ${path.relative(repoRoot, assetDst)})`,
);
console.log(
  `  title: ${title}`,
);
console.log(
  `  score: ${score.earned}/${score.possible} (${score.percent}%)`,
);

const sumEarned = questions.reduce((s, q) => s + q.points.earned, 0);
const sumPossible = questions.reduce((s, q) => s + q.points.possible, 0);
if (sumEarned !== score.earned || sumPossible !== score.possible) {
  console.warn(
    `  WARNING: per-question points sum (${sumEarned}/${sumPossible}) != manifest score`,
  );
}
