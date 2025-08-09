/**
 * Error alert component for displaying errors
 * Built with Mantine Alert component
 */

import { Alert, Button, Collapse, Group, Text, AlertProps } from '@mantine/core';
import { IconAlertCircle, IconRefresh, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useState } from 'react';
import { ApiError } from '../../types';
import { ApiClientUtils } from '../../services/api/client';

export interface ErrorAlertProps extends Omit<AlertProps, 'title' | 'children'> {
  error: Error | ApiError | string;
  title?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  showDetails?: boolean;
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

  return error.message || 'An unexpected error occurred';
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
 * ErrorAlert component
 */
export function ErrorAlert({
  error,
  title = 'Error',
  showRetry = false,
  onRetry,
  showDetails = false,
  color = 'red',
  variant = 'light',
  className,
  ...props
}: ErrorAlertProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const errorMessage = getErrorMessage(error);
  const errorDetails = getErrorDetails(error);
  const hasDetails = showDetails && errorDetails;

  return (
    <Alert
      icon={<IconAlertCircle size="1rem" />}
      title={title}
      color={color}
      variant={variant}
      className={className}
      {...props}
    >
      <div>
        <Text size="sm" mb={hasDetails || showRetry ? 'sm' : 0}>
          {errorMessage}
        </Text>

        {(hasDetails || showRetry) && (
          <Group gap="sm">
            {showRetry && onRetry && (
              <Button
                size="xs"
                variant="outline"
                leftSection={<IconRefresh size="0.75rem" />}
                onClick={onRetry}
              >
                Retry
              </Button>
            )}

            {hasDetails && (
              <Button
                size="xs"
                variant="subtle"
                rightSection={
                  detailsOpen ? 
                    <IconChevronUp size="0.75rem" /> : 
                    <IconChevronDown size="0.75rem" />
                }
                onClick={() => setDetailsOpen(!detailsOpen)}
              >
                {detailsOpen ? 'Hide Details' : 'Show Details'}
              </Button>
            )}
          </Group>
        )}

        {hasDetails && (
          <Collapse in={detailsOpen}>
            <Text
              size="xs"
              c="dimmed"
              mt="sm"
              component="pre"
              style={{
                backgroundColor: 'var(--mantine-color-gray-0)',
                padding: '8px',
                borderRadius: '4px',
                overflow: 'auto',
                maxHeight: '200px',
                fontFamily: 'monospace'
              }}
            >
              {errorDetails}
            </Text>
          </Collapse>
        )}
      </div>
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
      color="orange"
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
      color="red"
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
      color="yellow"
      {...props}
    />
  );
}

export default ErrorAlert;