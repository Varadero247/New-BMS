'use client';
import Sidebar from '@/components/sidebar';
import ConflictsClient from './client';

export default function ConflictsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <ConflictsClient />
      </main>
    </div>
  );
}
