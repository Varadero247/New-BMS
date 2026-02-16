'use client';
import Sidebar from '@/components/sidebar';
import ComplaintsClient from './client';

export default function ComplaintsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <ComplaintsClient />
      </main>
    </div>
  );
}
