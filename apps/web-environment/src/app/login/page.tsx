'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from '@ims/ui';
import { Leaf } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  return (
    <LoginPage
      title="Environment"
      subtitle="ISO 14001 Compliance"
      themeColor="green"
      icon={<Leaf className="h-12 w-12 text-green-600" />}
      onLoginSuccess={() => router.push('/')}
    />
  );
}
