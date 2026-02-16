'use client';
import Sidebar from '@/components/sidebar';
import CapaClient from './client';

export default function CapaPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <CapaClient />
      </main>
    </div>
  );
}
