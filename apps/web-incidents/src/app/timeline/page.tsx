'use client';
import Sidebar from '@/components/sidebar';
import TimelineClient from './client';

export default function TimelinePage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <TimelineClient />
      </main>
    </div>
  );
}
