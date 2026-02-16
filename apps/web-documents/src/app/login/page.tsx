'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from '@ims/ui';
import { FileText } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  return (
    <LoginPage
      title="Document Control"
      subtitle="ISO 9001 Document Management"
      themeColor="indigo"
      icon={<FileText className="h-12 w-12 text-indigo-600" />}
      onLoginSuccess={() => router.push('/')}
    />
  );
}
