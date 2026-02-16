'use client';
import Sidebar from '@/components/sidebar';
import IncidentsClient from './client';

export default function IncidentsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <IncidentsClient />
      </main>
    </div>
  );
}
