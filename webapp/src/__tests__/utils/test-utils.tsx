/**
 * Custom testing utilities
 * Provides pre-configured wrappers for testing React components
 * TODO: Add ShadCN UI providers when integrated
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Create a custom render function that includes providers
function AllTheProviders({ children }: { children: React.ReactNode }) {
  // Create a new QueryClient for each test to ensure isolation
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries in tests
        gcTime: 0, // Disable caching in tests
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {/* TODO: Add ShadCN UI ThemeProvider here when integrated */}
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Export everything from @testing-library/react
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Helper function to create a test query client
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {}, // Silence errors in tests
    },
  });
};

// Test QueryClientProvider for hook testing
export const TestQueryClientProvider = ({ children, client }: { 
  children: React.ReactNode; 
  client: QueryClient;
}) => (
  <QueryClientProvider client={client}>
    {/* TODO: Add ShadCN UI ThemeProvider here when integrated */}
    {children}
  </QueryClientProvider>
);

// Alternative render function with providers
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });