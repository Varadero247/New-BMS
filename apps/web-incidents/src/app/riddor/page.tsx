'use client';
import Sidebar from '@/components/sidebar';
import RiddorClient from './client';

export default function RiddorPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <RiddorClient />
      </main>
    </div>
  );
}
