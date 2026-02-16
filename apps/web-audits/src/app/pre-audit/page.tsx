'use client';
import Sidebar from '@/components/sidebar';
import PreAuditClient from './client';

export default function PreAuditPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <PreAuditClient />
      </main>
    </div>
  );
}
