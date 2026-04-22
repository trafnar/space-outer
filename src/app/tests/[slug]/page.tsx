import { notFound } from "next/navigation";
import { getTest } from "@/lib/getTests";
import { TestViewClient } from "./test-view-client";

export default async function Page({ params }: PageProps<"/tests/[slug]">) {
  const { slug } = await params;
  const test = await getTest(slug);
  if (!test) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 pb-[50vh]">
      <TestViewClient
        manifest={test.manifest}
        questions={test.questions}
        slug={slug}
      />
    </div>
  );
}
