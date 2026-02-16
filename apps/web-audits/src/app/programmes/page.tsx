'use client';
import Sidebar from '@/components/sidebar';
import ProgrammesClient from './client';

export default function ProgrammesPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <ProgrammesClient />
      </main>
    </div>
  );
}
