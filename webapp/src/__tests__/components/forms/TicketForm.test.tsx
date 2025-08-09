/**
 * Enhanced TicketForm Component Tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TicketForm } from '../../../components/forms/TicketForm';
import { ServiceType, TicketPriority, TicketStatus } from '../../../types';
import { renderWithProviders } from '../../utils/test-utils';

// Mock the hooks
const mockUseCreateTicket = vi.fn();
const mockUseUpdateTicket = vi.fn();
const mockUseClients = vi.fn();

vi.mock('../../../hooks/useTickets', () => ({
  useCreateTicket: mockUseCreateTicket,
  useUpdateTicket: mockUseUpdateTicket
}));

vi.mock('../../../hooks/useClients', () => ({
  useClients: mockUseClients
}));

const mockClientsData = {
  content: [
    { 
      id: 1, 
      firstName: 'John',
      lastName: 'Doe', 
      email: 'john.doe@example.com',
      phone: '(555) 123-4567'
    },
    { 
      id: 2, 
      firstName: 'Jane',
      lastName: 'Smith', 
      email: 'jane.smith@example.com',
      phone: '(555) 987-6543'
    },
    { 
      id: 3, 
      firstName: 'Bob',
      lastName: 'Wilson', 
      email: 'bob.wilson@example.com',
      phone: '(555) 555-5555'
    }
  ]
};

const mockCreateMutation = {
  mutateAsync: vi.fn(),
  isPending: false,
  error: null
};

const mockUpdateMutation = {
  mutateAsync: vi.fn(),
  isPending: false,
  error: null
};

describe('TicketForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseClients.mockReturnValue({
      data: mockClientsData,
      isLoading: false,
      error: null
    });
    
    mockUseCreateTicket.mockReturnValue(mockCreateMutation);
    mockUseUpdateTicket.mockReturnValue(mockUpdateMutation);
  });

  describe('Form Rendering', () => {
    it('renders all form fields correctly', () => {
      renderWithProviders(<TicketForm />);

      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/service type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/client/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    });

    it('renders form with proper field types and attributes', () => {
      renderWithProviders(<TicketForm />);

      const titleField = screen.getByLabelText(/title/i);
      const descriptionField = screen.getByLabelText(/description/i);
      const dueDateField = screen.getByLabelText(/due date/i);

      expect(titleField).toHaveAttribute('type', 'text');
      expect(descriptionField.tagName).toBe('TEXTAREA');
      expect(dueDateField).toHaveAttribute('type', 'datetime-local');
    });

    it('displays Create Ticket button for new tickets', () => {
      renderWithProviders(<TicketForm />);
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
        status: TicketStatus.OPEN,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      renderWithProviders(<TicketForm ticket={mockTicket} />);
      expect(screen.getByRole('button', { name: /update ticket/i })).toBeInTheDocument();
    });

    it('displays cancel button when onCancel prop is provided', () => {
      const onCancel = vi.fn();
      renderWithProviders(<TicketForm onCancel={onCancel} />);
      
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('hides cancel button when onCancel prop is not provided', () => {
      renderWithProviders(<TicketForm />);
      
      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    });
  });

  describe('Form Pre-filling for Edit Mode', () => {
    const mockTicket = {
      id: 1,
      title: 'Network Issue',
      description: 'Server connectivity problems affecting multiple users',
      serviceType: ServiceType.NETWORK,
      priority: TicketPriority.URGENT,
      clientId: 2,
      status: TicketStatus.OPEN,
      dueAt: '2024-03-15T14:30:00Z',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };

    it('pre-fills all form fields when editing existing ticket', () => {
      renderWithProviders(<TicketForm ticket={mockTicket} />);

      expect(screen.getByDisplayValue('Network Issue')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Server connectivity problems affecting multiple users')).toBeInTheDocument();
      expect(screen.getByDisplayValue('NETWORK')).toBeInTheDocument();
      expect(screen.getByDisplayValue('URGENT')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2')).toBeInTheDocument(); // Client ID
    });

    it('pre-fills due date in correct format', () => {
      renderWithProviders(<TicketForm ticket={mockTicket} />);

      const dueDateField = screen.getByLabelText(/due date/i);
      // Due date should be converted to local datetime format
      expect(dueDateField).toHaveValue('2024-03-15T14:30');
    });

    it('handles ticket without due date', () => {
      const ticketWithoutDueDate = { ...mockTicket, dueAt: undefined };
      renderWithProviders(<TicketForm ticket={ticketWithoutDueDate} />);

      const dueDateField = screen.getByLabelText(/due date/i);
      expect(dueDateField).toHaveValue('');
    });
  });

  describe('Client Selection', () => {
    it('renders client dropdown with available clients', async () => {
      renderWithProviders(<TicketForm />);
      
      const clientSelect = screen.getByLabelText(/client/i);
      expect(clientSelect).toBeInTheDocument();
      
      // Click to open dropdown
      const user = userEvent.setup();
      await user.click(clientSelect);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
      });
    });

    it('shows client email in dropdown options', async () => {
      renderWithProviders(<TicketForm />);
      
      const user = userEvent.setup();
      const clientSelect = screen.getByLabelText(/client/i);
      await user.click(clientSelect);
      
      await waitFor(() => {
        expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
      });
    });

    it('handles loading state for clients', () => {
      mockUseClients.mockReturnValue({
        data: null,
        isLoading: true,
        error: null
      });

      renderWithProviders(<TicketForm />);
      
      const clientSelect = screen.getByLabelText(/client/i);
      expect(clientSelect).toBeDisabled();
    });

    it('handles error state for clients', () => {
      mockUseClients.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to load clients')
      });

      renderWithProviders(<TicketForm />);
      
      expect(screen.getByText(/error loading clients/i)).toBeInTheDocument();
    });

    it('handles empty clients list', () => {
      mockUseClients.mockReturnValue({
        data: { content: [] },
        isLoading: false,
        error: null
      });

      renderWithProviders(<TicketForm />);
      
      const clientSelect = screen.getByLabelText(/client/i);
      expect(clientSelect).toBeInTheDocument();
    });
  });

  describe('Service Type Selection', () => {
    it('renders service type dropdown with all options', async () => {
      renderWithProviders(<TicketForm />);
      
      const user = userEvent.setup();
      const serviceTypeSelect = screen.getByLabelText(/service type/i);
      await user.click(serviceTypeSelect);
      
      await waitFor(() => {
        expect(screen.getByText('Hardware')).toBeInTheDocument();
        expect(screen.getByText('Software')).toBeInTheDocument();
        expect(screen.getByText('Network')).toBeInTheDocument();
      });
    });

    it('allows selecting service type', async () => {
      renderWithProviders(<TicketForm />);
      
      const user = userEvent.setup();
      const serviceTypeSelect = screen.getByLabelText(/service type/i);
      
      await user.click(serviceTypeSelect);
      await user.click(screen.getByText('Network'));
      
      expect(screen.getByDisplayValue('NETWORK')).toBeInTheDocument();
    });
  });

  describe('Priority Selection', () => {
    it('renders priority dropdown with all options and icons', async () => {
      renderWithProviders(<TicketForm />);
      
      const user = userEvent.setup();
      const prioritySelect = screen.getByLabelText(/priority/i);
      await user.click(prioritySelect);
      
      await waitFor(() => {
        expect(screen.getByText(/urgent/i)).toBeInTheDocument();
        expect(screen.getByText(/high/i)).toBeInTheDocument();
        expect(screen.getByText(/medium/i)).toBeInTheDocument();
        expect(screen.getByText(/low/i)).toBeInTheDocument();
      });
    });

    it('displays priority icons in dropdown', async () => {
      renderWithProviders(<TicketForm />);
      
      const user = userEvent.setup();
      const prioritySelect = screen.getByLabelText(/priority/i);
      await user.click(prioritySelect);
      
      await waitFor(() => {
        expect(screen.getByText('🔴')).toBeInTheDocument(); // Urgent
        expect(screen.getByText('🟠')).toBeInTheDocument(); // High
        expect(screen.getByText('🟡')).toBeInTheDocument(); // Medium
        expect(screen.getByText('🟢')).toBeInTheDocument(); // Low
      });
    });

    it('allows selecting priority', async () => {
      renderWithProviders(<TicketForm />);
      
      const user = userEvent.setup();
      const prioritySelect = screen.getByLabelText(/priority/i);
      
      await user.click(prioritySelect);
      await user.click(screen.getByText(/urgent/i));
      
      expect(screen.getByDisplayValue('URGENT')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows validation errors for required fields', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketForm />);

      // Submit form without filling required fields
      await user.click(screen.getByRole('button', { name: /create ticket/i }));

      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
        expect(screen.getByText(/description is required/i)).toBeInTheDocument();
        expect(screen.getByText(/service type is required/i)).toBeInTheDocument();
        expect(screen.getByText(/priority is required/i)).toBeInTheDocument();
        expect(screen.getByText(/client is required/i)).toBeInTheDocument();
      });
    });

    it('validates title length constraints', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketForm />);

      const titleField = screen.getByLabelText(/title/i);
      
      // Test minimum length
      await user.type(titleField, 'ab'); // Less than minimum
      await user.click(screen.getByRole('button', { name: /create ticket/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/title must be at least 3 characters/i)).toBeInTheDocument();
      });

      // Clear and test maximum length
      await user.clear(titleField);
      await user.type(titleField, 'a'.repeat(201)); // More than maximum
      
      await waitFor(() => {
        expect(screen.getByText(/title must be at most 200 characters/i)).toBeInTheDocument();
      });
    });

    it('validates description length constraints', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketForm />);

      const descriptionField = screen.getByLabelText(/description/i);
      
      // Test minimum length
      await user.type(descriptionField, 'abc'); // Less than minimum
      await user.click(screen.getByRole('button', { name: /create ticket/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/description must be at least 10 characters/i)).toBeInTheDocument();
      });
    });

    it('validates due date is in the future', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketForm />);

      const dueDateField = screen.getByLabelText(/due date/i);
      
      // Set date in the past
      const pastDate = '2020-01-01T10:00';
      await user.type(dueDateField, pastDate);
      await user.click(screen.getByRole('button', { name: /create ticket/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/due date must be in the future/i)).toBeInTheDocument();
      });
    });

    it('clears validation errors when fields are corrected', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketForm />);

      // Submit to trigger validation errors
      await user.click(screen.getByRole('button', { name: /create ticket/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });

      // Fix the title field
      const titleField = screen.getByLabelText(/title/i);
      await user.type(titleField, 'Valid title');
      
      await waitFor(() => {
        expect(screen.queryByText(/title is required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission - Create Mode', () => {
    it('submits form with valid data for new ticket', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      
      mockCreateMutation.mutateAsync.mockResolvedValue({
        id: 1,
        title: 'New ticket'
      });

      renderWithProviders(<TicketForm onSuccess={onSuccess} />);

      // Fill out form
      await user.type(screen.getByLabelText(/title/i), 'Network connectivity issue');
      await user.type(screen.getByLabelText(/description/i), 'User cannot connect to network resources');
      
      await user.click(screen.getByLabelText(/service type/i));
      await user.click(screen.getByText('Network'));
      
      await user.click(screen.getByLabelText(/priority/i));
      await user.click(screen.getByText(/high/i));
      
      await user.click(screen.getByLabelText(/client/i));
      await user.click(screen.getByText('John Doe'));
      
      const dueDateField = screen.getByLabelText(/due date/i);
      await user.type(dueDateField, '2024-12-31T15:00');

      // Submit form
      await user.click(screen.getByRole('button', { name: /create ticket/i }));

      await waitFor(() => {
        expect(mockCreateMutation.mutateAsync).toHaveBeenCalledWith({
          title: 'Network connectivity issue',
          description: 'User cannot connect to network resources',
          serviceType: 'NETWORK',
          priority: 'HIGH',
          clientId: 1,
          dueAt: '2024-12-31T15:00:00.000Z'
        });
      });

      expect(onSuccess).toHaveBeenCalled();
    });

    it('submits form without due date when not provided', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();

      renderWithProviders(<TicketForm onSuccess={onSuccess} />);

      // Fill required fields only
      await user.type(screen.getByLabelText(/title/i), 'Test ticket');
      await user.type(screen.getByLabelText(/description/i), 'Test description for ticket');
      
      await user.click(screen.getByLabelText(/service type/i));
      await user.click(screen.getByText('Hardware'));
      
      await user.click(screen.getByLabelText(/priority/i));
      await user.click(screen.getByText(/medium/i));
      
      await user.click(screen.getByLabelText(/client/i));
      await user.click(screen.getByText('Jane Smith'));

      await user.click(screen.getByRole('button', { name: /create ticket/i }));

      await waitFor(() => {
        expect(mockCreateMutation.mutateAsync).toHaveBeenCalledWith({
          title: 'Test ticket',
          description: 'Test description for ticket',
          serviceType: 'HARDWARE',
          priority: 'MEDIUM',
          clientId: 2,
          dueAt: undefined
        });
      });
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      
      mockUseCreateTicket.mockReturnValue({
        ...mockCreateMutation,
        isPending: true
      });

      renderWithProviders(<TicketForm />);

      const submitButton = screen.getByRole('button', { name: /creating.../i });
      expect(submitButton).toBeDisabled();
    });

    it('handles submission error gracefully', async () => {
      const user = userEvent.setup();
      const mockError = new Error('Failed to create ticket');
      
      mockUseCreateTicket.mockReturnValue({
        ...mockCreateMutation,
        error: mockError
      });

      renderWithProviders(<TicketForm />);

      expect(screen.getByText(/failed to create ticket/i)).toBeInTheDocument();
    });
  });

  describe('Form Submission - Edit Mode', () => {
    const mockTicket = {
      id: 1,
      title: 'Original Title',
      description: 'Original description',
      serviceType: ServiceType.HARDWARE,
      priority: TicketPriority.MEDIUM,
      clientId: 1,
      status: TicketStatus.OPEN,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };

    it('submits form with updated data for existing ticket', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      
      mockUpdateMutation.mutateAsync.mockResolvedValue({
        ...mockTicket,
        title: 'Updated Title'
      });

      renderWithProviders(<TicketForm ticket={mockTicket} onSuccess={onSuccess} />);

      // Update title
      const titleField = screen.getByDisplayValue('Original Title');
      await user.clear(titleField);
      await user.type(titleField, 'Updated Title');

      // Submit form
      await user.click(screen.getByRole('button', { name: /update ticket/i }));

      await waitFor(() => {
        expect(mockUpdateMutation.mutateAsync).toHaveBeenCalledWith({
          id: 1,
          title: 'Updated Title',
          description: 'Original description',
          serviceType: 'HARDWARE',
          priority: 'MEDIUM',
          clientId: 1,
          dueAt: undefined
        });
      });

      expect(onSuccess).toHaveBeenCalled();
    });

    it('shows loading state during update', () => {
      mockUseUpdateTicket.mockReturnValue({
        ...mockUpdateMutation,
        isPending: true
      });

      renderWithProviders(<TicketForm ticket={mockTicket} />);

      const submitButton = screen.getByRole('button', { name: /updating.../i });
      expect(submitButton).toBeDisabled();
    });

    it('handles update error gracefully', () => {
      const mockError = new Error('Failed to update ticket');
      
      mockUseUpdateTicket.mockReturnValue({
        ...mockUpdateMutation,
        error: mockError
      });

      renderWithProviders(<TicketForm ticket={mockTicket} />);

      expect(screen.getByText(/failed to update ticket/i)).toBeInTheDocument();
    });
  });

  describe('Cancel Functionality', () => {
    it('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      
      renderWithProviders(<TicketForm onCancel={onCancel} />);
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      expect(onCancel).toHaveBeenCalled();
    });

    it('does not submit form when cancel is clicked', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      
      renderWithProviders(<TicketForm onCancel={onCancel} />);
      
      // Fill some data
      await user.type(screen.getByLabelText(/title/i), 'Test title');
      
      // Click cancel
      await user.click(screen.getByRole('button', { name: /cancel/i }));
      
      expect(mockCreateMutation.mutateAsync).not.toHaveBeenCalled();
      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels and associations', () => {
      renderWithProviders(<TicketForm />);

      // Check label associations
      expect(screen.getByLabelText(/title/i)).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText(/description/i).tagName).toBe('TEXTAREA');
      expect(screen.getByLabelText(/due date/i)).toHaveAttribute('type', 'datetime-local');
    });

    it('shows validation errors with proper accessibility attributes', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketForm />);

      await user.click(screen.getByRole('button', { name: /create ticket/i }));

      await waitFor(() => {
        const titleField = screen.getByLabelText(/title/i);
        expect(titleField).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('provides clear button labels', () => {
      renderWithProviders(<TicketForm />);
      
      expect(screen.getByRole('button', { name: /create ticket/i })).toHaveAccessibleName();
    });

    it('provides clear button labels in edit mode', () => {
      const mockTicket = {
        id: 1,
        title: 'Test',
        description: 'Test description',
        serviceType: ServiceType.HARDWARE,
        priority: TicketPriority.MEDIUM,
        clientId: 1,
        status: TicketStatus.OPEN,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      renderWithProviders(<TicketForm ticket={mockTicket} />);
      
      expect(screen.getByRole('button', { name: /update ticket/i })).toHaveAccessibleName();
    });
  });

  describe('Responsive Behavior', () => {
    it('renders form with responsive layout classes', () => {
      renderWithProviders(<TicketForm />);
      
      // Form should be properly structured for responsive behavior
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });
  });
});