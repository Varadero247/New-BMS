'use client';
import Sidebar from '@/components/sidebar';
import ScorecardsClient from './client';

export default function ScorecardsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <ScorecardsClient />
      </main>
    </div>
  );
}
