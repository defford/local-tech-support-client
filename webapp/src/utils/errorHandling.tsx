/**
 * Enhanced error handling utilities for the Tech Support System
 * Provides consistent error handling, user-friendly messages, and recovery actions
 */

import React from 'react';

/**
 * Error types that can occur in the application
 */
export type AppErrorType = 
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR' 
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'CONFLICT_ERROR'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * Enhanced error interface with user-friendly messaging
 */
export interface AppError {
  type: AppErrorType;
  message: string;
  userMessage: string;
  details?: any;
  timestamp: string;
  component?: string;
  action?: string;
  recoveryActions?: RecoveryAction[];
}

/**
 * Recovery actions that can be suggested to users
 */
export interface RecoveryAction {
  label: string;
  action: () => void;
  priority: 'primary' | 'secondary';
}

/**
 * Error handling utility class
 */
export class ErrorHandler {
  /**
   * Transform an unknown error into a structured AppError
   */
  static transformError(
    error: unknown, 
    component?: string, 
    action?: string
  ): AppError {
    const timestamp = new Date().toISOString();
    
    // Handle network errors
    if (error instanceof Error && error.name === 'NetworkError') {
      return {
        type: 'NETWORK_ERROR',
        message: error.message,
        userMessage: 'Unable to connect to the server. Please check your internet connection.',
        timestamp,
        component,
        action,
        recoveryActions: [
          {
            label: 'Retry',
            action: () => window.location.reload(),
            priority: 'primary'
          },
          {
            label: 'Check Connection',
            action: () => window.open('https://www.google.com', '_blank'),
            priority: 'secondary'
          }
        ]
      };
    }

    // Handle HTTP errors from API
    if (error && typeof error === 'object' && 'response' in error) {
      const httpError = error as any;
      const status = httpError.response?.status;
      const data = httpError.response?.data;

      switch (status) {
        case 400:
          return {
            type: 'VALIDATION_ERROR',
            message: data?.message || 'Validation failed',
            userMessage: data?.message || 'Please check your input and try again.',
            details: data?.errors || data,
            timestamp,
            component,
            action
          };
        
        case 401:
          return {
            type: 'AUTHENTICATION_ERROR',
            message: 'Authentication failed',
            userMessage: 'Your session has expired. Please log in again.',
            timestamp,
            component,
            action,
            recoveryActions: [
              {
                label: 'Log In',
                action: () => window.location.href = '/login',
                priority: 'primary'
              }
            ]
          };

        case 403:
          return {
            type: 'AUTHORIZATION_ERROR',
            message: 'Access denied',
            userMessage: 'You don\'t have permission to perform this action.',
            timestamp,
            component,
            action
          };

        case 404:
          return {
            type: 'NOT_FOUND_ERROR',
            message: data?.message || 'Resource not found',
            userMessage: 'The requested item could not be found. It may have been deleted or moved.',
            timestamp,
            component,
            action,
            recoveryActions: [
              {
                label: 'Go Back',
                action: () => window.history.back(),
                priority: 'primary'
              },
              {
                label: 'Refresh Page',
                action: () => window.location.reload(),
                priority: 'secondary'
              }
            ]
          };

        case 409:
          return {
            type: 'CONFLICT_ERROR',
            message: data?.message || 'Conflict occurred',
            userMessage: data?.message || 'This action conflicts with existing data. Please refresh and try again.',
            details: data,
            timestamp,
            component,
            action,
            recoveryActions: [
              {
                label: 'Refresh',
                action: () => window.location.reload(),
                priority: 'primary'
              }
            ]
          };

        case 500:
        case 502:
        case 503:
        case 504:
          return {
            type: 'SERVER_ERROR',
            message: data?.message || 'Server error occurred',
            userMessage: 'A server error occurred. Our team has been notified. Please try again later.',
            details: data,
            timestamp,
            component,
            action,
            recoveryActions: [
              {
                label: 'Try Again',
                action: () => window.location.reload(),
                priority: 'primary'
              }
            ]
          };

        default:
          return {
            type: 'UNKNOWN_ERROR',
            message: data?.message || httpError.message || 'HTTP error occurred',
            userMessage: 'An unexpected error occurred. Please try again.',
            details: { status, data },
            timestamp,
            component,
            action
          };
      }
    }

    // Handle standard JavaScript errors
    if (error instanceof Error) {
      return {
        type: 'UNKNOWN_ERROR',
        message: error.message,
        userMessage: 'An unexpected error occurred. Please try again.',
        details: { stack: error.stack },
        timestamp,
        component,
        action
      };
    }

    // Handle unknown error types
    return {
      type: 'UNKNOWN_ERROR',
      message: String(error),
      userMessage: 'An unexpected error occurred. Please try again.',
      details: error,
      timestamp,
      component,
      action
    };
  }

