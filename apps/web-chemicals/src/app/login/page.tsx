'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from '@ims/ui';
import { FlaskConical } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  return (
    <LoginPage
      title="Chemical Management"
      subtitle="ISO 11014 / COSHH / GHS Compliance"
      themeColor="red"
      icon={<FlaskConical className="h-12 w-12 text-red-600" />}
      onLoginSuccess={() => router.push('/')}
    />
  );
}
