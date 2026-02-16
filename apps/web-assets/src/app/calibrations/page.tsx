'use client';
import Sidebar from '@/components/sidebar';
import CalibrationsClient from './client';

export default function CalibrationsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <CalibrationsClient />
      </main>
    </div>
  );
}
