/**
 * Appointment API service
 * Handles all appointment-related API operations
 */

import { apiClient } from './api/client';
import {
  Appointment,
  AppointmentCreateRequest,
  AppointmentUpdateRequest,
  PagedResponse,
  PaginationParams,
  SearchParams
} from '../types';

/**
 * Appointment API endpoints
 */
const ENDPOINTS = {
  APPOINTMENTS: '/api/appointments',
  APPOINTMENT_BY_ID: (id: number) => `/api/appointments/${id}`,
  APPOINTMENT_CONFIRM: (id: number) => `/api/appointments/${id}/confirm`,
  APPOINTMENT_START: (id: number) => `/api/appointments/${id}/start`,
  APPOINTMENT_COMPLETE: (id: number) => `/api/appointments/${id}/complete`,
  APPOINTMENT_CANCEL: (id: number) => `/api/appointments/${id}/cancel`,
  APPOINTMENT_RESCHEDULE: (id: number) => `/api/appointments/${id}/reschedule`,
  UPCOMING_APPOINTMENTS: '/api/appointments/upcoming',
  APPOINTMENT_CONFLICTS: '/api/appointments/conflicts',
  APPOINTMENT_SEARCH: '/api/appointments/search'
} as const;

/**
 * Appointment conflict information
 */
export interface AppointmentConflict {
  conflictType: 'TECHNICIAN_BUSY' | 'CLIENT_BUSY' | 'RESOURCE_UNAVAILABLE';
  message: string;
  suggestedAlternatives: AppointmentSlot[];
}

/**
 * Available appointment slot
 */
export interface AppointmentSlot {
  startTime: string;
  endTime: string;
  technicianId: number;
  technicianName: string;
  available: boolean;
}

/**
 * Appointment reschedule request
 */
export interface AppointmentRescheduleRequest {
  newStartTime: string;
  newEndTime: string;
  reason?: string;
}

/**
 * Appointment service class
 */
export class AppointmentService {
  /**
   * Get all appointments with pagination
   */
  static async getAppointments(params?: PaginationParams): Promise<PagedResponse<Appointment>> {
    const response = await apiClient.get<PagedResponse<Appointment>>(ENDPOINTS.APPOINTMENTS, {
      params
    });
    return response.data;
  }

  /**
   * Get appointment by ID
   */
  static async getAppointmentById(id: number): Promise<Appointment> {
    const response = await apiClient.get<Appointment>(ENDPOINTS.APPOINTMENT_BY_ID(id));
    return response.data;
  }

  /**
   * Create new appointment
   */
  static async createAppointment(appointment: AppointmentCreateRequest): Promise<Appointment> {
    const response = await apiClient.post<Appointment>(ENDPOINTS.APPOINTMENTS, appointment);
    return response.data;
  }

  /**
   * Update existing appointment
   */
  static async updateAppointment(id: number, appointment: AppointmentUpdateRequest): Promise<Appointment> {
    const response = await apiClient.put<Appointment>(ENDPOINTS.APPOINTMENT_BY_ID(id), appointment);
    return response.data;
  }

  /**
   * Delete appointment
   */
  static async deleteAppointment(id: number): Promise<void> {
    await apiClient.delete(ENDPOINTS.APPOINTMENT_BY_ID(id));
  }

  /**
   * Confirm appointment
   */
  static async confirmAppointment(id: number): Promise<Appointment> {
    const response = await apiClient.post<Appointment>(ENDPOINTS.APPOINTMENT_CONFIRM(id));
    return response.data;
  }

  /**
   * Start appointment
   */
  static async startAppointment(id: number): Promise<Appointment> {
    const response = await apiClient.post<Appointment>(ENDPOINTS.APPOINTMENT_START(id));
    return response.data;
  }

  /**
   * Complete appointment
   */
  static async completeAppointment(id: number, notes?: string): Promise<Appointment> {
    const response = await apiClient.post<Appointment>(ENDPOINTS.APPOINTMENT_COMPLETE(id), {
      notes
    });
    return response.data;
  }

  /**
   * Cancel appointment
   */
  static async cancelAppointment(id: number, reason?: string): Promise<Appointment> {
    const response = await apiClient.post<Appointment>(ENDPOINTS.APPOINTMENT_CANCEL(id), {
      reason
    });
    return response.data;
  }

  /**
   * Reschedule appointment
   */
  static async rescheduleAppointment(id: number, reschedule: AppointmentRescheduleRequest): Promise<Appointment> {
    const response = await apiClient.post<Appointment>(ENDPOINTS.APPOINTMENT_RESCHEDULE(id), reschedule);
    return response.data;
  }

  /**
   * Search appointments
   */
  static async searchAppointments(searchParams: SearchParams): Promise<PagedResponse<Appointment>> {
    const response = await apiClient.get<PagedResponse<Appointment>>(ENDPOINTS.APPOINTMENT_SEARCH, {
      params: searchParams
    });
    return response.data;
  }

  /**
   * Get upcoming appointments
   */
  static async getUpcomingAppointments(params?: PaginationParams): Promise<PagedResponse<Appointment>> {
    const response = await apiClient.get<PagedResponse<Appointment>>(ENDPOINTS.UPCOMING_APPOINTMENTS, {
      params
    });
    return response.data;
  }

  /**
   * Check for appointment conflicts
   */
  static async checkAppointmentConflicts(appointment: AppointmentCreateRequest): Promise<AppointmentConflict[]> {
    const response = await apiClient.post<AppointmentConflict[]>(ENDPOINTS.APPOINTMENT_CONFLICTS, appointment);
    return response.data;
  }

  /**
   * Get available appointment slots
   */
  static async getAvailableSlots(
    startDate: string,
    endDate: string,
    technicianId?: number,
    duration?: number
  ): Promise<AppointmentSlot[]> {
    const response = await apiClient.get<AppointmentSlot[]>(`${ENDPOINTS.APPOINTMENTS}/available-slots`, {
      params: {
        startDate,
        endDate,
        technicianId,
        duration
      }
    });
    return response.data;
  }

  /**
   * Bulk operations
   */
  static async bulkCreateAppointments(appointments: AppointmentCreateRequest[]): Promise<Appointment[]> {
    const response = await apiClient.post<Appointment[]>(`${ENDPOINTS.APPOINTMENTS}/bulk`, appointments);
    return response.data;
  }

  static async bulkUpdateAppointments(updates: Array<{ id: number; data: AppointmentUpdateRequest }>): Promise<Appointment[]> {
    const response = await apiClient.put<Appointment[]>(`${ENDPOINTS.APPOINTMENTS}/bulk`, updates);
    return response.data;
  }

  static async bulkCancelAppointments(ids: number[], reason?: string): Promise<Appointment[]> {
    const response = await apiClient.post<Appointment[]>(`${ENDPOINTS.APPOINTMENTS}/bulk-cancel`, {
      ids,
      reason
    });
    return response.data;
  }

  static async bulkDeleteAppointments(ids: number[]): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.APPOINTMENTS}/bulk`, {
      data: { ids }
    });
  }
}

export default AppointmentService;