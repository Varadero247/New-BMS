'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from '@ims/ui';
import { FileText } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  return (
    <LoginPage
      title="Contract Management"
      subtitle="Contract Lifecycle Management"
      themeColor="violet"
      icon={<FileText className="h-12 w-12 text-violet-600" />}
      onLoginSuccess={() => router.push('/')}
    />
  );
}
