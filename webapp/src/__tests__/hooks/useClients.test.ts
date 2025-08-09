/**
 * Tests for client-related hooks
 */

import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  useClients, 
  useClient, 
  useClientSearch,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
  useActivateClient,
  useSuspendClient
} from '../../hooks/useClients';
import { ClientStatus } from '../../types';
import { createTestQueryClient, TestQueryClientProvider } from '../utils/test-utils';

// Mock the ClientService
vi.mock('../../services/clients', () => ({
  ClientService: {
    getClients: vi.fn(),
    getClientById: vi.fn(),
    searchClients: vi.fn(),
    createClient: vi.fn(),
    updateClient: vi.fn(),
    deleteClient: vi.fn(),
    activateClient: vi.fn(),
    suspendClient: vi.fn()
  }
}));

const mockClientsData = {
  content: [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
      status: ClientStatus.ACTIVE,
      active: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ],
  totalElements: 1,
  totalPages: 1,
  number: 0,
  size: 20
};

const mockClient = mockClientsData.content[0];

describe('Client Hooks', () => {
  let queryClient: ReturnType<typeof createTestQueryClient>;
  
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestQueryClientProvider client={queryClient}>
      {children}
    </TestQueryClientProvider>
  );

  describe('useClients', () => {
    it('should fetch clients successfully', async () => {
      const { ClientService } = require('../../services/clients');
      ClientService.getClients.mockResolvedValue(mockClientsData);

      const { result } = renderHook(
        () => useClients({ page: 0, size: 20 }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockClientsData);
      expect(ClientService.getClients).toHaveBeenCalledWith({ page: 0, size: 20 });
    });

    it('should handle fetch clients error', async () => {
      const { ClientService } = require('../../services/clients');
      const error = new Error('Failed to fetch clients');
      ClientService.getClients.mockRejectedValue(error);

      const { result } = renderHook(
        () => useClients({ page: 0, size: 20 }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });
  });

  describe('useClient', () => {
    it('should fetch single client successfully', async () => {
      const { ClientService } = require('../../services/clients');
      ClientService.getClientById.mockResolvedValue(mockClient);

      const { result } = renderHook(
        () => useClient(1),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockClient);
      expect(ClientService.getClientById).toHaveBeenCalledWith(1);
    });

    it('should not fetch when disabled', () => {
      const { ClientService } = require('../../services/clients');
      
      renderHook(
        () => useClient(1, false),
        { wrapper }
      );

      expect(ClientService.getClientById).not.toHaveBeenCalled();
    });

    it('should handle fetch client error', async () => {
      const { ClientService } = require('../../services/clients');
      const error = new Error('Client not found');
      ClientService.getClientById.mockRejectedValue(error);

      const { result } = renderHook(
        () => useClient(999),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });
  });

  describe('useClientSearch', () => {
    const searchParams = {
      query: 'John',
      status: ClientStatus.ACTIVE,
      page: 0,
      size: 20
    };

    it('should search clients successfully', async () => {
      const { ClientService } = require('../../services/clients');
      ClientService.searchClients.mockResolvedValue(mockClientsData);

      const { result } = renderHook(
        () => useClientSearch(searchParams),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockClientsData);
      expect(ClientService.searchClients).toHaveBeenCalledWith(searchParams);
    });

    it('should not search when disabled', () => {
      const { ClientService } = require('../../services/clients');
      
      renderHook(
        () => useClientSearch(searchParams, false),
        { wrapper }
      );

      expect(ClientService.searchClients).not.toHaveBeenCalled();
    });
  });

  describe('useCreateClient', () => {
    it('should create client successfully', async () => {
      const { ClientService } = require('../../services/clients');
      const newClientData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '9876543210',
        status: ClientStatus.ACTIVE
      };
      const createdClient = { ...newClientData, id: 2, active: true, createdAt: '2024-01-02T00:00:00Z', updatedAt: '2024-01-02T00:00:00Z' };

      ClientService.createClient.mockResolvedValue(createdClient);

      const { result } = renderHook(() => useCreateClient(), { wrapper });

      const createResult = await result.current.mutateAsync(newClientData);

      expect(createResult).toEqual(createdClient);
      expect(ClientService.createClient).toHaveBeenCalledWith(newClientData);
    });

    it('should handle create client error', async () => {
      const { ClientService } = require('../../services/clients');
      const error = new Error('Failed to create client');
      ClientService.createClient.mockRejectedValue(error);

      const { result } = renderHook(() => useCreateClient(), { wrapper });

      await expect(result.current.mutateAsync({})).rejects.toThrow('Failed to create client');
    });
  });

  describe('useUpdateClient', () => {
    it('should update client successfully', async () => {
      const { ClientService } = require('../../services/clients');
      const updateData = { firstName: 'Updated John' };
      const updatedClient = { ...mockClient, firstName: 'Updated John' };

      ClientService.updateClient.mockResolvedValue(updatedClient);

      const { result } = renderHook(() => useUpdateClient(), { wrapper });

      const updateResult = await result.current.mutateAsync({ id: 1, data: updateData });

      expect(updateResult).toEqual(updatedClient);
      expect(ClientService.updateClient).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe('useDeleteClient', () => {
    it('should delete client successfully', async () => {
      const { ClientService } = require('../../services/clients');
      ClientService.deleteClient.mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteClient(), { wrapper });

      await result.current.mutateAsync(1);

      expect(ClientService.deleteClient).toHaveBeenCalledWith(1);
    });
  });

  describe('useActivateClient', () => {
    it('should activate client successfully', async () => {
      const { ClientService } = require('../../services/clients');
      const activatedClient = { ...mockClient, status: ClientStatus.ACTIVE };
      ClientService.activateClient.mockResolvedValue(activatedClient);

      const { result } = renderHook(() => useActivateClient(), { wrapper });

      const activateResult = await result.current.mutateAsync(1);

      expect(activateResult).toEqual(activatedClient);
      expect(ClientService.activateClient).toHaveBeenCalledWith(1);
    });
  });

  describe('useSuspendClient', () => {
    it('should suspend client successfully', async () => {
      const { ClientService } = require('../../services/clients');
      const suspendedClient = { ...mockClient, status: ClientStatus.SUSPENDED };
      ClientService.suspendClient.mockResolvedValue(suspendedClient);

      const { result } = renderHook(() => useSuspendClient(), { wrapper });

      const suspendResult = await result.current.mutateAsync(1);

      expect(suspendResult).toEqual(suspendedClient);
      expect(ClientService.suspendClient).toHaveBeenCalledWith(1);
    });
  });
});