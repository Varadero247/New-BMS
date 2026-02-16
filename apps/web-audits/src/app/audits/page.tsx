'use client';
import Sidebar from '@/components/sidebar';
import AuditsClient from './client';

export default function AuditsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <AuditsClient />
      </main>
    </div>
  );
}
