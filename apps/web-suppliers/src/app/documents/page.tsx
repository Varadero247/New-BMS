'use client';
import Sidebar from '@/components/sidebar';
import DocumentsClient from './client';

export default function DocumentsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <DocumentsClient />
      </main>
    </div>
  );
}
