'use client';
import Sidebar from '@/components/sidebar';
import ReviewsClient from './client';

export default function ReviewsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <ReviewsClient />
      </main>
    </div>
  );
}
