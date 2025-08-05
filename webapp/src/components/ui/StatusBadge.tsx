/**
 * Status badge component with basic HTML/CSS implementation
 * TODO: Replace with ShadCN UI Badge component
 */

import { 
  ClientStatus, 
  TechnicianStatus, 
  TicketStatus, 
  TicketPriority, 
  AppointmentStatus 
} from '../../types';

export interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

const getStatusClasses = (status: string) => {
  const normalizedStatus = status.toUpperCase();
  
  // Client statuses
  if (normalizedStatus === ClientStatus.ACTIVE) {
    return 'bg-green-100 text-green-800';
  }
  if (normalizedStatus === ClientStatus.SUSPENDED) {
    return 'bg-yellow-100 text-yellow-800';
  }
  if (normalizedStatus === ClientStatus.TERMINATED) {
    return 'bg-red-100 text-red-800';
  }
  
  // Technician statuses
  if (normalizedStatus === TechnicianStatus.ACTIVE) {
    return 'bg-green-100 text-green-800';
  }
  if (normalizedStatus === TechnicianStatus.ON_BREAK) {
    return 'bg-yellow-100 text-yellow-800';
  }
  if (normalizedStatus === TechnicianStatus.ON_VACATION) {
    return 'bg-blue-100 text-blue-800';
  }
  if (normalizedStatus === TechnicianStatus.INACTIVE) {
    return 'bg-gray-100 text-gray-800';
  }
  
  // Ticket statuses
  if (normalizedStatus === TicketStatus.OPEN) {
    return 'bg-blue-100 text-blue-800';
  }
  if (normalizedStatus === TicketStatus.IN_PROGRESS) {
    return 'bg-yellow-100 text-yellow-800';
  }
  if (normalizedStatus === TicketStatus.RESOLVED) {
    return 'bg-green-100 text-green-800';
  }
  if (normalizedStatus === TicketStatus.CLOSED) {
    return 'bg-gray-100 text-gray-800';
  }
  
  // Ticket priorities
  if (normalizedStatus === TicketPriority.LOW) {
    return 'bg-gray-100 text-gray-800';
  }
  if (normalizedStatus === TicketPriority.MEDIUM) {
    return 'bg-yellow-100 text-yellow-800';
  }
  if (normalizedStatus === TicketPriority.HIGH) {
    return 'bg-orange-100 text-orange-800';
  }
  if (normalizedStatus === TicketPriority.URGENT) {
    return 'bg-red-100 text-red-800';
  }
  
  // Appointment statuses
  if (normalizedStatus === AppointmentStatus.SCHEDULED) {
    return 'bg-blue-100 text-blue-800';
  }
  if (normalizedStatus === AppointmentStatus.IN_PROGRESS) {
    return 'bg-yellow-100 text-yellow-800';
  }
  if (normalizedStatus === AppointmentStatus.COMPLETED) {
    return 'bg-green-100 text-green-800';
  }
  if (normalizedStatus === AppointmentStatus.CANCELLED) {
    return 'bg-red-100 text-red-800';
  }
  
  // Default
  return 'bg-gray-100 text-gray-800';
};

const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
  switch (size) {
    case 'sm':
      return 'px-2 py-1 text-xs';
    case 'lg':
      return 'px-3 py-2 text-base';
    default:
      return 'px-2 py-1 text-sm';
  }
};

export function StatusBadge({ status, size = 'md', children }: StatusBadgeProps) {
  const statusClasses = getStatusClasses(status);
  const sizeClasses = getSizeClasses(size);
  
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${statusClasses} ${sizeClasses}`}>
      {children || status}
    </span>
  );
}

// Type-safe component variants
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