'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemingProvider } from '@ims/theming';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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
      <ThemingProvider apiUrl={API_URL}>{children}</ThemingProvider>
    </QueryClientProvider>
  );
}
