/**
 * Appointment hooks for TanStack Query integration
 * Provides comprehensive appointment management functionality
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Appointment, 
  AppointmentCreateRequest, 
  AppointmentUpdateRequest, 
  PaginationParams 
} from '../types';
import { 
  AppointmentService, 
  AppointmentRescheduleRequest, 
  AppointmentConflict, 
  AppointmentSlot 
} from '../services/appointments';

/**
 * Query keys for appointment-related queries
 */
export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...appointmentKeys.lists(), params] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: number) => [...appointmentKeys.details(), id] as const,
  upcoming: () => [...appointmentKeys.all, 'upcoming'] as const,
  conflicts: () => [...appointmentKeys.all, 'conflicts'] as const,
  availableSlots: () => [...appointmentKeys.all, 'available-slots'] as const,
} as const;

/**
 * Hook to fetch appointments with pagination
 */
export function useAppointments(params?: PaginationParams) {
  return useQuery({
    queryKey: appointmentKeys.list(params),
    queryFn: () => AppointmentService.getAppointments(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch a specific appointment by ID
 */
export function useAppointment(id: number) {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => AppointmentService.getAppointmentById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch upcoming appointments
 */
export function useUpcomingAppointments(params?: PaginationParams) {
  return useQuery({
    queryKey: appointmentKeys.upcoming(),
    queryFn: () => AppointmentService.getUpcomingAppointments(params),
    staleTime: 1 * 60 * 1000, // 1 minute - more frequent updates for upcoming
  });
}

/**
 * Hook to get available appointment slots
 */
export function useAvailableSlots(
  startDate: string,
  endDate: string,
  technicianId?: number,
  duration?: number
) {
  return useQuery({
    queryKey: [...appointmentKeys.availableSlots(), { startDate, endDate, technicianId, duration }],
    queryFn: () => AppointmentService.getAvailableSlots(startDate, endDate, technicianId, duration),
    enabled: !!startDate && !!endDate,
    staleTime: 30 * 1000, // 30 seconds - fresh data for scheduling
  });
}

/**
 * Hook to create a new appointment
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointment: AppointmentCreateRequest) => 
      AppointmentService.createAppointment(appointment),
    onSuccess: (newAppointment) => {
      // Invalidate and refetch appointment lists
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.upcoming() });
      
      // Add the new appointment to the cache
      queryClient.setQueryData(
        appointmentKeys.detail(newAppointment.id),
        newAppointment
      );
      
      // Invalidate available slots since a new appointment was created
      queryClient.invalidateQueries({ queryKey: appointmentKeys.availableSlots() });
    },
  });
}

/**
 * Hook to update an existing appointment
 */
export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, appointment }: { id: number; appointment: AppointmentUpdateRequest }) =>
      AppointmentService.updateAppointment(id, appointment),
    onSuccess: (updatedAppointment) => {
      // Update the specific appointment in cache
      queryClient.setQueryData(
        appointmentKeys.detail(updatedAppointment.id),
        updatedAppointment
      );
      
      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.availableSlots() });
    },
  });
}

/**
 * Hook to delete an appointment
 */
export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => AppointmentService.deleteAppointment(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: appointmentKeys.detail(deletedId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.availableSlots() });
    },
  });
}

/**
 * Hook to confirm an appointment
 */
export function useConfirmAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => AppointmentService.confirmAppointment(id),
    onSuccess: (confirmedAppointment) => {
      queryClient.setQueryData(
        appointmentKeys.detail(confirmedAppointment.id),
        confirmedAppointment
      );
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.upcoming() });
    },
  });
}

/**
 * Hook to start an appointment
 */
export function useStartAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => AppointmentService.startAppointment(id),
    onSuccess: (startedAppointment) => {
      queryClient.setQueryData(
        appointmentKeys.detail(startedAppointment.id),
        startedAppointment
      );
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.upcoming() });
    },
  });
}

/**
 * Hook to complete an appointment
 */
export function useCompleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
      AppointmentService.completeAppointment(id, notes),
    onSuccess: (completedAppointment) => {
      queryClient.setQueryData(
        appointmentKeys.detail(completedAppointment.id),
        completedAppointment
      );
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.upcoming() });
    },
  });
}

/**
 * Hook to cancel an appointment
 */
export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      AppointmentService.cancelAppointment(id, reason),
    onSuccess: (cancelledAppointment) => {
      queryClient.setQueryData(
        appointmentKeys.detail(cancelledAppointment.id),
        cancelledAppointment
      );
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.availableSlots() });
    },
  });
}

/**
 * Hook to mark an appointment as no-show
 */
export function useMarkNoShowAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
      AppointmentService.markAppointmentNoShow(id, notes),
    onSuccess: (noShowAppointment) => {
      queryClient.setQueryData(
        appointmentKeys.detail(noShowAppointment.id),
        noShowAppointment
      );
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.availableSlots() });
    },
  });
}

/**
 * Hook to reschedule an appointment
 */
export function useRescheduleAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reschedule }: { id: number; reschedule: AppointmentRescheduleRequest }) =>
      AppointmentService.rescheduleAppointment(id, reschedule),
    onSuccess: (rescheduledAppointment) => {
      queryClient.setQueryData(
        appointmentKeys.detail(rescheduledAppointment.id),
        rescheduledAppointment
      );
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.availableSlots() });
    },
  });
}

/**
 * Hook to check appointment conflicts
 */
export function useCheckAppointmentConflicts() {
  return useMutation({
    mutationFn: (appointment: AppointmentCreateRequest) =>
      AppointmentService.checkAppointmentConflicts(appointment),
  });
}

/**
 * Hook to check technician availability
 */
export function useCheckTechnicianAvailability() {
  return useMutation({
    mutationFn: ({ technicianId, startTime, endTime }: { 
      technicianId: number; 
      startTime: string; 
      endTime: string; 
    }) => AppointmentService.checkTechnicianAvailability(technicianId, startTime, endTime),
  });
}

/**
 * Hook for bulk appointment operations
 */
export function useBulkAppointmentOperations() {
  const queryClient = useQueryClient();

  const bulkCreate = useMutation({
    mutationFn: (appointments: AppointmentCreateRequest[]) =>
      AppointmentService.bulkCreateAppointments(appointments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.availableSlots() });
    },
  });

  const bulkUpdate = useMutation({
    mutationFn: (updates: Array<{ id: number; data: AppointmentUpdateRequest }>) =>
      AppointmentService.bulkUpdateAppointments(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.upcoming() });
    },
  });

  const bulkCancel = useMutation({
    mutationFn: ({ ids, reason }: { ids: number[]; reason?: string }) =>
      AppointmentService.bulkCancelAppointments(ids, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.availableSlots() });
    },
  });

  const bulkDelete = useMutation({
    mutationFn: (ids: number[]) => AppointmentService.bulkDeleteAppointments(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.availableSlots() });
    },
  });

  return {
    bulkCreate,
    bulkUpdate,
    bulkCancel,
    bulkDelete,
  };
}