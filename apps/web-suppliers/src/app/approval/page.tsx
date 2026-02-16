'use client';
import Sidebar from '@/components/sidebar';
import ApprovalClient from './client';

export default function ApprovalPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <ApprovalClient />
      </main>
    </div>
  );
}
