/**
 * Basic tests for client hooks
 */

import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useClients } from '../../hooks/useClients';

// Mock the ClientService
vi.mock('../../services/clients', () => ({
  ClientService: {
    getClients: vi.fn().mockResolvedValue({
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 20
    })
  }
}));

describe('useClients Basic Tests', () => {
  it('should initialize with correct default state', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 }
      }
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useClients(), { wrapper });

    // Should start in pending/loading state
    expect(result.current.isLoading || result.current.isPending).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();
  });
});