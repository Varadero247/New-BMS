'use client';
import Sidebar from '@/components/sidebar';
import MethodStatementsClient from './client';

export default function MethodStatementsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <MethodStatementsClient />
      </main>
    </div>
  );
}
