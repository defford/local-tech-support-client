/**
 * Basic tests for ClientForm component
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { ClientForm } from '../../../components/forms/ClientForm';
import { ClientStatus } from '../../../types';

// Mock the hooks
vi.mock('../../../hooks', () => ({
  useCreateClient: vi.fn(),
  useUpdateClient: vi.fn()
}));

// Mock notifications
vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn()
  }
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        {children}
      </MantineProvider>
    </QueryClientProvider>
  );
};

describe('ClientForm Basic Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    const { useCreateClient, useUpdateClient } = require('../../../hooks');
    useCreateClient.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null
    });
    useUpdateClient.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null
    });
  });

  it('should render creation form', () => {
    render(
      <TestWrapper>
        <ClientForm onSuccess={vi.fn()} onCancel={vi.fn()} />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create client/i })).toBeInTheDocument();
  });

  it('should render edit form with client data', () => {
    const client = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      status: ClientStatus.ACTIVE,
      active: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };

    render(
      <TestWrapper>
        <ClientForm client={client} onSuccess={vi.fn()} onCancel={vi.fn()} />
      </TestWrapper>
    );

    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update client/i })).toBeInTheDocument();
  });
});