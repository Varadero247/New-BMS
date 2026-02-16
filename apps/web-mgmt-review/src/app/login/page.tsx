'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from '@ims/ui';
import { Users } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  return (
    <LoginPage
      title="Management Review"
      subtitle="ISO 9001 Clause 9.3"
      themeColor="slate"
      icon={<Users className="h-12 w-12 text-slate-600" />}
      onLoginSuccess={() => router.push('/')}
    />
  );
}
