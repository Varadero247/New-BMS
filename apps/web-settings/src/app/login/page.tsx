'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from '@ims/ui';
import { Settings } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  return (
    <LoginPage
      title="Settings"
      subtitle="System Configuration"
      themeColor="blue"
      icon={<Settings className="h-12 w-12 text-blue-600" />}
      onLoginSuccess={() => router.push('/')}
    />
  );
}
