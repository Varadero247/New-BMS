'use client';
import Sidebar from '@/components/sidebar';
import CompetenciesClient from './client';

export default function CompetenciesPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <CompetenciesClient />
      </main>
    </div>
  );
}
