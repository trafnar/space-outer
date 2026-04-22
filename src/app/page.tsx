import Link from "next/link";
import { listTests } from "@/lib/getTests";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const tests = await listTests();

  return (
    <div className="p-8 flex flex-col gap-1 items-start">
      {tests.length === 0 ? (
        <div>No tests yet.</div>
      ) : (
        tests.map(({ slug, manifest }) => (
          <Button
            key={slug}
            variant="link"
            render={<Link href={`/tests/${slug}`} />}
            nativeButton={false}
          >
            {manifest.title}
          </Button>
        ))
      )}
    </div>
  );
}
