/**
 * Axios client configuration for the Tech Support API
 */

import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { ApiError, DEFAULT_API_CONFIG, HttpStatusCode } from '../../types/api';

/**
 * Create and configure the Axios instance
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: DEFAULT_API_CONFIG.baseURL,
    timeout: DEFAULT_API_CONFIG.timeout,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      // Add timestamp to requests for cache busting if needed
      if (config.method === 'get') {
        config.params = {
          ...config.params,
          _t: Date.now()
        };
      }

      // Log requests in development
      if (import.meta.env.DEV) {
        console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
          params: config.params,
          data: config.data
        });
      }

      return config;
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log successful responses in development
      if (import.meta.env.DEV) {
        console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, {
          status: response.status,
          data: response.data
        });
      }

      return response;
    },
    (error: AxiosError) => {
      // Log errors in development
      if (import.meta.env.DEV) {
        console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data
        });
      }

      // Transform Axios error to our ApiError format
      const apiError: ApiError = {
        message: error.message || 'An unexpected error occurred',
        status: error.response?.status || 500,
        timestamp: new Date().toISOString(),
        path: error.config?.url || '',
        error: error.response?.statusText,
        details: error.response?.data as Record<string, unknown>
      };

      // Handle specific error cases
      if (error.response?.status === 401) {
        // Handle unauthorized - could redirect to login
        apiError.message = 'Authentication required';
      } else if (error.response?.status === 403) {
        apiError.message = 'Access forbidden';
      } else if (error.response?.status === 404) {
        apiError.message = 'Resource not found';
      } else if (error.response?.status === 422) {
        apiError.message = 'Validation failed';
      } else if (error.response && error.response.status >= 500) {
        apiError.message = 'Server error occurred';
      } else if (error.code === 'ECONNABORTED') {
        apiError.message = 'Request timeout';
      } else if (error.code === 'ERR_NETWORK') {
        apiError.message = 'Network error - please check your connection';
      }

      return Promise.reject(apiError);
    }
  );

  return client;
};

// Create the singleton API client instance
export const apiClient = createApiClient();

/**
 * Utility functions for common API operations
 */
export const ApiClientUtils = {
  /**
   * Check if error is a network error
   */
  isNetworkError: (error: ApiError): boolean => {
    return error.status === 0 || error.message.includes('Network error');
  },

  /**
   * Check if error is a server error (5xx)
   */
  isServerError: (error: ApiError): boolean => {
    return error.status >= 500;
  },

  /**
   * Check if error is a client error (4xx)
   */
  isClientError: (error: ApiError): boolean => {
    return error.status >= 400 && error.status < 500;
  },

  /**
   * Get user-friendly error message
   */
  getUserFriendlyErrorMessage: (error: ApiError): string => {
    if (ApiClientUtils.isNetworkError(error)) {
      return 'Unable to connect to the server. Please check your connection and try again.';
    }

    if (error.status === 404) {
      return 'The requested resource was not found.';
    }

    if (error.status === 422) {
      return 'Please check your input and try again.';
    }

    if (ApiClientUtils.isServerError(error)) {
      return 'A server error occurred. Please try again later.';
    }

    return error.message || 'An unexpected error occurred.';
  },

  /**
   * Retry logic for failed requests
   */
  shouldRetry: (error: ApiError, attempt: number): boolean => {
    const maxRetries = DEFAULT_API_CONFIG.retries;
    
    if (attempt >= maxRetries) {
      return false;
    }

    // Retry on network errors and server errors
    return ApiClientUtils.isNetworkError(error) || ApiClientUtils.isServerError(error);
  },

  /**
   * Calculate retry delay (exponential backoff)
   */
  getRetryDelay: (attempt: number): number => {
    return Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10 seconds
  }
};

export default apiClient;