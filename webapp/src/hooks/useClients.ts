/**
 * React Query hooks for client data fetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClientService, TicketService, AppointmentService } from '../services';
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
    // Reuse the stable list endpoint and filter client-side by clientId
    // This avoids relying on nested endpoints that may not exist on the backend
    queryFn: async () => {
      const page = params?.page ?? 0;
      const size = params?.size ?? 100;
      const all = await TicketService.getTickets({ page, size });
      const clientIdNumber = Number(id);
      const filtered = (all.content || []).filter(t => {
        if (!t) return false;
        const ticketAny = t as any;
        const clientObj = ticketAny.client;
        const ticketClientId = ticketAny.clientId != null ? Number(ticketAny.clientId) : undefined;
        const nestedClientId = clientObj && clientObj.id != null ? Number(clientObj.id) : undefined;
        return ticketClientId === clientIdNumber || nestedClientId === clientIdNumber;
      });
      return {
        content: filtered,
        totalElements: filtered.length,
        totalPages: 1,
        size: filtered.length,
        number: 0,
        numberOfElements: filtered.length,
        first: true,
        last: true,
        empty: filtered.length === 0
      };
    },
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
    // Fetch global appointments and filter by this client's tickets
    queryFn: async () => {
      const page = params?.page ?? 0;
      const size = params?.size ?? 100;

      // 1) Get all tickets for this client from the global list
      const allTickets = await TicketService.getTickets({ page: 0, size: 1000 });
      const clientIdNumber = Number(id);
      const clientTicketIds = (allTickets.content || [])
        .filter(t => {
          if (!t) return false;
          const anyT = t as any;
          const nestedClientId = anyT.client?.id != null ? Number(anyT.client.id) : undefined;
          const flatClientId = anyT.clientId != null ? Number(anyT.clientId) : undefined;
          return flatClientId === clientIdNumber || nestedClientId === clientIdNumber;
        })
        .map(t => t!.id);

      // 2) Get appointments and filter by ticketId membership or nested ticket client
      const allAppts = await AppointmentService.getAppointments({ page, size });
      const filtered = (allAppts.content || []).filter(appt => {
        if (!appt) return false;
        const anyA = appt as any;
        const apptTicketId = anyA.ticketId != null ? Number(anyA.ticketId) : undefined;
        const nestedTicketId = anyA.ticket?.id != null ? Number(anyA.ticket.id) : undefined;
        const nestedTicketClientId = anyA.ticket?.clientId != null ? Number(anyA.ticket.clientId) :
          (anyA.ticket?.client?.id != null ? Number(anyA.ticket.client.id) : undefined);
        return (apptTicketId != null && clientTicketIds.includes(apptTicketId)) ||
               (nestedTicketId != null && clientTicketIds.includes(nestedTicketId)) ||
               nestedTicketClientId === clientIdNumber;
      });

      // Normalize field names for UI consumption
      const normalized = filtered.map((appt) => {
        const anyA = appt as any;
        const scheduledStartTime = anyA.scheduledStartTime ?? anyA.startTime;
        const scheduledEndTime = anyA.scheduledEndTime ?? anyA.endTime;
        return {
          ...appt,
          scheduledStartTime,
          scheduledEndTime,
        } as any;
      });

      return {
        content: normalized,
        totalElements: normalized.length,
        totalPages: 1,
        size: normalized.length,
        number: 0,
        numberOfElements: normalized.length,
        first: true,
        last: true,
        empty: normalized.length === 0
      };
    },
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