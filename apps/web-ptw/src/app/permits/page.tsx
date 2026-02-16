'use client';
import Sidebar from '@/components/sidebar';
import PermitsClient from './client';

export default function PermitsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <PermitsClient />
      </main>
    </div>
  );
}
