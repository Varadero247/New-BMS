'use client';
import Sidebar from '@/components/sidebar';
import AgendaClient from './client';

export default function AgendaPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <AgendaClient />
      </main>
    </div>
  );
}
