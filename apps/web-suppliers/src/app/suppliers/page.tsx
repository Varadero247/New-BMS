'use client';
import Sidebar from '@/components/sidebar';
import SuppliersClient from './client';

export default function SuppliersPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <SuppliersClient />
      </main>
    </div>
  );
}
