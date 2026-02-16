'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from '@ims/ui';
import { GraduationCap } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  return (
    <LoginPage
      title="Training"
      subtitle="Competence Management"
      themeColor="purple"
      icon={<GraduationCap className="h-12 w-12 text-purple-600" />}
      onLoginSuccess={() => router.push('/')}
    />
  );
}
