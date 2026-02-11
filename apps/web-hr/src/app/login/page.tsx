'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from '@ims/ui';
import { Users } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  return (
    <LoginPage
      title="Human Resources"
      subtitle="HR Management"
      themeColor="purple"
      icon={<Users className="h-12 w-12 text-purple-600" />}
      onLoginSuccess={() => router.push('/')}
    />
  );
}
