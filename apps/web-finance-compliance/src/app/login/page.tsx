'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from '@ims/ui';
import { Shield } from 'lucide-react';

export default function Login() {
  const router = useRouter();

  return (
    <LoginPage
      title="Financial Compliance"
      subtitle="Regulatory & Tax Compliance"
      themeColor="green"
      icon={<Shield className="h-8 w-8 text-emerald-600" />}
      onLoginSuccess={() => router.push('/')}
    />
  );
}
