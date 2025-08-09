/**
 * UI Components index - Basic HTML/CSS implementations
 * TODO: Replace with ShadCN UI components
 */

// DataTable
export { default as DataTable } from './DataTable';
export type { DataTableProps, DataTableColumn } from './DataTable';

// Status Badges
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

// Loading Spinners
export {
  LoadingSpinner,
  TableLoadingSpinner,
  PageLoadingSpinner,
  CardLoadingSpinner
} from './LoadingSpinner';
export type { LoadingSpinnerProps } from './LoadingSpinner';

// Error Alerts
export {
  ErrorAlert,
  NetworkErrorAlert,
  ValidationErrorAlert,
  PermissionErrorAlert,
  NotFoundErrorAlert
} from './ErrorAlert';
export type { ErrorAlertProps } from './ErrorAlert';