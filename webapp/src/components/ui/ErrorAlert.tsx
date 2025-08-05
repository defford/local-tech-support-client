/**
 * Error alert component for displaying errors
 * Built with ShadCN UI Alert component
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, ChevronDown, ChevronUp, X, AlertTriangle, Info } from 'lucide-react';
import { useState } from 'react';
import { ApiError } from '../../types';
import { ApiClientUtils } from '../../services/api/client';
import { cn } from '@/lib/utils';

export interface ErrorAlertProps {
  error: Error | ApiError | string;
  title?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  showDetails?: boolean;
  onClose?: () => void;
  variant?: 'destructive' | 'default';
  className?: string;
}

/**
 * Get user-friendly error message
 */
const getErrorMessage = (error: Error | ApiError | string): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'status' in error) {
    return ApiClientUtils.getUserFriendlyErrorMessage(error as ApiError);
  }

  return (error as Error).message || 'An unexpected error occurred';
};

/**
 * Get error details for display
 */
const getErrorDetails = (error: Error | ApiError | string): string | null => {
  if (typeof error === 'string') {
    return null;
  }

  if (error && typeof error === 'object' && 'status' in error) {
    const apiError = error as ApiError;
    return JSON.stringify({
      status: apiError.status,
      path: apiError.path,
      timestamp: apiError.timestamp,
      details: apiError.details
    }, null, 2);
  }

  return (error as Error).stack || null;
};

/**
 * Get appropriate icon for variant
 */
const getVariantIcon = (variant: 'destructive' | 'default') => {
  switch (variant) {
    case 'destructive':
      return AlertCircle;
    default:
      return Info;
  }
};

/**
 * ErrorAlert component
 */
export function ErrorAlert({
  error,
  title = 'Error',
  showRetry = false,
  onRetry,
  showDetails = false,
  onClose,
  variant = 'destructive',
  className,
  ...props
}: ErrorAlertProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const errorMessage = getErrorMessage(error);
  const errorDetails = getErrorDetails(error);
  const hasDetails = showDetails && errorDetails;
  const Icon = getVariantIcon(variant);

  return (
    <Alert variant={variant} className={cn('relative', className)} {...props}>
      <Icon className="h-4 w-4" />
      
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
      
      <AlertTitle className={onClose ? 'pr-6' : ''}>{title}</AlertTitle>
      
      <AlertDescription className="mt-2">
        <div>
          <p className="mb-3">{errorMessage}</p>

          {(hasDetails || showRetry) && (
            <div className="flex gap-2 flex-wrap">
              {showRetry && onRetry && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRetry}
                  className="h-8"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              )}

              {hasDetails && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDetailsOpen(!detailsOpen)}
                  className="h-8"
                >
                  {detailsOpen ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Show Details
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {hasDetails && detailsOpen && (
            <div className="mt-3">
              <pre className="text-xs bg-muted p-2 rounded border overflow-auto max-h-48 font-mono">
                {errorDetails}
              </pre>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Network error alert
 */
export function NetworkErrorAlert({ onRetry, ...props }: Omit<ErrorAlertProps, 'error'>) {
  return (
    <ErrorAlert
      error="Unable to connect to the server. Please check your internet connection and try again."
      title="Connection Error"
      showRetry
      onRetry={onRetry}
      variant="destructive"
      {...props}
    />
  );
}

/**
 * Validation error alert
 */
export function ValidationErrorAlert({ error, ...props }: ErrorAlertProps) {
  return (
    <ErrorAlert
      error={error}
      title="Validation Error"
      variant="default"
      {...props}
    />
  );
}

/**
 * Permission error alert
 */
export function PermissionErrorAlert(props: Omit<ErrorAlertProps, 'error'>) {
  return (
    <ErrorAlert
      error="You don't have permission to perform this action."
      title="Access Denied"
      variant="destructive"
      {...props}
    />
  );
}

/**
 * Not found error alert
 */
export function NotFoundErrorAlert({ resource = 'resource', ...props }: Omit<ErrorAlertProps, 'error'> & { resource?: string }) {
  return (
    <ErrorAlert
      error={`The requested ${resource} was not found.`}
      title="Not Found"
      variant="default"
      {...props}
    />
  );
}

export default ErrorAlert;