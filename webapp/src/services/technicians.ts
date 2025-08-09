/**
 * Technician API service
 * Handles all technician-related API operations
 */

import { apiClient } from './api/client';
import {
  Technician,
  TechnicianRequest,
  PagedResponse,
  PaginationParams,
  SearchParams,
  TechnicianStatistics
} from '../types';

/**
 * Technician API endpoints
 */
const ENDPOINTS = {
  TECHNICIANS: '/api/technicians',
  TECHNICIAN_BY_ID: (id: number) => `/api/technicians/${id}`,
  TECHNICIAN_TICKETS: (id: number) => `/api/technicians/${id}/tickets`,
  TECHNICIAN_APPOINTMENTS: (id: number) => `/api/technicians/${id}/appointments`,
  TECHNICIAN_SCHEDULE: (id: number) => `/api/technicians/${id}/schedule`,
  TECHNICIAN_WORKLOAD: (id: number) => `/api/technicians/${id}/workload`,
  TECHNICIAN_FEEDBACK: (id: number) => `/api/technicians/${id}/feedback`,
  AVAILABLE_TECHNICIANS: '/api/technicians/available',
  TECHNICIAN_STATISTICS: '/api/technicians/statistics',
  TECHNICIAN_SEARCH: '/api/technicians/search'
} as const;

/**
 * Technician workload information
 */
export interface TechnicianWorkload {
  technicianId: number;
  technicianName: string;
  assignedTickets: number;
  completedTickets: number;
  averageResolutionTime: number;
  currentLoad: 'LOW' | 'MEDIUM' | 'HIGH';
  skills: string[];
  available: boolean;
}

/**
 * Technician availability check
 */
export interface TechnicianAvailability {
  technicianId: number;
  available: boolean;
  serviceTypes: string[];
  currentWorkload: number;
  nextAvailableSlot?: string;
}

/**
 * Technician service class
 */
export class TechnicianService {
  /**
   * Get all technicians with pagination
   */
  static async getTechnicians(params?: PaginationParams): Promise<PagedResponse<Technician>> {
    const response = await apiClient.get<PagedResponse<Technician>>(ENDPOINTS.TECHNICIANS, {
      params
    });
    return response.data;
  }

  /**
   * Get technician by ID
   */
  static async getTechnicianById(id: number): Promise<Technician> {
    const response = await apiClient.get<Technician>(ENDPOINTS.TECHNICIAN_BY_ID(id));
    return response.data;
  }

  /**
   * Create new technician
   */
  static async createTechnician(technician: TechnicianRequest): Promise<Technician> {
    const response = await apiClient.post<Technician>(ENDPOINTS.TECHNICIANS, technician);
    return response.data;
  }

  /**
   * Update existing technician
   */
  static async updateTechnician(id: number, technician: Partial<TechnicianRequest>): Promise<Technician> {
    const response = await apiClient.put<Technician>(ENDPOINTS.TECHNICIAN_BY_ID(id), technician);
    return response.data;
  }

  /**
   * Delete technician
   */
  static async deleteTechnician(id: number): Promise<void> {
    await apiClient.delete(ENDPOINTS.TECHNICIAN_BY_ID(id));
  }

  /**
   * Search technicians
   */
  static async searchTechnicians(searchParams: SearchParams): Promise<PagedResponse<Technician>> {
    const response = await apiClient.get<PagedResponse<Technician>>(ENDPOINTS.TECHNICIAN_SEARCH, {
      params: searchParams
    });
    return response.data;
  }

  /**
   * Get available technicians for a service type
   */
  static async getAvailableTechnicians(serviceType?: string): Promise<TechnicianAvailability[]> {
    const response = await apiClient.get<TechnicianAvailability[]>(ENDPOINTS.AVAILABLE_TECHNICIANS, {
      params: { serviceType }
    });
    return response.data;
  }

  /**
   * Get technician tickets
   */
  static async getTechnicianTickets(id: number, params?: PaginationParams): Promise<PagedResponse<any>> {
    const response = await apiClient.get<PagedResponse<any>>(ENDPOINTS.TECHNICIAN_TICKETS(id), {
      params
    });
    return response.data;
  }

  /**
   * Get technician appointments
   */
  static async getTechnicianAppointments(id: number, params?: PaginationParams): Promise<PagedResponse<any>> {
    const response = await apiClient.get<PagedResponse<any>>(ENDPOINTS.TECHNICIAN_APPOINTMENTS(id), {
      params
    });
    return response.data;
  }

  /**
   * Get technician schedule
   */
  static async getTechnicianSchedule(id: number, startDate?: string, endDate?: string): Promise<any[]> {
    const response = await apiClient.get<any[]>(ENDPOINTS.TECHNICIAN_SCHEDULE(id), {
      params: { startDate, endDate }
    });
    return response.data;
  }

  /**
   * Get technician workload information
   */
  static async getTechnicianWorkload(id: number): Promise<TechnicianWorkload> {
    const response = await apiClient.get<TechnicianWorkload>(ENDPOINTS.TECHNICIAN_WORKLOAD(id));
    return response.data;
  }

  /**
   * Get technician feedback
   */
  static async getTechnicianFeedback(id: number, params?: PaginationParams): Promise<PagedResponse<any>> {
    const response = await apiClient.get<PagedResponse<any>>(ENDPOINTS.TECHNICIAN_FEEDBACK(id), {
      params
    });
    return response.data;
  }

  /**
   * Get technician statistics
   */
  static async getTechnicianStatistics(): Promise<TechnicianStatistics> {
    const response = await apiClient.get<TechnicianStatistics>(ENDPOINTS.TECHNICIAN_STATISTICS);
    return response.data;
  }

  /**
   * Bulk operations
   */
  static async bulkCreateTechnicians(technicians: TechnicianRequest[]): Promise<Technician[]> {
    const response = await apiClient.post<Technician[]>(`${ENDPOINTS.TECHNICIANS}/bulk`, technicians);
    return response.data;
  }

  static async bulkUpdateTechnicians(updates: Array<{ id: number; data: Partial<TechnicianRequest> }>): Promise<Technician[]> {
    const response = await apiClient.put<Technician[]>(`${ENDPOINTS.TECHNICIANS}/bulk`, updates);
    return response.data;
  }

  static async bulkDeleteTechnicians(ids: number[]): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.TECHNICIANS}/bulk`, {
      data: { ids }
    });
  }
}

export default TechnicianService;