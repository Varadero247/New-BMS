'use client';
import Sidebar from '@/components/sidebar';
import AssetsClient from './client';

export default function AssetsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <AssetsClient />
      </main>
    </div>
  );
}
