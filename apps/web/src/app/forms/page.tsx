'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthUserDto } from '@repo/shared-types';
import { ensureSession, logout } from '@/lib/api-client';

export default function FormsPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    ensureSession()
      .then((result) => {
        if (mounted) {
          setUser(result.user);
        }
      })
      .catch(() => {
        router.replace('/login');
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [router]);

  if (isLoading) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-10 sm:px-6">
        <p className="text-sm text-zinc-600">Loading session...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-10 sm:px-6">
      <section className="rounded-3xl border border-line/80 bg-white p-7 shadow-soft sm:p-10">
        <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Workspace</p>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-900">Forms Dashboard</h1>
        <p className="mt-2 text-sm text-zinc-600">Signed in as {user.email}</p>

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

        <button
          onClick={async () => {
            await logout();
            router.replace('/login');
          }}
          className="mt-6 h-10 rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          Logout
        </button>
      </section>
    </main>
  );
}
