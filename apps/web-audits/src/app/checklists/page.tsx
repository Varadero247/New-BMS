'use client';
import Sidebar from '@/components/sidebar';
import ChecklistsClient from './client';

export default function ChecklistsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <ChecklistsClient />
      </main>
    </div>
  );
}
