'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import type { AuthUserDto } from '@repo/shared-types';
import { ensureSession, logout } from '@/lib/api-client';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    ensureSession()
      .then((result) => {
        if (isMounted) {
          setUser(result.user);
        }
      })
      .catch(() => {
        router.replace('/login');
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (isLoading) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10 sm:px-6">
        <p className="text-sm text-zinc-600">Restoring your session...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/profile', label: 'Profile' },
    { href: '/forms', label: 'Forms' },
  ];

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-2xl border border-line/80 bg-white p-4 shadow-soft">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Formora</p>
          <p className="mt-3 truncate text-sm font-semibold text-zinc-900">
            {user.name || user.email}
          </p>
          <p className="truncate text-xs text-zinc-500">{user.email}</p>

          <nav className="mt-5 space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-3 py-2 text-sm transition ${
                    active
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={async () => {
              await logout();
              setUser(null);
              router.replace('/login');
            }}
            className="mt-6 h-10 w-full rounded-lg border border-line bg-white text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Logout
          </button>
        </aside>

        <section className="rounded-2xl border border-line/80 bg-white p-5 shadow-soft sm:p-6">
          {children}
        </section>
      </div>
    </div>
  );
}
