'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from '@ims/ui';
import { Shield } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  return (
    <LoginPage
      title="Health & Safety"
      subtitle="ISO 45001 Compliance"
      themeColor="red"
      icon={<Shield className="h-12 w-12 text-red-600" />}
      onLoginSuccess={() => router.push('/')}
    />
  );
}
