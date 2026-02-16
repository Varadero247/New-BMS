'use client';
import Sidebar from '@/components/sidebar';
import FindingsClient from './client';

export default function FindingsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <FindingsClient />
      </main>
    </div>
  );
}
