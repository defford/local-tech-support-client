/**
 * Central export file for UI components
 */

export { DataTable } from './DataTable';
export type { DataTableProps, DataTableColumn } from './DataTable';

export { 
  StatusBadge,
  ClientStatusBadge,
  TechnicianStatusBadge,
  TicketStatusBadge,
  PriorityBadge,
  AppointmentStatusBadge
} from './StatusBadge';
export type { 
  StatusBadgeProps,
  ClientStatusBadgeProps,
  TechnicianStatusBadgeProps,
  TicketStatusBadgeProps,
  PriorityBadgeProps,
  AppointmentStatusBadgeProps
} from './StatusBadge';

export {
  LoadingSpinner,
  InlineSpinner,
  TableLoadingSpinner,
  PageLoadingSpinner,
  CardLoadingSpinner
} from './LoadingSpinner';
export type { LoadingSpinnerProps } from './LoadingSpinner';

export {
  ErrorAlert,
  NetworkErrorAlert,
  ValidationErrorAlert,
  PermissionErrorAlert,
  NotFoundErrorAlert
} from './ErrorAlert';
export type { ErrorAlertProps } from './ErrorAlert';