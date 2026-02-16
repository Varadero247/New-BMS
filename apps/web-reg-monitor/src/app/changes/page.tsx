'use client';
import Sidebar from '@/components/sidebar';
import ChangesClient from './client';

export default function ChangesPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <ChangesClient />
      </main>
    </div>
  );
}
