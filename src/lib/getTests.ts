import fs from "node:fs/promises";
import path from "node:path";
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

export async function listTests(): Promise<TestSummary[]> {
  const slugs = await listSlugs();
  return Promise.all(
    slugs.map(async (slug) => ({
      slug,
      manifest: await readJson<Manifest>(
        path.join(TESTS_ROOT, slug, "manifest.json"),
      ),
    })),
  );
}

export async function getTest(slug: string): Promise<Test | null> {
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
      await inlineDiagramSvgs(question, dir);
      return question;
    }),
  );

  return { slug, manifest, questions };
}

async function inlineDiagramSvgs(
  question: Question,
  dir: string,
): Promise<void> {
  await Promise.all(
    question.prompt.map(async (block) => {
      if (block.type === "diagram") {
        block.svg = await fs.readFile(path.join(dir, block.file), "utf8");
      }
    }),
  );
}

export async function getAllTests(): Promise<Test[]> {
  const slugs = await listSlugs();
  const tests = await Promise.all(slugs.map((slug) => getTest(slug)));
  return tests.filter((t): t is Test => t !== null);
}
