'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from '@ims/ui';
import { Package } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  return (
    <LoginPage
      title="Inventory"
      subtitle="Inventory Control"
      themeColor="orange"
      icon={<Package className="h-12 w-12 text-orange-600" />}
      onLoginSuccess={() => router.push('/')}
    />
  );
}
