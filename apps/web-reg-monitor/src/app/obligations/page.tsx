'use client';
import Sidebar from '@/components/sidebar';
import ObligationsClient from './client';

export default function ObligationsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <ObligationsClient />
      </main>
    </div>
  );
}
