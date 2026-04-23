"use client";

import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useReviewSheet } from "@/lib/reviewSheet";

export function HomeReviewButton({ slug }: { slug: string }) {
  const [reviewSheet] = useReviewSheet(slug);
  if (reviewSheet.size === 0) return null;
  return (
    <Link
      href={`/tests/${slug}/review`}
      className="group/pad bg-debug-red relative z-10 flex items-center justify-end h-full pt-[13px] -mt-[13px] pb-[13px] -mb-[13px] pl-3 -ml-3 pr-3 -mr-3"
    >
      <Button
        variant="outline"
        size="xs"
        nativeButton={false}
        render={<div />}
      >
        Worksheet
        <IconArrowRight data-icon="inline-end" />
      </Button>
    </Link>
  );
}
