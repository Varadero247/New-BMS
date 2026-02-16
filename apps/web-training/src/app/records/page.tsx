'use client';
import Sidebar from '@/components/sidebar';
import RecordsClient from './client';

export default function RecordsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <RecordsClient />
      </main>
    </div>
  );
}
