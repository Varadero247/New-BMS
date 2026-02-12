'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from '@ims/ui';
import { FolderKanban } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  return (
    <LoginPage
      title="Automotive"
      subtitle="IATF 16949 Compliance"
      themeColor="orange"
      icon={<FolderKanban className="h-12 w-12 text-orange-600" />}
      onLoginSuccess={() => router.push('/')}
    />
  );
}
