'use client';
import Sidebar from '@/components/sidebar';
import CommunicationsClient from './client';

export default function CommunicationsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <CommunicationsClient />
      </main>
    </div>
  );
}
