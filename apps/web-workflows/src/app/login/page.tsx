'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from '@ims/ui';
import { GitBranch } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  return (
    <LoginPage
      title="Workflows"
      subtitle="Workflow Automation"
      themeColor="amber"
      icon={<GitBranch className="h-12 w-12 text-amber-600" />}
      onLoginSuccess={() => router.push('/')}
    />
  );
}
