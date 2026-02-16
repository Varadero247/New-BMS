'use client';
import Sidebar from '@/components/sidebar';
import TnaClient from './client';

export default function TnaPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <TnaClient />
      </main>
    </div>
  );
}
