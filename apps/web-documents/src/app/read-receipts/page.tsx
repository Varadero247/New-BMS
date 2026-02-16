'use client';
import Sidebar from '@/components/sidebar';
import ReadReceiptsClient from './client';

export default function ReadReceiptsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <ReadReceiptsClient />
      </main>
    </div>
  );
}
