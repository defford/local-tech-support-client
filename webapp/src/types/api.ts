/**
 * API-specific types for request/response handling
 */

/**
 * Standard API error response
 */
export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
  path: string;
  error?: string;
  details?: Record<string, unknown>;
}

/**
 * API response wrapper for single items
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

/**
 * API configuration
 */
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
}

/**
 * HTTP methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Request configuration for API calls
 */
export interface RequestConfig {
  method: HttpMethod;
  url: string;
  data?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  timeout?: number;
}

/**
 * Search parameters for entity queries
 */
export interface SearchParams {
  query?: string;
  status?: string;
  serviceType?: string;
  priority?: string;
  assignedTechnicianId?: number;
  clientId?: number;
  startDate?: string;
  endDate?: string;
  sort?: string;
  page?: number;
  size?: number;
}

/**
 * Bulk operation request
 */
export interface BulkOperationRequest<T> {
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  items: T[];
  options?: Record<string, unknown>;
}

/**
 * Bulk operation response
 */
export interface BulkOperationResponse<T> {
  successful: T[];
  failed: BulkOperationError<T>[];
  totalProcessed: number;
  successCount: number;
  failureCount: number;
}

/**
 * Bulk operation error
 */
export interface BulkOperationError<T> {
  item: T;
  error: string;
  index: number;
}

/**
 * File upload request
 */
export interface FileUploadRequest {
  file: File;
  entityId?: number;
  entityType?: string;
  description?: string;
}

/**
 * File upload response
 */
export interface FileUploadResponse {
  id: number;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  url: string;
}

/**
 * API health check response
 */
export interface HealthCheckResponse {
  status: 'UP' | 'DOWN';
  timestamp: string;
  version: string;
  database: {
    status: 'UP' | 'DOWN';
    responseTime: number;
  };
  memory: {
    used: number;
    max: number;
    free: number;
  };
  uptime: number;
}

/**
 * Validation error details
 */
export interface ValidationError {
  field: string;
  rejectedValue: unknown;
  message: string;
  code: string;
}

/**
 * Validation error response
 */
export interface ValidationErrorResponse extends ApiError {
  validationErrors: ValidationError[];
}

/**
 * Type guard for API errors
 */
export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'status' in error &&
    'timestamp' in error
  );
};

/**
 * Type guard for validation errors
 */
export const isValidationError = (error: unknown): error is ValidationErrorResponse => {
  return isApiError(error) && 'validationErrors' in error;
};

/**
 * Default API configuration
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 30000, // 30 seconds
  retries: 3
};

/**
 * Common HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

export type HttpStatusCode = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];