import { notFound } from "next/navigation";
import { getTest } from "@/lib/getTests";
import { TestsClient } from "./tests-client";

export default async function Page({ params }: PageProps<"/tests/[slug]">) {
  const { slug } = await params;
  const test = await getTest(slug);
  if (!test) {
    notFound();
  }

  return <TestsClient manifest={test.manifest} questions={test.questions} />;
}
