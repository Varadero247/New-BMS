'use client';
import Sidebar from '@/components/sidebar';
import ApprovalsClient from './client';

export default function ApprovalsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <ApprovalsClient />
      </main>
    </div>
  );
}
