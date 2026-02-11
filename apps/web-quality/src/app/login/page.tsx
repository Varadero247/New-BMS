'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from '@ims/ui';
import { Award } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  return (
    <LoginPage
      title="Quality"
      subtitle="ISO 9001 Compliance"
      themeColor="blue"
      icon={<Award className="h-12 w-12 text-blue-600" />}
      onLoginSuccess={() => router.push('/')}
    />
  );
}
