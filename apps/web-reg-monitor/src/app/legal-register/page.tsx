'use client';
import Sidebar from '@/components/sidebar';
import LegalRegisterClient from './client';

export default function LegalRegisterPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <LegalRegisterClient />
      </main>
    </div>
  );
}
