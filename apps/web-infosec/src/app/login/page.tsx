'use client';
import { useRouter } from 'next/navigation';
import { LoginPage } from '@ims/ui';
import { Shield } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  return (
    <LoginPage
      title="Information Security"
      subtitle="ISO 27001 / 27701 ISMS"
      themeColor="teal"
      icon={<Shield className="h-12 w-12 text-teal-600" />}
      onLoginSuccess={() => router.push('/')}
    />
  );
}
