'use client';
import Sidebar from '@/components/sidebar';
import VersionsClient from './client';

export default function VersionsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <VersionsClient />
      </main>
    </div>
  );
}
