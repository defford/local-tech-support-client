/**
 * React Query hooks for client data fetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClientService } from '../services';
import {
  Client,
  ClientRequest,
  PagedResponse,
  PaginationParams,
  SearchParams
} from '../types';

/**
 * Query keys for client operations
 */
export const CLIENT_QUERY_KEYS = {
  all: ['clients'] as const,
  lists: () => [...CLIENT_QUERY_KEYS.all, 'list'] as const,
  list: (params?: PaginationParams) => [...CLIENT_QUERY_KEYS.lists(), params] as const,
  details: () => [...CLIENT_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...CLIENT_QUERY_KEYS.details(), id] as const,
  search: (params: SearchParams) => [...CLIENT_QUERY_KEYS.all, 'search', params] as const,
  tickets: (id: number, params?: PaginationParams) => [...CLIENT_QUERY_KEYS.detail(id), 'tickets', params] as const,
  appointments: (id: number, params?: PaginationParams) => [...CLIENT_QUERY_KEYS.detail(id), 'appointments', params] as const
} as const;

/**
 * Hook to fetch paginated clients
 */
export const useClients = (params?: PaginationParams) => {
  return useQuery({
    queryKey: CLIENT_QUERY_KEYS.list(params),
    queryFn: () => ClientService.getClients(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes (was cacheTime)
  });
};

/**
 * Hook to fetch a single client by ID
 */
export const useClient = (id: number, enabled = true) => {
  return useQuery({
    queryKey: CLIENT_QUERY_KEYS.detail(id),
    queryFn: () => ClientService.getClientById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });
};

/**
 * Hook to search clients
 */
export const useClientSearch = (searchParams: SearchParams, enabled = true) => {
  return useQuery({
    queryKey: CLIENT_QUERY_KEYS.search(searchParams),
    queryFn: () => ClientService.searchClients(searchParams),
    enabled: enabled && !!searchParams.query,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * Hook to fetch client tickets
 */
export const useClientTickets = (id: number, params?: PaginationParams, enabled = true) => {
  return useQuery({
    queryKey: CLIENT_QUERY_KEYS.tickets(id, params),
    queryFn: () => ClientService.getClientTickets(id, params),
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * Hook to fetch client appointments
 */
export const useClientAppointments = (id: number, params?: PaginationParams, enabled = true) => {
  return useQuery({
    queryKey: CLIENT_QUERY_KEYS.appointments(id, params),
    queryFn: () => ClientService.getClientAppointments(id, params),
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * Hook to create a new client
 */
export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (client: ClientRequest) => ClientService.createClient(client),
    onSuccess: (newClient) => {
      // Invalidate and refetch client lists
      queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.lists() });
      
      // Add the new client to the cache
      queryClient.setQueryData(CLIENT_QUERY_KEYS.detail(newClient.id), newClient);
    }
  });
};

/**
 * Hook to update a client
 */
export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ClientRequest> }) =>
      ClientService.updateClient(id, data),
    onSuccess: (updatedClient) => {
      // Update the client in the cache
      queryClient.setQueryData(CLIENT_QUERY_KEYS.detail(updatedClient.id), updatedClient);
      
      // Invalidate client lists to reflect changes
      queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.lists() });
    }
  });
};

/**
 * Hook to delete a client
 */
export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ClientService.deleteClient(id),
    onSuccess: (_, deletedId) => {
      // Remove the client from the cache
      queryClient.removeQueries({ queryKey: CLIENT_QUERY_KEYS.detail(deletedId) });
      
      // Invalidate client lists
      queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.lists() });
    }
  });
};

/**
 * Hook to activate a client
 */
export const useActivateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ClientService.activateClient(id),
    onSuccess: (updatedClient) => {
      // Update the client in the cache
      queryClient.setQueryData(CLIENT_QUERY_KEYS.detail(updatedClient.id), updatedClient);
      
      // Invalidate client lists
      queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.lists() });
    }
  });
};

/**
 * Hook to suspend a client
 */
export const useSuspendClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ClientService.suspendClient(id),
    onSuccess: (updatedClient) => {
      // Update the client in the cache
      queryClient.setQueryData(CLIENT_QUERY_KEYS.detail(updatedClient.id), updatedClient);
      
      // Invalidate client lists
      queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.lists() });
    }
  });
};