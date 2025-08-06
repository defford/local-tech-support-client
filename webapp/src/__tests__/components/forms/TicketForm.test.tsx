/**
 * TicketForm Component Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { TicketForm } from '../../../components/forms/TicketForm';
import { ServiceType, TicketPriority } from '../../../types';

// Mock the hooks
vi.mock('../../../hooks', () => ({
  useCreateTicket: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: 1, title: 'Test Ticket' }),
    isPending: false,
    error: null,
  }),
  useUpdateTicket: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: 1, title: 'Updated Ticket' }),
    isPending: false,
    error: null,
  }),
  useClients: () => ({
    data: {
      data: [
        { id: 1, name: 'Test Client', email: 'test@example.com' },
        { id: 2, name: 'Another Client', email: 'another@example.com' },
      ],
    },
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('TicketForm', () => {
  it('renders all form fields correctly', () => {
    render(<TicketForm />, { wrapper: createWrapper() });

    // Check if all form fields are present
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/service type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/client/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
  });

  it('shows validation errors for required fields', async () => {
    const onSuccess = vi.fn();
    render(<TicketForm onSuccess={onSuccess} />, { wrapper: createWrapper() });

    // Submit form without filling required fields
    fireEvent.click(screen.getByRole('button', { name: /create ticket/i }));

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    });
  });

  it('displays Create Ticket button for new tickets', () => {
    render(<TicketForm />, { wrapper: createWrapper() });
    expect(screen.getByRole('button', { name: /create ticket/i })).toBeInTheDocument();
  });

  it('displays Update Ticket button for existing tickets', () => {
    const mockTicket = {
      id: 1,
      title: 'Existing Ticket',
      description: 'Existing description',
      serviceType: ServiceType.HARDWARE,
      priority: TicketPriority.HIGH,
      clientId: 1,
      status: 'OPEN' as const,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };

    render(<TicketForm ticket={mockTicket} />, { wrapper: createWrapper() });
    expect(screen.getByRole('button', { name: /update ticket/i })).toBeInTheDocument();
  });

  it('pre-fills form fields when editing existing ticket', () => {
    const mockTicket = {
      id: 1,
      title: 'Existing Ticket',
      description: 'Existing description',
      serviceType: ServiceType.SOFTWARE,
      priority: TicketPriority.URGENT,
      clientId: 1,
      status: 'OPEN' as const,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };

    render(<TicketForm ticket={mockTicket} />, { wrapper: createWrapper() });

    expect(screen.getByDisplayValue('Existing Ticket')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing description')).toBeInTheDocument();
  });

  it('displays cancel button when onCancel prop is provided', () => {
    const onCancel = vi.fn();
    render(<TicketForm onCancel={onCancel} />, { wrapper: createWrapper() });
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeInTheDocument();
    
    fireEvent.click(cancelButton);
    expect(onCancel).toHaveBeenCalled();
  });
});