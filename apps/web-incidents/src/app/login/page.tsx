'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from '@ims/ui';
import { AlertOctagon } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  return (
    <LoginPage
      title="Incidents"
      subtitle="Incident Management"
      themeColor="red"
      icon={<AlertOctagon className="h-12 w-12 text-red-600" />}
      onLoginSuccess={() => router.push('/')}
    />
  );
}
