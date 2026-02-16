'use client';
import Sidebar from '@/components/sidebar';
import SearchClient from './client';

export default function SearchPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <SearchClient />
      </main>
    </div>
  );
}
