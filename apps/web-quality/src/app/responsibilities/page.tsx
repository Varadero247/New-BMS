'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ResponsibilitiesPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/raci');
  }, [router]);

  return (
    <div className="p-6 flex items-center justify-center min-h-[50vh]">
      <p className="text-muted-foreground text-sm">Redirecting to RACI Matrix...</p>
    </div>
  );
}
