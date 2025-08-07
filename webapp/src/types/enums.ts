/**
 * Enum definitions for the Tech Support System
 * Converted from Java string constants to TypeScript enums
 */

export enum ClientStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED'
}

export enum TechnicianStatus {
  ACTIVE = 'ACTIVE',
  ON_VACATION = 'ON_VACATION',
  SICK_LEAVE = 'SICK_LEAVE',
  TERMINATED = 'TERMINATED'
}

export enum TicketStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum ServiceType {
  HARDWARE = 'HARDWARE',
  SOFTWARE = 'SOFTWARE'
  // Note: NETWORK causes server 500 error - removed until server issue is fixed
  // PRINTER, EMAIL, SECURITY, BACKUP, CONSULTATION not supported by current server version
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

// Type guards for enum validation
export const isClientStatus = (value: string): value is ClientStatus =>
  Object.values(ClientStatus).includes(value as ClientStatus);

export const isTechnicianStatus = (value: string): value is TechnicianStatus =>
  Object.values(TechnicianStatus).includes(value as TechnicianStatus);

export const isTicketStatus = (value: string): value is TicketStatus =>
  Object.values(TicketStatus).includes(value as TicketStatus);

export const isTicketPriority = (value: string): value is TicketPriority =>
  Object.values(TicketPriority).includes(value as TicketPriority);

export const isServiceType = (value: string): value is ServiceType =>
  Object.values(ServiceType).includes(value as ServiceType);

export const isAppointmentStatus = (value: string): value is AppointmentStatus =>
  Object.values(AppointmentStatus).includes(value as AppointmentStatus);

export enum SatisfactionLevel {
  EXCELLENT = 'EXCELLENT',
  VERY_GOOD = 'VERY_GOOD',
  GOOD = 'GOOD',
  AVERAGE = 'AVERAGE',
  POOR = 'POOR',
  VERY_POOR = 'VERY_POOR',
  UNKNOWN = 'UNKNOWN'
}

export enum SystemLoadLevel {
  NONE = 'NONE',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export const isSatisfactionLevel = (value: string): value is SatisfactionLevel =>
  Object.values(SatisfactionLevel).includes(value as SatisfactionLevel);

export const isSystemLoadLevel = (value: string): value is SystemLoadLevel =>
  Object.values(SystemLoadLevel).includes(value as SystemLoadLevel);