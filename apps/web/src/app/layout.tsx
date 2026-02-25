import type { Metadata } from 'next';
import { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Formora',
  description: 'Formora monorepo starter',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(0,0,0,0.06),transparent_35%),radial-gradient(circle_at_80%_90%,rgba(0,0,0,0.05),transparent_30%)]" />
        {children}
      </body>
    </html>
  );
}
