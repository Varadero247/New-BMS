'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from '@ims/ui';
import { Truck } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  return (
    <LoginPage
      title="Supplier Management"
      subtitle="Supplier Lifecycle & Performance"
      themeColor="teal"
      icon={<Truck className="h-12 w-12 text-teal-600" />}
      onLoginSuccess={() => router.push('/')}
    />
  );
}
