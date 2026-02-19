'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from '@ims/ui';
import { Wallet } from 'lucide-react';

export default function Login() { const router = useRouter();
  return (
    <LoginPage
      title="Payroll"
      subtitle="Payroll Management"
      themeColor="teal"
      icon={<Wallet className="h-12 w-12 text-teal-600" />}
      onLoginSuccess={() => router.push('/')}
    />
  ); }
