import { notFound } from "next/navigation";
import { getTest } from "@/lib/getTests";
import { WorksheetViewClient } from "./worksheet-view-client";

export default async function Page({
  params,
}: PageProps<"/tests/[slug]/worksheet">) {
  const { slug } = await params;
  const test = await getTest(slug);
  if (!test) {
    notFound();
  }

  return (
    <WorksheetViewClient
      manifest={test.manifest}
      questions={test.questions}
      slug={slug}
    />
  );
}