  /**
   * Log errors for debugging and monitoring
   */
  static logError(error: AppError): void {
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error in ${error.component || 'Unknown Component'}`);
      console.error('Type:', error.type);
      console.error('Message:', error.message);
      console.error('User Message:', error.userMessage);
      console.error('Action:', error.action);
      console.error('Details:', error.details);
      console.error('Timestamp:', error.timestamp);
      console.groupEnd();
    }

    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with error reporting service (e.g., Sentry, LogRocket)
      // reportError(error);
    }
  }

  /**
   * Handle errors with consistent logging and user feedback
   */
  static handle(
    error: unknown,
    component?: string,
    action?: string
  ): AppError {
    const appError = this.transformError(error, component, action);
    this.logError(appError);
    return appError;
  }

  /**
   * Create user-friendly error messages for specific scenarios
   */
  static getTicketErrorMessage(operation: string, error: unknown): string {
    const appError = this.transformError(error, 'TicketManagement', operation);
    
    switch (operation) {
      case 'create':
        if (appError.type === 'VALIDATION_ERROR') {
          return 'Please check all required fields and try again.';
        }
        return 'Failed to create ticket. Please try again.';
      
      case 'update':
        if (appError.type === 'NOT_FOUND_ERROR') {
          return 'This ticket no longer exists. It may have been deleted.';
        }
        if (appError.type === 'CONFLICT_ERROR') {
          return 'This ticket has been updated by someone else. Please refresh and try again.';
        }
        return 'Failed to update ticket. Please try again.';
      
      case 'delete':
        if (appError.type === 'NOT_FOUND_ERROR') {
          return 'This ticket has already been deleted.';
        }
        return 'Failed to delete ticket. Please try again.';
      
      case 'assign':
        if (appError.type === 'NOT_FOUND_ERROR') {
          return 'The selected technician is no longer available.';
        }
        if (appError.type === 'CONFLICT_ERROR') {
          return 'This technician is no longer available for assignment.';
        }
        return 'Failed to assign technician. Please try again.';
      
      default:
        return appError.userMessage;
    }
  }
}

/**
 * Hook for handling errors in React components
 */
export const useErrorHandler = () => {
  const handleError = (error: unknown, component?: string, action?: string) => {
    return ErrorHandler.handle(error, component, action);
  };

  const getTicketErrorMessage = (operation: string, error: unknown) => {
    return ErrorHandler.getTicketErrorMessage(operation, error);
  };

  return {
    handleError,
    getTicketErrorMessage
  };
};

/**
 * Error boundary props
 */
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: AppError; resetError: () => void }>;
  onError?: (error: AppError) => void;
}

/**
 * Default error fallback component
 */
export const DefaultErrorFallback: React.FC<{ 
  error: AppError; 
  resetError: () => void 
}> = ({ error, resetError }) => (
  <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
    <div className="flex items-center mb-4">
      <div className="flex-shrink-0">
        <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <div className="ml-3">
        <h3 className="text-lg font-medium text-gray-900">Something went wrong</h3>
      </div>
    </div>
    
    <p className="text-sm text-gray-700 mb-4">
      {error.userMessage}
    </p>
    
    <div className="flex gap-2">
      <button
        onClick={resetError}
        className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
      >
        Try Again
      </button>
      
      {error.recoveryActions?.map((action, index) => (
        <button
          key={index}
          onClick={action.action}
          className={`px-4 py-2 rounded text-sm ${
            action.priority === 'primary'
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {action.label}
        </button>
      ))}
    </div>
  </div>
);