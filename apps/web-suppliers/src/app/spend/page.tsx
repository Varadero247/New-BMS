'use client';
import Sidebar from '@/components/sidebar';
import SpendClient from './client';

export default function SpendPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <SpendClient />
      </main>
    </div>
  );
}
