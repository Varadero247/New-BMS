'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from '@ims/ui';
import { Package } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  return (
    <LoginPage
      title="Asset Management"
      subtitle="ISO 55001 Asset Lifecycle"
      themeColor="cyan"
      icon={<Package className="h-12 w-12 text-cyan-600" />}
      onLoginSuccess={() => router.push('/')}
    />
  );
}
