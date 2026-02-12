'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from '@ims/ui';
import { Shield } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  return (
    <LoginPage
      title="Aerospace"
      subtitle="AS9100D Compliance"
      themeColor="indigo"
      icon={<Shield className="h-12 w-12 text-indigo-600" />}
      onLoginSuccess={() => router.push('/')}
    />
  );
}
