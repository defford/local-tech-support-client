/**
 * React Query hooks for technician data fetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TechnicianService, TechnicianWorkload, TechnicianAvailability } from '../services';
import {
  Technician,
  TechnicianRequest,
  PagedResponse,
  PaginationParams,
  SearchParams,
  TechnicianStatistics
} from '../types';

/**
 * Query keys for technician operations
 */
export const TECHNICIAN_QUERY_KEYS = {
  all: ['technicians'] as const,
  lists: () => [...TECHNICIAN_QUERY_KEYS.all, 'list'] as const,
  list: (params?: PaginationParams) => [...TECHNICIAN_QUERY_KEYS.lists(), params] as const,
  details: () => [...TECHNICIAN_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...TECHNICIAN_QUERY_KEYS.details(), id] as const,
  search: (params: SearchParams) => [...TECHNICIAN_QUERY_KEYS.all, 'search', params] as const,
  available: (serviceType?: string) => [...TECHNICIAN_QUERY_KEYS.all, 'available', serviceType] as const,
  statistics: () => [...TECHNICIAN_QUERY_KEYS.all, 'statistics'] as const,
  tickets: (id: number, params?: PaginationParams) => [...TECHNICIAN_QUERY_KEYS.detail(id), 'tickets', params] as const,
  appointments: (id: number, params?: PaginationParams) => [...TECHNICIAN_QUERY_KEYS.detail(id), 'appointments', params] as const,
  schedule: (id: number, startDate?: string, endDate?: string) => [...TECHNICIAN_QUERY_KEYS.detail(id), 'schedule', startDate, endDate] as const,
  workload: (id: number) => [...TECHNICIAN_QUERY_KEYS.detail(id), 'workload'] as const,
  feedback: (id: number, params?: PaginationParams) => [...TECHNICIAN_QUERY_KEYS.detail(id), 'feedback', params] as const
} as const;

/**
 * Hook to fetch paginated technicians
 */
export const useTechnicians = (params?: PaginationParams) => {
  return useQuery({
    queryKey: TECHNICIAN_QUERY_KEYS.list(params),
    queryFn: () => TechnicianService.getTechnicians(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });
};

/**
 * Hook to fetch a single technician by ID
 */
export const useTechnician = (id: number, enabled = true) => {
  return useQuery({
    queryKey: TECHNICIAN_QUERY_KEYS.detail(id),
    queryFn: () => TechnicianService.getTechnicianById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });
};

/**
 * Hook to search technicians
 */
export const useTechnicianSearch = (searchParams: SearchParams, enabled = true) => {
  return useQuery({
    queryKey: TECHNICIAN_QUERY_KEYS.search(searchParams),
    queryFn: () => TechnicianService.searchTechnicians(searchParams),
    enabled: enabled && !!searchParams.query,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * Hook to fetch available technicians
 */
export const useAvailableTechnicians = (serviceType?: string, enabled = true) => {
  return useQuery({
    queryKey: TECHNICIAN_QUERY_KEYS.available(serviceType),
    queryFn: () => TechnicianService.getAvailableTechnicians(serviceType),
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute (fresher data for availability)
    gcTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * Hook to fetch technician statistics
 */
export const useTechnicianStatistics = (enabled = true) => {
  return useQuery({
    queryKey: TECHNICIAN_QUERY_KEYS.statistics(),
    queryFn: () => TechnicianService.getTechnicianStatistics(),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });
};

/**
 * Hook to fetch technician tickets
 */
export const useTechnicianTickets = (id: number, params?: PaginationParams, enabled = true) => {
  return useQuery({
    queryKey: TECHNICIAN_QUERY_KEYS.tickets(id, params),
    queryFn: () => TechnicianService.getTechnicianTickets(id, params),
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * Hook to fetch technician appointments
 */
export const useTechnicianAppointments = (id: number, params?: PaginationParams, enabled = true) => {
  return useQuery({
    queryKey: TECHNICIAN_QUERY_KEYS.appointments(id, params),
    queryFn: () => TechnicianService.getTechnicianAppointments(id, params),
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * Hook to fetch technician schedule
 */
export const useTechnicianSchedule = (id: number, startDate?: string, endDate?: string, enabled = true) => {
  return useQuery({
    queryKey: TECHNICIAN_QUERY_KEYS.schedule(id, startDate, endDate),
    queryFn: () => TechnicianService.getTechnicianSchedule(id, startDate, endDate),
    enabled: enabled && !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * Hook to fetch technician workload
 */
export const useTechnicianWorkload = (id: number, enabled = true) => {
  return useQuery({
    queryKey: TECHNICIAN_QUERY_KEYS.workload(id),
    queryFn: () => TechnicianService.getTechnicianWorkload(id),
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * Hook to fetch technician feedback
 */
export const useTechnicianFeedback = (id: number, params?: PaginationParams, enabled = true) => {
  return useQuery({
    queryKey: TECHNICIAN_QUERY_KEYS.feedback(id, params),
    queryFn: () => TechnicianService.getTechnicianFeedback(id, params),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });
};

/**
 * Hook to create a new technician
 */
export const useCreateTechnician = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (technician: TechnicianRequest) => TechnicianService.createTechnician(technician),
    onSuccess: (newTechnician) => {
      // Invalidate and refetch technician lists
      queryClient.invalidateQueries({ queryKey: TECHNICIAN_QUERY_KEYS.lists() });
      
      // Add the new technician to the cache
      queryClient.setQueryData(TECHNICIAN_QUERY_KEYS.detail(newTechnician.id), newTechnician);
      
      // Invalidate statistics and availability
      queryClient.invalidateQueries({ queryKey: TECHNICIAN_QUERY_KEYS.statistics() });
      queryClient.invalidateQueries({ queryKey: TECHNICIAN_QUERY_KEYS.available() });
    }
  });
};

/**
 * Hook to update a technician
 */
export const useUpdateTechnician = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TechnicianRequest> }) =>
      TechnicianService.updateTechnician(id, data),
    onSuccess: (updatedTechnician) => {
      // Update the technician in the cache
      queryClient.setQueryData(TECHNICIAN_QUERY_KEYS.detail(updatedTechnician.id), updatedTechnician);
      
      // Invalidate technician lists to reflect changes
      queryClient.invalidateQueries({ queryKey: TECHNICIAN_QUERY_KEYS.lists() });
      
      // Invalidate availability if skills or status changed
      queryClient.invalidateQueries({ queryKey: TECHNICIAN_QUERY_KEYS.available() });
      queryClient.invalidateQueries({ queryKey: TECHNICIAN_QUERY_KEYS.statistics() });
    }
  });
};

/**
 * Hook to delete a technician
 */
export const useDeleteTechnician = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => TechnicianService.deleteTechnician(id),
    onSuccess: (_, deletedId) => {
      // Remove the technician from the cache
      queryClient.removeQueries({ queryKey: TECHNICIAN_QUERY_KEYS.detail(deletedId) });
      
      // Invalidate technician lists
      queryClient.invalidateQueries({ queryKey: TECHNICIAN_QUERY_KEYS.lists() });
      
      // Invalidate availability and statistics
      queryClient.invalidateQueries({ queryKey: TECHNICIAN_QUERY_KEYS.available() });
      queryClient.invalidateQueries({ queryKey: TECHNICIAN_QUERY_KEYS.statistics() });
    }
  });
};