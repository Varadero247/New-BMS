'use client';
import Sidebar from '@/components/sidebar';
import InspectionsClient from './client';

export default function InspectionsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <InspectionsClient />
      </main>
    </div>
  );
}
