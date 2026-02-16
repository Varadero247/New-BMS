'use client';
import Sidebar from '@/components/sidebar';
import RegulatoryClient from './client';

export default function RegulatoryPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <RegulatoryClient />
      </main>
    </div>
  );
}
