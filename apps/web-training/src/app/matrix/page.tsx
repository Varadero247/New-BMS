'use client';
import Sidebar from '@/components/sidebar';
import MatrixClient from './client';

export default function MatrixPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <MatrixClient />
      </main>
    </div>
  );
}
