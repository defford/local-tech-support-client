/**
 * Ticket API service
 * Handles all ticket-related API operations
 */

import { apiClient } from './api/client';
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
 * Ticket API endpoints
 */
const ENDPOINTS = {
  TICKETS: '/api/tickets',
  TICKET_BY_ID: (id: number) => `/api/tickets/${id}`,
  TICKET_ASSIGN: (id: number) => `/api/tickets/${id}/assign`,
  TICKET_CLOSE: (id: number) => `/api/tickets/${id}/close`,
  TICKET_REOPEN: (id: number) => `/api/tickets/${id}/reopen`,
  OVERDUE_TICKETS: '/api/tickets/overdue',
  UNASSIGNED_TICKETS: '/api/tickets/unassigned',
  TICKET_STATISTICS: '/api/tickets/statistics',
  TICKET_SEARCH: '/api/tickets/search'
} as const;

/**
 * Ticket assignment result
 */
export interface TicketAssignmentResult {
  ticketId: number;
  assignedTechnicianId: number;
  assignedTechnicianName: string;
  assignedAt: string;
  estimatedCompletion?: string;
}

/**
 * Overdue ticket information
 */
export interface OverdueTicketInfo {
  ticketId: number;
  title: string;
  clientName: string;
  assignedTechnicianName?: string;
  dueAt: string;
  daysPastDue: number;
  priority: string;
}

/**
 * Ticket service class
 */
export class TicketService {
  /**
   * Get all tickets with pagination
   */
  static async getTickets(params?: PaginationParams): Promise<PagedResponse<Ticket>> {
    const response = await apiClient.get<PagedResponse<Ticket>>(ENDPOINTS.TICKETS, {
      params
    });
    return response.data;
  }

  /**
   * Get ticket by ID
   */
  static async getTicketById(id: number): Promise<Ticket> {
    const response = await apiClient.get<Ticket>(ENDPOINTS.TICKET_BY_ID(id));
    return response.data;
  }

  /**
   * Create new ticket
   */
  static async createTicket(ticket: TicketCreateRequest): Promise<Ticket> {
    const response = await apiClient.post<Ticket>(ENDPOINTS.TICKETS, ticket);
    return response.data;
  }

  /**
   * Update existing ticket
   */
  static async updateTicket(id: number, ticket: TicketUpdateRequest): Promise<Ticket> {
    const response = await apiClient.put<Ticket>(ENDPOINTS.TICKET_BY_ID(id), ticket);
    return response.data;
  }

  /**
   * Delete ticket
   */
  static async deleteTicket(id: number): Promise<void> {
    await apiClient.delete(ENDPOINTS.TICKET_BY_ID(id));
  }

  /**
   * Assign ticket to technician
   */
  static async assignTicket(id: number, assignment: TicketAssignmentRequest): Promise<TicketAssignmentResult> {
    console.log('TicketService.assignTicket called with:', { id, assignment });
    console.log('Endpoint:', ENDPOINTS.TICKET_ASSIGN(id));
    console.log('Full payload:', assignment);
    console.log('Server should be running on: http://localhost:8080');
    
    const response = await apiClient.post<TicketAssignmentResult>(ENDPOINTS.TICKET_ASSIGN(id), assignment);
    console.log('Assignment successful:', response.data);
    return response.data;
  }

  /**
   * Close ticket
   */
  static async closeTicket(id: number, resolution?: string): Promise<Ticket> {
    const response = await apiClient.post<Ticket>(ENDPOINTS.TICKET_CLOSE(id), {
      resolution
    });
    return response.data;
  }

  /**
   * Reopen ticket
   */
  static async reopenTicket(id: number, reason?: string): Promise<Ticket> {
    const response = await apiClient.post<Ticket>(ENDPOINTS.TICKET_REOPEN(id), {
      reason
    });
    return response.data;
  }

  /**
   * Search tickets
   */
  static async searchTickets(searchParams: SearchParams): Promise<PagedResponse<Ticket>> {
    const response = await apiClient.get<PagedResponse<Ticket>>(ENDPOINTS.TICKET_SEARCH, {
      params: searchParams
    });
    return response.data;
  }

  /**
   * Get overdue tickets
   */
  static async getOverdueTickets(params?: PaginationParams): Promise<PagedResponse<OverdueTicketInfo>> {
    const response = await apiClient.get<PagedResponse<OverdueTicketInfo>>(ENDPOINTS.OVERDUE_TICKETS, {
      params
    });
    return response.data;
  }

  /**
   * Get unassigned tickets
   */
  static async getUnassignedTickets(params?: PaginationParams): Promise<PagedResponse<Ticket>> {
    const response = await apiClient.get<PagedResponse<Ticket>>(ENDPOINTS.UNASSIGNED_TICKETS, {
      params
    });
    return response.data;
  }

  /**
   * Get ticket statistics
   */
  static async getTicketStatistics(): Promise<TicketStatistics> {
    const response = await apiClient.get<TicketStatistics>(ENDPOINTS.TICKET_STATISTICS);
    return response.data;
  }

  /**
   * Bulk operations
   */
  static async bulkCreateTickets(tickets: TicketCreateRequest[]): Promise<Ticket[]> {
    const response = await apiClient.post<Ticket[]>(`${ENDPOINTS.TICKETS}/bulk`, tickets);
    return response.data;
  }

  static async bulkUpdateTickets(updates: Array<{ id: number; data: TicketUpdateRequest }>): Promise<Ticket[]> {
    const response = await apiClient.put<Ticket[]>(`${ENDPOINTS.TICKETS}/bulk`, updates);
    return response.data;
  }

  static async bulkAssignTickets(assignments: Array<{ ticketId: number; technicianId: number }>): Promise<TicketAssignmentResult[]> {
    const response = await apiClient.post<TicketAssignmentResult[]>(`${ENDPOINTS.TICKETS}/bulk-assign`, assignments);
    return response.data;
  }

  static async bulkCloseTickets(ticketIds: number[], resolution?: string): Promise<Ticket[]> {
    const response = await apiClient.post<Ticket[]>(`${ENDPOINTS.TICKETS}/bulk-close`, {
      ticketIds,
      resolution
    });
    return response.data;
  }

  static async bulkDeleteTickets(ids: number[]): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.TICKETS}/bulk`, {
      data: { ids }
    });
  }
}

export default TicketService;