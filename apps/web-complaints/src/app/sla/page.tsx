'use client';
import Sidebar from '@/components/sidebar';
import SlaClient from './client';

export default function SlaPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <SlaClient />
      </main>
    </div>
  );
}
