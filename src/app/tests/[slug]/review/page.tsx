import { notFound } from "next/navigation";
import { getTest } from "@/lib/getTests";
import { ReviewViewClient } from "./review-view-client";

export default async function Page({
  params,
}: PageProps<"/tests/[slug]/review">) {
  const { slug } = await params;
  const test = await getTest(slug);
  if (!test) {
    notFound();
  }

  return (
    <ReviewViewClient
      manifest={test.manifest}
      questions={test.questions}
      slug={slug}
    />
  );
}
