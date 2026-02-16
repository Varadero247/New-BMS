'use client';
import Sidebar from '@/components/sidebar';
import RisksClient from './client';

export default function RisksPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <RisksClient />
      </main>
    </div>
  );
}
