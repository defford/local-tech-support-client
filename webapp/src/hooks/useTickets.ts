/**
 * React Query hooks for ticket data fetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TicketService, TicketAssignmentResult, OverdueTicketInfo } from '../services';
import {
  Ticket,
  TicketCreateRequest,
  TicketUpdateRequest,
  TicketAssignmentRequest,
  PagedResponse,
  PaginationParams,
  SearchParams,
  TicketStatistics
} from '../types';

/**
 * Query keys for ticket operations
 */
export const TICKET_QUERY_KEYS = {
  all: ['tickets'] as const,
  lists: () => [...TICKET_QUERY_KEYS.all, 'list'] as const,
  list: (params?: PaginationParams) => [...TICKET_QUERY_KEYS.lists(), params] as const,
  details: () => [...TICKET_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...TICKET_QUERY_KEYS.details(), id] as const,
  search: (params: SearchParams) => [...TICKET_QUERY_KEYS.all, 'search', params] as const,
  overdue: (params?: PaginationParams) => [...TICKET_QUERY_KEYS.all, 'overdue', params] as const,
  unassigned: (params?: PaginationParams) => [...TICKET_QUERY_KEYS.all, 'unassigned', params] as const,
  statistics: () => [...TICKET_QUERY_KEYS.all, 'statistics'] as const
} as const;

/**
 * Hook to fetch paginated tickets
 */
export const useTickets = (params?: PaginationParams) => {
  return useQuery({
    queryKey: TICKET_QUERY_KEYS.list(params),
    queryFn: () => TicketService.getTickets(params),
    staleTime: 2 * 60 * 1000, // 2 minutes (tickets change frequently)
    gcTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * Hook to fetch a single ticket by ID
 */
export const useTicket = (id: number, enabled = true) => {
  return useQuery({
    queryKey: TICKET_QUERY_KEYS.detail(id),
    queryFn: () => TicketService.getTicketById(id),
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });
};

/**
 * Hook to search tickets
 */
export const useTicketSearch = (searchParams: SearchParams, enabled = true) => {
  return useQuery({
    queryKey: TICKET_QUERY_KEYS.search(searchParams),
    queryFn: () => TicketService.searchTickets(searchParams),
    enabled: enabled && !!searchParams.query,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * Hook to fetch overdue tickets
 */
export const useOverdueTickets = (params?: PaginationParams, enabled = true) => {
  return useQuery({
    queryKey: TICKET_QUERY_KEYS.overdue(params),
    queryFn: () => TicketService.getOverdueTickets(params),
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute (critical data)
    gcTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * Hook to fetch unassigned tickets
 */
export const useUnassignedTickets = (params?: PaginationParams, enabled = true) => {
  return useQuery({
    queryKey: TICKET_QUERY_KEYS.unassigned(params),
    queryFn: () => TicketService.getUnassignedTickets(params),
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * Hook to fetch ticket statistics
 */
export const useTicketStatistics = (enabled = true) => {
  return useQuery({
    queryKey: TICKET_QUERY_KEYS.statistics(),
    queryFn: () => TicketService.getTicketStatistics(),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });
};

/**
 * Hook to create a new ticket
 */
export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticket: TicketCreateRequest) => TicketService.createTicket(ticket),
    onSuccess: (newTicket) => {
      // Invalidate and refetch ticket lists
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.lists() });
      
      // Add the new ticket to the cache
      queryClient.setQueryData(TICKET_QUERY_KEYS.detail(newTicket.id), newTicket);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.statistics() });
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.unassigned() });
    }
  });
};

/**
 * Hook to update a ticket
 */
export const useUpdateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TicketUpdateRequest }) =>
      TicketService.updateTicket(id, data),
    onSuccess: (updatedTicket) => {
      // Update the ticket in the cache
      queryClient.setQueryData(TICKET_QUERY_KEYS.detail(updatedTicket.id), updatedTicket);
      
      // Invalidate ticket lists to reflect changes
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.lists() });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.statistics() });
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.overdue() });
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.unassigned() });
    }
  });
};

/**
 * Hook to assign a ticket
 */
export const useAssignTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, assignment }: { id: number; assignment: TicketAssignmentRequest }) =>
      TicketService.assignTicket(id, assignment),
    onSuccess: (_, { id }) => {
      // Invalidate the ticket detail to refresh data
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.detail(id) });
      
      // Invalidate ticket lists
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.lists() });
      
      // Invalidate unassigned tickets
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.unassigned() });
      
      // Invalidate statistics
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.statistics() });
    }
  });
};

/**
 * Hook to close a ticket
 */
export const useCloseTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, resolution }: { id: number; resolution?: string }) =>
      TicketService.closeTicket(id, resolution),
    onSuccess: (updatedTicket) => {
      // Update the ticket in the cache
      queryClient.setQueryData(TICKET_QUERY_KEYS.detail(updatedTicket.id), updatedTicket);
      
      // Invalidate ticket lists
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.lists() });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.statistics() });
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.overdue() });
    }
  });
};

/**
 * Hook to reopen a ticket
 */
export const useReopenTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      TicketService.reopenTicket(id, reason),
    onSuccess: (updatedTicket) => {
      // Update the ticket in the cache
      queryClient.setQueryData(TICKET_QUERY_KEYS.detail(updatedTicket.id), updatedTicket);
      
      // Invalidate ticket lists
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.lists() });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.statistics() });
    }
  });
};

/**
 * Hook to delete a ticket
 */
export const useDeleteTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => TicketService.deleteTicket(id),
    onSuccess: (_, deletedId) => {
      // Remove the ticket from the cache
      queryClient.removeQueries({ queryKey: TICKET_QUERY_KEYS.detail(deletedId) });
      
      // Invalidate ticket lists
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.lists() });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.statistics() });
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.overdue() });
      queryClient.invalidateQueries({ queryKey: TICKET_QUERY_KEYS.unassigned() });
    }
  });
};