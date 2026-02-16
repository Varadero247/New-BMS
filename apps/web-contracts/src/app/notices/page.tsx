'use client';
import Sidebar from '@/components/sidebar';
import NoticesClient from './client';

export default function NoticesPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <NoticesClient />
      </main>
    </div>
  );
}
