'use client';
import Sidebar from '@/components/sidebar';
import InductionsClient from './client';

export default function InductionsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <InductionsClient />
      </main>
    </div>
  );
}
