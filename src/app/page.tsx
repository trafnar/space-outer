import Image from "next/image";
import Link from "next/link";
import { listTests } from "@/lib/getTests";
import { TypoH1, TypoMuted } from "@/components/ui/typo";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PointsBadge, type PointsIndicator } from "@/components/PointsBadge";
import { HomeReviewButton } from "@/components/HomeReviewButton";

function indicatorForPercent(percent: number): PointsIndicator {
  if (percent >= 75) return "correct";
  if (percent >= 50) return "partial";
  return "wrong";
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function Home() {
  const tests = await listTests();

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16 flex flex-col items-center">
      <Image
        src="/logo.svg"
        alt="Space Outer"
        width={64}
        height={64}
        className="size-16"
        priority
      />
      <TypoH1 className="mt-6 text-center text-4xl!">Space Outer</TypoH1>
      <TypoMuted className="mt-2 text-center">
        Review test scores and make printable worksheets
      </TypoMuted>

      <div className="mt-12 w-full">
        {tests.length === 0 ? (
          <TypoMuted className="text-center">No tests yet.</TypoMuted>
        ) : (
          <Table className="[&_:is(th,td):first-child]:pl-3 [&_:is(th,td):last-child]:pr-3">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-full">Test</TableHead>
                <TableHead>Taken</TableHead>
                <TableHead>Score</TableHead>
                <TableHead />
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tests.map(({ slug, manifest }) => (
                <TableRow
                  key={slug}
                  className="relative cursor-pointer hover:bg-transparent"
                >
                  <TableCell className="w-full max-w-0">
                    <Link
                      href={`/tests/${slug}`}
                      className="block truncate font-semibold underline-offset-4 hover:underline after:absolute after:inset-x-0 after:top-0 after:-bottom-px after:bg-debug-red focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring"
                    >
                      {manifest.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(manifest.takenOn)}
                  </TableCell>
                  <TableCell>
                    <PointsBadge
                      earned={manifest.score.earned}
                      possible={manifest.score.possible}
                      forceIndicator={indicatorForPercent(
                        manifest.score.percent,
                      )}
                    />
                  </TableCell>
                  <TableCell className="tabular-nums text-xs font-semibold">
                    {manifest.score.percent}
                    <span className="opacity-45 pointer-events-none">%</span>
                  </TableCell>
                  <TableCell>
                    <HomeReviewButton slug={slug} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </main>
  );
}
