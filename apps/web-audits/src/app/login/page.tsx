'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from '@ims/ui';
import { ClipboardCheck } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  return (
    <LoginPage
      title="Audits"
      subtitle="Audit Programme Management"
      themeColor="emerald"
      icon={<ClipboardCheck className="h-12 w-12 text-emerald-600" />}
      onLoginSuccess={() => router.push('/')}
    />
  );
}
