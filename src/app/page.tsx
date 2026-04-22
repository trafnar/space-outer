import Link from "next/link";
import { listTests } from "@/lib/getTests";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const tests = await listTests();

  return (
    <div className="p-8">
      {tests.length === 0 ? (
        <div>No tests yet.</div>
      ) : (
        tests.map(({ slug, manifest }) => (
          <Button
            key={slug}
            variant="link"
            render={<Link href={`/tests/${slug}`} />}
          >
            {manifest.title}
          </Button>
        ))
      )}
    </div>
  );
}
