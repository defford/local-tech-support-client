/**
 * Tests for ClientDetailPage component
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClientDetailPage } from '../../../pages/clients/ClientDetailPage';
import { ClientStatus } from '../../../types';
import { renderWithProviders } from '../../utils/test-utils';

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockUseParams = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams(),
  ...vi.importActual('react-router-dom')
}));

// Mock the hooks
vi.mock('../../../hooks', () => ({
  useClient: vi.fn(),
  useClientTickets: vi.fn(),
  useClientAppointments: vi.fn()
}));

// Mock the components
vi.mock('../../../components/forms/ClientModal', () => ({
  ClientModal: vi.fn(({ opened, onClose }) => 
    opened ? <div data-testid="client-modal">Edit Client Modal</div> : null
  )
}));

const mockClient = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '1234567890',
  address: '123 Main St',
  notes: 'Test client notes',
  status: ClientStatus.ACTIVE,
  active: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z'
};

const mockTicketsData = {
  content: [
    {
      id: 1,
      title: 'Computer Issue',
      status: 'OPEN',
      priority: 'HIGH',
      createdAt: '2024-01-10T00:00:00Z'
    },
    {
      id: 2,
      title: 'Network Problem',
      status: 'CLOSED',
      priority: 'MEDIUM',
      createdAt: '2024-01-08T00:00:00Z'
    }
  ],
  totalElements: 2,
  totalPages: 1,
  number: 0,
  size: 50
};

const mockAppointmentsData = {
  content: [
    {
      id: 1,
      title: 'System Maintenance',
      status: 'SCHEDULED',
      scheduledDate: '2024-01-20T10:00:00Z',
      technician: {
        firstName: 'Alice',
        lastName: 'Johnson'
      }
    }
  ],
  totalElements: 1,
  totalPages: 1,
  number: 0,
  size: 50
};

const mockUseClient = vi.fn();
const mockUseClientTickets = vi.fn();
const mockUseClientAppointments = vi.fn();

describe('ClientDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock URL params
    mockUseParams.mockReturnValue({ id: '1' });
    
    const hooks = require('../../../hooks');
    hooks.useClient.mockImplementation(mockUseClient);
    hooks.useClientTickets.mockImplementation(mockUseClientTickets);
    hooks.useClientAppointments.mockImplementation(mockUseClientAppointments);

    // Default successful data fetch
    mockUseClient.mockReturnValue({
      data: mockClient,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });
    
    mockUseClientTickets.mockReturnValue({
      data: mockTicketsData,
      isLoading: false,
      error: null
    });
    
    mockUseClientAppointments.mockReturnValue({
      data: mockAppointmentsData,
      isLoading: false,
      error: null
    });
  });

  it('should render client detail page with client information', async () => {
    renderWithProviders(<ClientDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('Client Details')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('1234567890')).toBeInTheDocument();
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByText('Test client notes')).toBeInTheDocument();
  });

  it('should render loading state', () => {
    mockUseClient.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: vi.fn()
    });

    renderWithProviders(<ClientDetailPage />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should render error state', () => {
    const error = new Error('Failed to fetch client');
    mockUseClient.mockReturnValue({
      data: null,
      isLoading: false,
      error,
      refetch: vi.fn()
    });

    renderWithProviders(<ClientDetailPage />);

    expect(screen.getByText('Failed to load client')).toBeInTheDocument();
  });

  it('should navigate back to clients list when back button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ClientDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/clients');
  });

  it('should open edit modal when Edit Client button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ClientDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit client/i });
    await user.click(editButton);

    expect(screen.getByTestId('client-modal')).toBeInTheDocument();
  });

  it('should display quick stats correctly', async () => {
    renderWithProviders(<ClientDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('2')).toBeInTheDocument(); // Total tickets
    expect(screen.getByText('1')).toBeInTheDocument(); // Total appointments
    expect(screen.getByText('1/15/2024')).toBeInTheDocument(); // Last updated
  });

  it('should switch between tabs correctly', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ClientDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Should start on Overview tab
    expect(screen.getByText(/This client has been with us since/)).toBeInTheDocument();

    // Switch to Tickets tab
    const ticketsTab = screen.getByRole('tab', { name: /tickets/i });
    await user.click(ticketsTab);

    expect(screen.getByText('Ticket History')).toBeInTheDocument();
    expect(screen.getByText('Computer Issue')).toBeInTheDocument();
    expect(screen.getByText('Network Problem')).toBeInTheDocument();

    // Switch to Appointments tab
    const appointmentsTab = screen.getByRole('tab', { name: /appointments/i });
    await user.click(appointmentsTab);

    expect(screen.getByText('Appointment History')).toBeInTheDocument();
    expect(screen.getByText('System Maintenance')).toBeInTheDocument();
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
  });

  it('should display client status warning for non-active clients', async () => {
    const suspendedClient = { ...mockClient, status: ClientStatus.SUSPENDED };
    mockUseClient.mockReturnValue({
      data: suspendedClient,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });

    renderWithProviders(<ClientDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText(/This client account is currently suspended/)).toBeInTheDocument();
  });

  it('should handle missing optional fields gracefully', async () => {
    const clientWithoutOptionalFields = {
      ...mockClient,
      address: undefined,
      notes: undefined
    };

    mockUseClient.mockReturnValue({
      data: clientWithoutOptionalFields,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });

    renderWithProviders(<ClientDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Should not show address or notes sections
    expect(screen.queryByText('123 Main St')).not.toBeInTheDocument();
    expect(screen.queryByText('Test client notes')).not.toBeInTheDocument();
  });

  it('should handle tickets loading error', async () => {
    const ticketsError = new Error('Failed to load tickets');
    mockUseClientTickets.mockReturnValue({
      data: null,
      isLoading: false,
      error: ticketsError
    });

    renderWithProviders(<ClientDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Switch to tickets tab to see the error
    const user = userEvent.setup();
    const ticketsTab = screen.getByRole('tab', { name: /tickets/i });
    await user.click(ticketsTab);

    expect(screen.getByText('Failed to load tickets')).toBeInTheDocument();
  });

  it('should handle appointments loading error', async () => {
    const appointmentsError = new Error('Failed to load appointments');
    mockUseClientAppointments.mockReturnValue({
      data: null,
      isLoading: false,
      error: appointmentsError
    });

    renderWithProviders(<ClientDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Switch to appointments tab to see the error
    const user = userEvent.setup();
    const appointmentsTab = screen.getByRole('tab', { name: /appointments/i });
    await user.click(appointmentsTab);

    expect(screen.getByText('Failed to load appointments')).toBeInTheDocument();
  });

  it('should handle invalid client ID', () => {
    mockUseParams.mockReturnValue({ id: 'invalid' });

    renderWithProviders(<ClientDetailPage />);

    // The hook should be called with NaN, which should be handled gracefully
    expect(mockUseClient).toHaveBeenCalledWith(NaN, false);
  });
});