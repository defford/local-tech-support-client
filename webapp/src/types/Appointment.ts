import { AppointmentStatus } from './enums';
import { Ticket } from './Ticket';
import { Technician } from './Technician';

/**
 * Appointment entity type definition
 * Converted from Java Appointment model
 */
export interface Appointment {
  id: number;
  ticketId: number;
  technicianId: number;
  scheduledStartTime: string; // ISO date string
  scheduledEndTime: string; // ISO date string
  status: AppointmentStatus;
  notes?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  // Navigation properties (may be included in responses)
  ticket?: Ticket;
  technician?: Technician;
}

/**
 * Appointment creation request type
 * Field names match the Java model's @JsonProperty annotations
 */
export interface AppointmentCreateRequest {
  ticketId: number;
  technicianId: number;
  startTime: string; // ISO date string - maps to @JsonProperty("startTime")
  endTime: string; // ISO date string - maps to @JsonProperty("endTime")
  notes?: string;
}

/**
 * Appointment update request type
 */
export interface AppointmentUpdateRequest {
  scheduledStartTime?: string; // ISO date string
  scheduledEndTime?: string; // ISO date string
  status?: AppointmentStatus;
  notes?: string;
}

/**
 * Appointment with computed properties for display
 */
export interface AppointmentDisplay extends Appointment {
  isUpcoming: boolean;
  isInProgress: boolean;
  isCompleted: boolean;
  isCancelled: boolean;
  duration: number; // Duration in minutes
  formattedStartTime: string;
  formattedEndTime: string;
}

/**
 * Utility functions for Appointment operations
 */
export const AppointmentUtils = {
  /**
   * Check if appointment is upcoming
   */
  isUpcoming: (appointment: Appointment): boolean => {
    return new Date() < new Date(appointment.scheduledStartTime);
  },

  /**
   * Check if appointment is in progress
   */
  isInProgress: (appointment: Appointment): boolean => {
    return appointment.status === AppointmentStatus.IN_PROGRESS;
  },

  /**
   * Check if appointment is completed
   */
  isCompleted: (appointment: Appointment): boolean => {
    return appointment.status === AppointmentStatus.COMPLETED;
  },

  /**
   * Check if appointment is cancelled
   */
  isCancelled: (appointment: Appointment): boolean => {
    return appointment.status === AppointmentStatus.CANCELLED || 
           appointment.status === AppointmentStatus.NO_SHOW;
  },

  /**
   * Get appointment duration in minutes
   */
  getDuration: (appointment: Appointment): number => {
    const start = new Date(appointment.scheduledStartTime);
    const end = new Date(appointment.scheduledEndTime);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  },

  /**
   * Get formatted start time
   */
  getFormattedStartTime: (appointment: Appointment): string => {
    const date = new Date(appointment.scheduledStartTime);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * Get formatted end time
   */
  getFormattedEndTime: (appointment: Appointment): string => {
    const date = new Date(appointment.scheduledEndTime);
    return date.toLocaleDateString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * Get status color for UI
   */
  getStatusColor: (status: AppointmentStatus): string => {
    switch (status) {
      case AppointmentStatus.PENDING:
        return 'yellow';
      case AppointmentStatus.CONFIRMED:
        return 'blue';
      case AppointmentStatus.IN_PROGRESS:
        return 'orange';
      case AppointmentStatus.COMPLETED:
        return 'green';
      case AppointmentStatus.CANCELLED:
      case AppointmentStatus.NO_SHOW:
        return 'red';
      default:
        return 'gray';
    }
  },

  /**
   * Check if appointment can be rescheduled
   */
  canReschedule: (appointment: Appointment): boolean => {
    return appointment.status === AppointmentStatus.PENDING || 
           appointment.status === AppointmentStatus.CONFIRMED;
  },

  /**
   * Check if appointment can be cancelled
   */
  canCancel: (appointment: Appointment): boolean => {
    return appointment.status !== AppointmentStatus.COMPLETED &&
           appointment.status !== AppointmentStatus.CANCELLED &&
           appointment.status !== AppointmentStatus.NO_SHOW;
  }
};