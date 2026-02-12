'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from '@ims/ui';
import { Shield } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  return (
    <LoginPage
      title="Medical Devices"
      subtitle="ISO 13485 Compliance"
      themeColor="teal"
      icon={<Shield className="h-12 w-12 text-teal-600" />}
      onLoginSuccess={() => router.push('/')}
    />
  );
}
