'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useThemeStore } from '@/stores';
import { SessionBootstrap } from '@/components/auth/session-bootstrap';

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  });

function ThemeInitializer() {
  const isDark = useThemeStore((s) => s.isDark);

  useEffect(() => {
    const theme = isDark ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.classList.toggle('light', !isDark);
  }, [isDark]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  useEffect(
    () =>
      useAuthStore.subscribe((state, previous) => {
        if (
          state.user?.id !== previous.user?.id ||
          (previous.isAuthenticated && !state.isAuthenticated)
        )
          queryClient.clear();
      }),
    [queryClient]
  );
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeInitializer />
      <SessionBootstrap />
      {children}
    </QueryClientProvider>
  );
}
