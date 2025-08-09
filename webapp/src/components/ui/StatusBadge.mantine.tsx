/**
 * Status badge component for displaying various entity statuses
 * Built with Mantine Badge component
 */

import { Badge, BadgeProps } from '@mantine/core';
import {
  ClientStatus,
  TechnicianStatus,
  TicketStatus,
  TicketPriority,
  AppointmentStatus
} from '../../types';

export interface StatusBadgeProps extends Omit<BadgeProps, 'color' | 'variant'> {
  status: ClientStatus | TechnicianStatus | TicketStatus | TicketPriority | AppointmentStatus | string;
  variant?: 'light' | 'filled' | 'outline' | 'dot';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Get appropriate color for different status types
 */
const getStatusColor = (status: string): string => {
  // Client statuses
  if (status === ClientStatus.ACTIVE) return 'green';
  if (status === ClientStatus.SUSPENDED) return 'yellow';
  if (status === ClientStatus.TERMINATED) return 'red';

  // Technician statuses
  if (status === TechnicianStatus.ACTIVE) return 'green';
  if (status === TechnicianStatus.ON_VACATION) return 'blue';
  if (status === TechnicianStatus.SICK_LEAVE) return 'orange';
  if (status === TechnicianStatus.TERMINATED) return 'red';

  // Ticket statuses
  if (status === TicketStatus.OPEN) return 'blue';
  if (status === TicketStatus.CLOSED) return 'green';

  // Ticket priorities
  if (status === TicketPriority.URGENT) return 'red';
  if (status === TicketPriority.HIGH) return 'orange';
  if (status === TicketPriority.MEDIUM) return 'yellow';
  if (status === TicketPriority.LOW) return 'green';

  // Appointment statuses
  if (status === AppointmentStatus.PENDING) return 'yellow';
  if (status === AppointmentStatus.CONFIRMED) return 'blue';
  if (status === AppointmentStatus.IN_PROGRESS) return 'orange';
  if (status === AppointmentStatus.COMPLETED) return 'green';
  if (status === AppointmentStatus.CANCELLED) return 'red';
  if (status === AppointmentStatus.NO_SHOW) return 'red';

  // Special status indicators
  if (status === 'OVERDUE') return 'red';
  if (status === 'UNASSIGNED') return 'yellow';
  if (status === 'ACTIVE') return 'green';

  // Default
  return 'gray';
};

/**
 * Format status text for display
 */
const formatStatusText = (status: string): string => {
  return status
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * StatusBadge component
 */
export function StatusBadge({
  status,
  variant = 'light',
  size = 'sm',
  children,
  ...props
}: StatusBadgeProps) {
  const color = getStatusColor(status);
  const displayText = children || formatStatusText(status);

  return (
    <Badge
      color={color}
      variant={variant}
      size={size}
      {...props}
    >
      {displayText}
    </Badge>
  );
}

/**
 * Specialized status badge components for type safety
 */

export interface ClientStatusBadgeProps extends Omit<StatusBadgeProps, 'status'> {
  status: ClientStatus;
}

export function ClientStatusBadge({ status, ...props }: ClientStatusBadgeProps) {
  return <StatusBadge status={status} {...props} />;
}

export interface TechnicianStatusBadgeProps extends Omit<StatusBadgeProps, 'status'> {
  status: TechnicianStatus;
}

export function TechnicianStatusBadge({ status, ...props }: TechnicianStatusBadgeProps) {
  return <StatusBadge status={status} {...props} />;
}

export interface TicketStatusBadgeProps extends Omit<StatusBadgeProps, 'status'> {
  status: TicketStatus;
}

export function TicketStatusBadge({ status, ...props }: TicketStatusBadgeProps) {
  return <StatusBadge status={status} {...props} />;
}

export interface PriorityBadgeProps extends Omit<StatusBadgeProps, 'status'> {
  priority: TicketPriority;
}

export function PriorityBadge({ priority, ...props }: PriorityBadgeProps) {
  return <StatusBadge status={priority} {...props} />;
}

export interface AppointmentStatusBadgeProps extends Omit<StatusBadgeProps, 'status'> {
  status: AppointmentStatus;
}

export function AppointmentStatusBadge({ status, ...props }: AppointmentStatusBadgeProps) {
  return <StatusBadge status={status} {...props} />;
}

export default StatusBadge;