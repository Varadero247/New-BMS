'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from '@ims/ui';
import { MessageSquareWarning } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  return (
    <LoginPage
      title="Complaints"
      subtitle="Complaint Management"
      themeColor="orange"
      icon={<MessageSquareWarning className="h-12 w-12 text-orange-600" />}
      onLoginSuccess={() => router.push('/')}
    />
  );
}
