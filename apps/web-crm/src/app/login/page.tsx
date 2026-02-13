'use client';
import { useRouter } from 'next/navigation';
import { LoginPage } from '@ims/ui';
import { Users } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  return (
    <LoginPage
      title="CRM"
      subtitle="Customer Relationship Management"
      themeColor="violet"
      icon={<Users className="h-12 w-12 text-violet-600" />}
      onLoginSuccess={() => router.push('/')}
    />
  );
}
