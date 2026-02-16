'use client';
import Sidebar from '@/components/sidebar';
import RenewalsClient from './client';

export default function RenewalsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <RenewalsClient />
      </main>
    </div>
  );
}
