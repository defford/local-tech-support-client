/**
 * Generic paged response wrapper for API responses
 * Converted from Java PagedResponse model
 */
export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // Current page number (0-based)
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  pageable?: unknown;
  sort?: unknown;
}

/**
 * Pagination parameters for API requests
 */
export interface PaginationParams {
  page?: number; // 0-based page number
  size?: number; // Page size
  sort?: string; // Sort field and direction (e.g., "name,asc")
}

/**
 * Utility functions for PagedResponse operations
 */
export const PagedResponseUtils = {
  /**
   * Check if response has content
   */
  hasContent: <T>(response: PagedResponse<T>): boolean => {
    return response.content && response.content.length > 0;
  },

  /**
   * Check if there's a next page
   */
  hasNext: <T>(response: PagedResponse<T>): boolean => {
    return !response.last;
  },

  /**
   * Check if there's a previous page
   */
  hasPrevious: <T>(response: PagedResponse<T>): boolean => {
    return !response.first;
  },

  /**
   * Get next page number (1-based for UI display)
   */
  getNextPageNumber: <T>(response: PagedResponse<T>): number | null => {
    return PagedResponseUtils.hasNext(response) ? response.number + 2 : null;
  },

  /**
   * Get previous page number (1-based for UI display)
   */
  getPreviousPageNumber: <T>(response: PagedResponse<T>): number | null => {
    return PagedResponseUtils.hasPrevious(response) ? response.number : null;
  },

  /**
   * Get current page number (1-based for UI display)
   */
  getCurrentPageNumber: <T>(response: PagedResponse<T>): number => {
    return response.number + 1;
  },

  /**
   * Get page range text (e.g., "Showing 1-10 of 25")
   */
  getPageRangeText: <T>(response: PagedResponse<T>): string => {
    if (response.empty) {
      return 'No items found';
    }

    const start = response.number * response.size + 1;
    const end = Math.min(start + response.numberOfElements - 1, response.totalElements);
    
    return `Showing ${start}-${end} of ${response.totalElements}`;
  },

  /**
   * Create default pagination params
   */
  createDefaultParams: (overrides?: Partial<PaginationParams>): PaginationParams => {
    return {
      page: 0,
      size: 20,
      sort: 'id,desc',
      ...overrides
    };
  }
};