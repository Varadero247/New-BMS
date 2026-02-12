'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from '@ims/ui';
import { FolderKanban } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  return (
    <LoginPage
      title="Project Management"
      subtitle="Project Planning & Tracking"
      themeColor="sky"
      icon={<FolderKanban className="h-12 w-12 text-sky-600" />}
      onLoginSuccess={() => router.push('/')}
    />
  );
}
