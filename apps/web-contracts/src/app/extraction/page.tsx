'use client';
import Sidebar from '@/components/sidebar';
import ExtractionClient from './client';

export default function ExtractionPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <ExtractionClient />
      </main>
    </div>
  );
}
