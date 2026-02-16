'use client';
import Sidebar from '@/components/sidebar';
import LocationsClient from './client';

export default function LocationsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <LocationsClient />
      </main>
    </div>
  );
}
