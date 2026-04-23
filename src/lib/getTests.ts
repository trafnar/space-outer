import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import type {
  Manifest,
  Question,
  Test,
  TestSummary,
} from "@/data/types";

const TESTS_ROOT = path.join(process.cwd(), "src/data/tests");
const SLUG_RE = /^[a-z0-9-]+$/;

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await fs.readFile(filePath, "utf8")) as T;
}

async function listSlugs(): Promise<string[]> {
  const entries = await fs.readdir(TESTS_ROOT, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory() && SLUG_RE.test(e.name))
    .map((e) => e.name)
    .sort();
}

export async function listTestSlugs(): Promise<string[]> {
  return listSlugs();
}

export async function listTests(): Promise<TestSummary[]> {
  const slugs = await listSlugs();
  const tests = await Promise.all(
    slugs.map(async (slug) => ({
      slug,
      manifest: await readJson<Manifest>(
        path.join(TESTS_ROOT, slug, "manifest.json"),
      ),
    })),
  );
  return tests.sort((a, b) => {
    const ta = a.manifest.takenOn ? Date.parse(a.manifest.takenOn) : NaN;
    const tb = b.manifest.takenOn ? Date.parse(b.manifest.takenOn) : NaN;
    if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
    if (Number.isNaN(ta)) return 1;
    if (Number.isNaN(tb)) return -1;
    return tb - ta;
  });
}

export const getTest = cache(async function getTest(
  slug: string,
): Promise<Test | null> {
  if (!SLUG_RE.test(slug)) return null;
  const dir = path.join(TESTS_ROOT, slug);

  let manifest: Manifest;
  try {
    manifest = await readJson<Manifest>(path.join(dir, "manifest.json"));
  } catch {
    return null;
  }

  const questions = await Promise.all(
    manifest.questions.map(async (q) => {
      const file = `q${String(q.n).padStart(2, "0")}.json`;
      const question = await readJson<Question>(path.join(dir, file));
      await inlineDiagrams(question, dir);
      await inlineChoiceImages(question, dir);
      return question;
    }),
  );

  return { slug, manifest, questions };
});

async function inlineDiagrams(question: Question, dir: string): Promise<void> {
  await Promise.all(
    question.prompt.map(async (block) => {
      if (block.type !== "diagram") return;
      block.svg = await loadInlineImageHtml(
        path.join(dir, block.file),
        block.alt,
      );
    }),
  );
}

async function inlineChoiceImages(
  question: Question,
  dir: string,
): Promise<void> {
  const tasks: Promise<void>[] = [];
  for (const block of question.prompt) {
    if (block.type !== "choices") continue;
    for (const opt of block.options) {
      const match = opt.text.match(/^\[image:(.+)\]$/);
      if (!match) continue;
      const file = match[1];
      tasks.push(
        (async () => {
          opt.imageSrc = await loadAsDataUrl(path.join(dir, file));
          opt.text = "";
        })(),
      );
    }
  }
  await Promise.all(tasks);
}

async function loadInlineImageHtml(
  filePath: string,
  alt?: string,
): Promise<string> {
  if (filePath.toLowerCase().endsWith(".svg")) {
    return fs.readFile(filePath, "utf8");
  }
  const src = await loadAsDataUrl(filePath);
  const altAttr = alt ? ` alt="${escapeAttr(alt)}"` : ' alt=""';
  return `<img src="${src}"${altAttr} />`;
}

async function loadAsDataUrl(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();
  const mime =
    ext === ".svg"
      ? "image/svg+xml"
      : ext === ".jpg" || ext === ".jpeg"
        ? "image/jpeg"
        : ext === ".gif"
          ? "image/gif"
          : "image/png";
  const buf = await fs.readFile(filePath);
  return `data:${mime};base64,${buf.toString("base64")}`;
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function getAllTests(): Promise<Test[]> {
  const slugs = await listSlugs();
  const tests = await Promise.all(slugs.map((slug) => getTest(slug)));
  return tests.filter((t): t is Test => t !== null);
}
