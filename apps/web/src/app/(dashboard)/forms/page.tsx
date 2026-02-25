import Link from 'next/link';

export default function FormsPage() {
  return (
    <main>
      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Forms</p>
      <h1 className="mt-1 text-2xl font-semibold text-zinc-900">Forms workspace</h1>
      <p className="mt-3 text-sm text-zinc-600">Select a form area to continue.</p>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        <li>
          <Link
            href="/forms/sample-id/builder"
            className="block rounded-xl border border-line bg-white px-4 py-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
          >
            Open builder placeholder
          </Link>
        </li>
        <li>
          <Link
            href="/forms/sample-id/responses"
            className="block rounded-xl border border-line bg-white px-4 py-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
          >
            Open responses placeholder
          </Link>
        </li>
      </ul>
    </main>
  );
}
