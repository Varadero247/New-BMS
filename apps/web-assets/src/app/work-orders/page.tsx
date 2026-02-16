'use client';
import Sidebar from '@/components/sidebar';
import WorkOrdersClient from './client';

export default function WorkOrdersPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <WorkOrdersClient />
      </main>
    </div>
  );
}
