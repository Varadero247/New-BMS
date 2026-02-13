'use client';
import { useRouter } from 'next/navigation';
import { LoginPage } from '@ims/ui';
import { Landmark } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  return (
    <LoginPage
      title="Finance & Accounting"
      subtitle="Financial Management"
      themeColor="indigo"
      icon={<Landmark className="h-12 w-12 text-indigo-600" />}
      onLoginSuccess={() => router.push('/')}
    />
  );
}
