/**
 * Error alert component with basic HTML/CSS implementation
 * TODO: Replace with ShadCN UI Alert component
 */

import { IconExclamationTriangle, IconRefresh, IconX } from '@tabler/icons-react';
import { useState } from 'react';

export interface ErrorAlertProps {
  error: string | Error | any;
  title?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  showDetails?: boolean;
  onClose?: () => void;
  variant?: 'error' | 'warning' | 'info';
}

export function ErrorAlert({
  error,
  title = 'Error',
  showRetry = false,
  onRetry,
  showDetails = false,
  onClose,
  variant = 'error'
}: ErrorAlertProps) {
  const [showFullDetails, setShowFullDetails] = useState(false);
  
  const errorMessage = typeof error === 'string' 
    ? error 
    : error?.message || error?.toString() || 'An unexpected error occurred';

  const variantClasses = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const iconColor = {
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  };

  return (
    <div className={`border rounded-md p-4 ${variantClasses[variant]}`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${iconColor[variant]}`}>
          <IconExclamationTriangle size={20} />
        </div>
        
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">{title}</h3>
            {onClose && (
              <button
                onClick={onClose}
                className={`ml-2 ${iconColor[variant]} hover:opacity-75`}
              >
                <IconX size={16} />
              </button>
            )}
          </div>
          
          <div className="mt-2 text-sm">
            <p>{errorMessage}</p>
            
            {showDetails && error?.stack && (
              <div className="mt-2">
                <button
                  onClick={() => setShowFullDetails(!showFullDetails)}
                  className="text-xs underline hover:no-underline"
                >
                  {showFullDetails ? 'Hide details' : 'Show details'}
                </button>
                
                {showFullDetails && (
                  <pre className="mt-2 text-xs bg-white bg-opacity-50 p-2 rounded border overflow-x-auto">
                    {error.stack}
                  </pre>
                )}
              </div>
            )}
          </div>
          
          {showRetry && onRetry && (
            <div className="mt-3">
              <button
                onClick={onRetry}
                className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md ${
                  variant === 'error' 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : variant === 'warning'
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <IconRefresh size={16} />
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function NetworkErrorAlert({ onRetry, ...props }: Omit<ErrorAlertProps, 'error'>) {
  return (
    <ErrorAlert
      error="Network connection failed. Please check your internet connection and try again."
      title="Connection Error"
      showRetry
      onRetry={onRetry}
      variant="error"
      {...props}
    />
  );
}

export function ValidationErrorAlert({ error, ...props }: ErrorAlertProps) {
  return (
    <ErrorAlert
      error={error}
      title="Validation Error"
      variant="warning"
      {...props}
    />
  );
}

export function PermissionErrorAlert(props: Omit<ErrorAlertProps, 'error'>) {
  return (
    <ErrorAlert
      error="You don't have permission to perform this action."
      title="Permission Denied"
      variant="error"
      {...props}
    />
  );
}

export function NotFoundErrorAlert({ resource = 'resource', ...props }: Omit<ErrorAlertProps, 'error'> & { resource?: string }) {
  return (
    <ErrorAlert
      error={`The requested ${resource} could not be found.`}
      title="Not Found"
      variant="warning"
      {...props}
    />
  );
}

export default ErrorAlert;