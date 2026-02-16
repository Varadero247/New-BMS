'use client';
import Sidebar from '@/components/sidebar';
import CoursesClient from './client';

export default function CoursesPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <CoursesClient />
      </main>
    </div>
  );
}
