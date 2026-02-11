'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from '@ims/ui';
import { LayoutDashboard } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  return (
    <LoginPage
      title="IMS Dashboard"
      subtitle="Integrated Management System"
      themeColor="indigo"
      icon={<LayoutDashboard className="h-12 w-12 text-indigo-600" />}
      onLoginSuccess={() => router.push('/')}
    />
  );
}
