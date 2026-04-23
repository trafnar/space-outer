import Link from "next/link";
import { IconArrowLeft, IconFileSearch } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";

export function NotFoundContent({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-1 items-center justify-center p-6 pb-16">
      <Empty>
        <EmptyMedia>
          <IconFileSearch />
        </EmptyMedia>
        <EmptyHeader>{title}</EmptyHeader>
        <EmptyDescription>{description}</EmptyDescription>
        <EmptyContent>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/" />}
          >
            <IconArrowLeft />
            Back to tests
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
