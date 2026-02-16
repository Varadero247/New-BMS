'use client';
import Sidebar from '@/components/sidebar';
import ToolboxTalksClient from './client';

export default function ToolboxTalksPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <ToolboxTalksClient />
      </main>
    </div>
  );
}
