'use client';
import Sidebar from '@/components/sidebar';
import ClausesClient from './client';

export default function ClausesPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <ClausesClient />
      </main>
    </div>
  );
}
