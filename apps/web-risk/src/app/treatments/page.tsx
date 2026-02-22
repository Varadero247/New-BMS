'use client';
import Sidebar from '@/components/sidebar';
import TreatmentsClient from './client';

export default function TreatmentsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <TreatmentsClient />
      </main>
    </div>
  );
}
