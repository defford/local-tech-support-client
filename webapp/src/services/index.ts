/**
 * Central export file for all services
 * Makes importing services easier across the application
 */

// API client
export { default as apiClient } from './api/client';
export { ApiClientUtils } from './api/client';

// Service classes
export { ClientService } from './clients';
export { TechnicianService } from './technicians';
export { TicketService } from './tickets';
export { AppointmentService } from './appointments';

// Service types
export type { TechnicianWorkload, TechnicianAvailability } from './technicians';
export type { TicketAssignmentResult, OverdueTicketInfo } from './tickets';
export type { 
  AppointmentConflict, 
  AppointmentSlot, 
  AppointmentRescheduleRequest 
} from './appointments';

// Import services for collection
import { ClientService } from './clients';
import { TechnicianService } from './technicians';
import { TicketService } from './tickets';
import { AppointmentService } from './appointments';

// Service collection
export const services = {
  clients: ClientService,
  technicians: TechnicianService,
  tickets: TicketService,
  appointments: AppointmentService
};