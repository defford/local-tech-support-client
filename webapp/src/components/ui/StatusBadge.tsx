/**
 * Status badge component for displaying various entity statuses
 * Built with ShadCN UI Badge component
 */

import { Badge } from '@/components/ui/badge';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import {
  ClientStatus,
  TechnicianStatus,
  TicketStatus,
  TicketPriority,
  AppointmentStatus
} from '../../types';

const statusBadgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'text-foreground',
        success: 'border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
        warning: 'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
        info: 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
        error: 'border-transparent bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
        gray: 'border-transparent bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-0.5',
        lg: 'text-sm px-3 py-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  }
);

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof statusBadgeVariants> {
  status: ClientStatus | TechnicianStatus | TicketStatus | TicketPriority | AppointmentStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Get appropriate variant for different status types
 */
const getStatusVariant = (status: string): 'success' | 'warning' | 'info' | 'error' | 'gray' => {
  // Client statuses
  if (status === ClientStatus.ACTIVE) return 'success';
  if (status === ClientStatus.SUSPENDED) return 'warning';
  if (status === ClientStatus.TERMINATED) return 'error';

  // Technician statuses
  if (status === TechnicianStatus.ACTIVE) return 'success';
  if (status === TechnicianStatus.ON_VACATION) return 'info';
  if (status === TechnicianStatus.SICK_LEAVE) return 'warning';
  if (status === TechnicianStatus.TERMINATED) return 'error';

  // Ticket statuses
  if (status === TicketStatus.OPEN) return 'info';
  if (status === TicketStatus.CLOSED) return 'success';

  // Ticket priorities
  if (status === TicketPriority.URGENT) return 'error';
  if (status === TicketPriority.HIGH) return 'warning';
  if (status === TicketPriority.MEDIUM) return 'warning';
  if (status === TicketPriority.LOW) return 'success';

  // Appointment statuses
  if (status === AppointmentStatus.PENDING) return 'warning';
  if (status === AppointmentStatus.CONFIRMED) return 'info';
  if (status === AppointmentStatus.IN_PROGRESS) return 'warning';
  if (status === AppointmentStatus.COMPLETED) return 'success';
  if (status === AppointmentStatus.CANCELLED) return 'error';
  if (status === AppointmentStatus.NO_SHOW) return 'error';

  // Special status indicators
  if (status === 'OVERDUE') return 'error';
  if (status === 'UNASSIGNED') return 'warning';
  if (status === 'ACTIVE') return 'success';

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
  size = 'sm',
  className,
  children,
  ...props
}: StatusBadgeProps) {
  const variant = getStatusVariant(status);
  const displayText = children || formatStatusText(status);

  return (
    <div
      className={cn(statusBadgeVariants({ variant, size }), className)}
      {...props}
    >
      {displayText}
    </div>
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