/**
 * Client API service
 * Handles all client-related API operations
 */

import { apiClient } from './api/client';
import {
  Client,
  ClientRequest,
  PagedResponse,
  PaginationParams,
  SearchParams
} from '../types';

/**
 * Client API endpoints
 */
const ENDPOINTS = {
  CLIENTS: '/api/clients',
  CLIENT_BY_ID: (id: number) => `/api/clients/${id}`,
  CLIENT_TICKETS: (id: number) => `/api/clients/${id}/tickets`,
  CLIENT_APPOINTMENTS: (id: number) => `/api/clients/${id}/appointments`,
  CLIENT_ACTIVATE: (id: number) => `/api/clients/${id}/activate`,
  CLIENT_SUSPEND: (id: number) => `/api/clients/${id}/suspend`,
  CLIENT_SEARCH: '/api/clients/search'
} as const;

/**
 * Client service class
 */
export class ClientService {
  /**
   * Get all clients with pagination
   */
  static async getClients(params?: PaginationParams): Promise<PagedResponse<Client>> {
    const response = await apiClient.get<PagedResponse<Client>>(ENDPOINTS.CLIENTS, {
      params
    });
    return response.data;
  }

  /**
   * Get client by ID
   */
  static async getClientById(id: number): Promise<Client> {
    const response = await apiClient.get<Client>(ENDPOINTS.CLIENT_BY_ID(id));
    return response.data;
  }

  /**
   * Create new client
   */
  static async createClient(client: ClientRequest): Promise<Client> {
    const response = await apiClient.post<Client>(ENDPOINTS.CLIENTS, client);
    return response.data;
  }

  /**
   * Update existing client
   */
  static async updateClient(id: number, client: Partial<ClientRequest>): Promise<Client> {
    const response = await apiClient.put<Client>(ENDPOINTS.CLIENT_BY_ID(id), client);
    return response.data;
  }

  /**
   * Delete client
   */
  static async deleteClient(id: number): Promise<void> {
    await apiClient.delete(ENDPOINTS.CLIENT_BY_ID(id));
  }

  /**
   * Search clients
   */
  static async searchClients(searchParams: SearchParams): Promise<PagedResponse<Client>> {
    const response = await apiClient.get<PagedResponse<Client>>(ENDPOINTS.CLIENT_SEARCH, {
      params: searchParams
    });
    return response.data;
  }

  /**
   * Get client tickets
   */
  static async getClientTickets(id: number, params?: PaginationParams): Promise<PagedResponse<any>> {
    const response = await apiClient.get<PagedResponse<any>>(ENDPOINTS.CLIENT_TICKETS(id), {
      params
    });
    return response.data;
  }

  /**
   * Get client appointments
   */
  static async getClientAppointments(id: number, params?: PaginationParams): Promise<PagedResponse<any>> {
    const response = await apiClient.get<PagedResponse<any>>(ENDPOINTS.CLIENT_APPOINTMENTS(id), {
      params
    });
    return response.data;
  }

  /**
   * Activate client
   */
  static async activateClient(id: number): Promise<Client> {
    const response = await apiClient.post<Client>(ENDPOINTS.CLIENT_ACTIVATE(id));
    return response.data;
  }

  /**
   * Suspend client
   */
  static async suspendClient(id: number): Promise<Client> {
    const response = await apiClient.post<Client>(ENDPOINTS.CLIENT_SUSPEND(id));
    return response.data;
  }

  /**
   * Bulk operations
   */
  static async bulkCreateClients(clients: ClientRequest[]): Promise<Client[]> {
    const response = await apiClient.post<Client[]>(`${ENDPOINTS.CLIENTS}/bulk`, clients);
    return response.data;
  }

  static async bulkUpdateClients(updates: Array<{ id: number; data: Partial<ClientRequest> }>): Promise<Client[]> {
    const response = await apiClient.put<Client[]>(`${ENDPOINTS.CLIENTS}/bulk`, updates);
    return response.data;
  }

  static async bulkDeleteClients(ids: number[]): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.CLIENTS}/bulk`, {
      data: { ids }
    });
  }
}

export default ClientService;