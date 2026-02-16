'use client';
import Sidebar from '@/components/sidebar';
import InvestigationClient from './client';

export default function InvestigationPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <InvestigationClient />
      </main>
    </div>
  );
}
