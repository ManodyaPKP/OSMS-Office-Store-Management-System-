import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Reduce loading time by caching data
      staleTime: 5 * 60 * 1000, // 5 minutes - consider data fresh for 5 min
      gcTime: 10 * 60 * 1000, // 10 minutes - keep unused data in cache
      retry: 1, // Retry failed requests once
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});
