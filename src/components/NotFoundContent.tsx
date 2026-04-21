import Link from "next/link";

export function NotFoundContent({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 opacity-60">{description}</p>
      <Link
        href="/"
        className="mt-4 inline-block text-teal-700 hover:underline"
      >
        Back to tests
      </Link>
    </main>
  );
}
