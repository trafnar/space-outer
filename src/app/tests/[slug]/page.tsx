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
    <TestViewClient manifest={test.manifest} questions={test.questions} />
  );
}
