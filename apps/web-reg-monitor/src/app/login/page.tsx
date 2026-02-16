'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from '@ims/ui';
import { Scale } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  return (
    <LoginPage
      title="Regulatory Monitor"
      subtitle="Reg Change Tracking"
      themeColor="sky"
      icon={<Scale className="h-12 w-12 text-sky-600" />}
      onLoginSuccess={() => router.push('/')}
    />
  );
}
