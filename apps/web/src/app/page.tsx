import Link from 'next/link';
import { getApiHealth } from '@/lib/api-client';

export default async function HomePage() {
  let healthMessage = 'API not reachable yet';

  try {
    const health = await getApiHealth();
    healthMessage = `${health.service}: ${health.status} (${health.timestamp})`;
  } catch {
    healthMessage = 'API health check failed';
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="rounded-3xl border border-line/80 bg-white p-7 shadow-soft sm:p-10">
        <p className="mb-2 text-xs uppercase tracking-[0.16em] text-zinc-500">Formora</p>
        <h1 className="text-3xl font-semibold text-zinc-900">Starter Dashboard</h1>
        <p className="mt-2 text-sm text-zinc-600">{healthMessage}</p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <Link
            href="/login"
            className="rounded-xl border border-line bg-white px-4 py-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
          >
            Auth: Login / Register
          </Link>
          <Link
            href="/forms"
            className="rounded-xl border border-line bg-white px-4 py-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
          >
            Dashboard: Forms
          </Link>
          <Link
            href="/f/sample-form"
            className="rounded-xl border border-line bg-white px-4 py-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 sm:col-span-2"
          >
            Public Form: /f/sample-form
          </Link>
        </div>
      </div>
    </main>
  );
}
