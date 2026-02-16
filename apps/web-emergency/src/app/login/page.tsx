'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from '@ims/ui';
import { Flame } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  return (
    <LoginPage
      title="Emergency"
      subtitle="Fire, Emergency & Disaster Management"
      themeColor="red"
      icon={<Flame className="h-12 w-12" style={{ color: '#F04B5A' }} />}
      onLoginSuccess={() => router.push('/')}
    />
  );
}
