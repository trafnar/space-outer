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

function testAssetSrc(slug: string, file: string): string {
  return `/test-assets/${encodeURIComponent(slug)}/${encodeURIComponent(file)}`;
}

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
      inlineDiagrams(question, slug);
      inlineChoiceImages(question, slug);
      return question;
    }),
  );

  return { slug, manifest, questions };
});

function inlineDiagrams(question: Question, slug: string): void {
  for (const block of question.prompt) {
    if (block.type !== "diagram") continue;
    block.imageSrc = testAssetSrc(slug, block.file);
  }
}

function inlineChoiceImages(
  question: Question,
  slug: string,
): void {
  for (const block of question.prompt) {
    if (block.type !== "choices") continue;
    for (const opt of block.options) {
      const match = opt.text.match(/^\[image:(.+)\]$/);
      if (!match) continue;
      const file = match[1];
      opt.imageSrc = testAssetSrc(slug, file);
      opt.text = "";
    }
  }
}

export async function getAllTests(): Promise<Test[]> {
  const slugs = await listSlugs();
  const tests = await Promise.all(slugs.map((slug) => getTest(slug)));
  return tests.filter((t): t is Test => t !== null);
}
