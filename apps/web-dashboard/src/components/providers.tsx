'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RBACProvider } from '@ims/rbac/react';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <RBACProvider>
        {children}
      </RBACProvider>
    </QueryClientProvider>
  );
}
