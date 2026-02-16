'use client';
import Sidebar from '@/components/sidebar';
import DepreciationClient from './client';

export default function DepreciationPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <DepreciationClient />
      </main>
    </div>
  );
}
