'use client';

import { useEffect, useState } from 'react';
import type { AuthUserDto } from '@repo/shared-types';
import { ensureSession } from '@/lib/api-client';

export default function DashboardProfilePage() {
  const [user, setUser] = useState<AuthUserDto | null>(null);

  useEffect(() => {
    let isMounted = true;

    ensureSession()
      .then((result) => {
        if (isMounted) {
          setUser(result.user);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!user) {
    return <p className="text-sm text-zinc-600">Loading profile...</p>;
  }

  return (
    <main>
      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Profile</p>
      <h1 className="mt-1 text-2xl font-semibold text-zinc-900">Account details</h1>

      <dl className="mt-5 grid gap-3">
        <div className="rounded-xl border border-line p-3">
          <dt className="text-xs text-zinc-500">Name</dt>
          <dd className="text-sm font-medium text-zinc-900">{user.name || 'Not set'}</dd>
        </div>
        <div className="rounded-xl border border-line p-3">
          <dt className="text-xs text-zinc-500">Email</dt>
          <dd className="text-sm font-medium text-zinc-900">{user.email}</dd>
        </div>
        <div className="rounded-xl border border-line p-3">
          <dt className="text-xs text-zinc-500">Provider</dt>
          <dd className="text-sm font-medium text-zinc-900">{user.provider}</dd>
        </div>
        <div className="rounded-xl border border-line p-3">
          <dt className="text-xs text-zinc-500">Created at</dt>
          <dd className="text-sm font-medium text-zinc-900">
            {new Date(user.createdAt).toLocaleString()}
          </dd>
        </div>
      </dl>
    </main>
  );
}
