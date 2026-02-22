'use client';
import Sidebar from '@/components/sidebar';
import CategoriesClient from './client';

export default function CategoriesPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <CategoriesClient />
      </main>
    </div>
  );
}