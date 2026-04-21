import Link from "next/link";
import { listTests } from "@/lib/getTests";

export default async function Home() {
  const tests = await listTests();

  return (
    <>
      {tests.length === 0 ? (
        <div>No tests yet.</div>
      ) : (
        tests.map(({ slug, manifest }) => (
          <Link
            className="text-teal-700 hover:underline"
            href={`/tests/${slug}`}
            key={slug}
          >
            {manifest.title}
          </Link>
        ))
      )}
    </>
  );
}
