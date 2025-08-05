/**
 * UI Components index - Basic HTML/CSS implementations
 * TODO: Replace with ShadCN UI components
 */

// DataTable
export { default as DataTable } from './DataTable.basic';
export type { DataTableProps, DataTableColumn } from './DataTable.basic';

// Status Badges
export {
  StatusBadge,
  ClientStatusBadge,
  TechnicianStatusBadge,
  TicketStatusBadge,
  PriorityBadge,
  AppointmentStatusBadge
} from './StatusBadge.basic';
export type {
  StatusBadgeProps,
  ClientStatusBadgeProps,
  TechnicianStatusBadgeProps,
  TicketStatusBadgeProps,
  PriorityBadgeProps,
  AppointmentStatusBadgeProps
} from './StatusBadge.basic';

// Loading Spinners
export {
  LoadingSpinner,
  TableLoadingSpinner,
  PageLoadingSpinner,
  CardLoadingSpinner
} from './LoadingSpinner.basic';
export type { LoadingSpinnerProps } from './LoadingSpinner.basic';

// Error Alerts
export {
  ErrorAlert,
  NetworkErrorAlert,
  ValidationErrorAlert,
  PermissionErrorAlert,
  NotFoundErrorAlert
} from './ErrorAlert.basic';
export type { ErrorAlertProps } from './ErrorAlert.basic';