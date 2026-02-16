'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from '@ims/ui';
import { ShieldAlert } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  return (
    <LoginPage
      title="Risk & CAPA"
      subtitle="ISO 31000 Risk Management"
      themeColor="red"
      icon={<ShieldAlert className="h-12 w-12 text-red-600" />}
      onLoginSuccess={() => router.push('/')}
    />
  );
}
