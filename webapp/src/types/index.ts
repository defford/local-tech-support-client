/**
 * Central export file for all TypeScript types
 * Makes importing types easier across the application
 */

// Core entity types
export * from './Client';
export * from './Technician';
export * from './Ticket';
export * from './Appointment';

// Utility types
export * from './PagedResponse';
export * from './Statistics';
export * from './enums';

// API types
export * from './api';

// Re-export commonly used types with cleaner names
export type {
  Client,
  ClientRequest,
  ClientDisplay
} from './Client';

export type {
  Technician,
  TechnicianRequest,
  TechnicianDisplay
} from './Technician';

export type {
  Ticket,
  TicketCreateRequest,
  TicketUpdateRequest,
  TicketAssignmentRequest,
  TicketDisplay
} from './Ticket';

export type {
  Appointment,
  AppointmentCreateRequest,
  AppointmentUpdateRequest,
  AppointmentDisplay
} from './Appointment';

export type {
  PagedResponse,
  PaginationParams
} from './PagedResponse';

export type {
  TicketStatistics,
  TechnicianStatistics,
  SystemStatistics,
  SystemHealth
} from './Statistics';