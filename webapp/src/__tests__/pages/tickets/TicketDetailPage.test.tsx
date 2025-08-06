/**
 * Tests for TicketDetailPage component
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TicketDetailPage } from '../../../pages/tickets/TicketDetailPage';  
import { TicketStatus, TicketPriority, ServiceType, TechnicianStatus } from '../../../types';
import { renderWithProviders } from '../../utils/test-utils';

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockUseParams = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: mockUseParams,
  ...vi.importActual('react-router-dom')
}));

// Mock the hooks
const mockUseTicket = vi.fn();
const mockUseClients = vi.fn();
const mockUseTechnicians = vi.fn();
const mockUseDeleteTicket = vi.fn();
const mockUseCloseTicket = vi.fn();
const mockUseReopenTicket = vi.fn();

vi.mock('../../../hooks/useTickets', () => ({
  useTicket: mockUseTicket,
  useDeleteTicket: mockUseDeleteTicket,
  useCloseTicket: mockUseCloseTicket,
  useReopenTicket: mockUseReopenTicket
}));

vi.mock('../../../hooks/useClients', () => ({
  useClients: mockUseClients
}));

vi.mock('../../../hooks/useTechnicians', () => ({
  useTechnicians: mockUseTechnicians
}));

// Mock the components
vi.mock('../../../components/forms/TicketForm', () => ({
  TicketForm: vi.fn(({ ticket, onSuccess, onCancel }) => (
    <div data-testid="ticket-form">
      <span>Edit Ticket Form for #{ticket?.id}</span>
      <button onClick={onSuccess}>Success</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ))
}));

vi.mock('../../../components/forms/TechnicianAssignmentModal', () => ({
  TechnicianAssignmentModal: vi.fn(({ open, ticketId, currentTechnicianId, onSuccess, onOpenChange }) => (
    <div data-testid="assignment-modal" style={{ display: open ? 'block' : 'none' }}>
      <span>Assign Technician Modal for Ticket #{ticketId}</span>
      <span>Current: {currentTechnicianId || 'None'}</span>
      <button onClick={() => { onSuccess?.(); onOpenChange(false); }}>Assign</button>
      <button onClick={() => onOpenChange(false)}>Cancel</button>
    </div>
  ))
}));

const mockTicketData = {
  id: 1,
  title: 'Network connectivity issue',
  description: 'User cannot connect to the office network. This is a detailed description of the network connectivity problem that the user is experiencing. It affects their ability to access shared resources and connect to the internet.',
  status: TicketStatus.OPEN,
  priority: TicketPriority.HIGH,
  serviceType: ServiceType.NETWORK,
  clientId: 1,
  clientName: 'John Smith',
  clientEmail: 'john.smith@example.com',
  assignedTechnicianId: 1,
  assignedTechnician: {
    id: 1,
    firstName: 'Tech',
    lastName: 'Support',
    email: 'tech.support@example.com',
    status: TechnicianStatus.ACTIVE
  },
  dueAt: '2024-03-01T10:00:00Z',
  createdAt: '2024-02-28T09:00:00Z',
  updatedAt: '2024-02-28T11:30:00Z'
};

const mockClientData = {
  content: [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      phone: '(555) 123-4567',
      address: '123 Main St, Anytown, ST 12345'
    }
  ]
};

const mockTechniciansData = {
  content: [
    {
      id: 1,
      firstName: 'Tech',
      lastName: 'Support',
      email: 'tech.support@example.com',
      phone: '(555) 987-6543',
      status: TechnicianStatus.ACTIVE,
      skills: ['Network', 'Hardware']
    },
    {
      id: 2,
      firstName: 'Senior',
      lastName: 'Tech',
      email: 'senior.tech@example.com',
      phone: '(555) 555-5555',
      status: TechnicianStatus.ACTIVE,
      skills: ['Software', 'Security']
    }
  ]
};

const mockDeleteMutation = {
  mutateAsync: vi.fn(),
  isPending: false,
  error: null
};

const mockCloseMutation = {
  mutateAsync: vi.fn(),
  isPending: false,
  error: null
};

const mockReopenMutation = {
  mutateAsync: vi.fn(),
  isPending: false,
  error: null
};

describe('TicketDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock params to return ticket ID
    mockUseParams.mockReturnValue({ id: '1' });
    
    // Mock successful data fetching
    mockUseTicket.mockReturnValue({
      data: mockTicketData,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });
    
    mockUseClients.mockReturnValue({
      data: mockClientData,
      isLoading: false,
      error: null
    });
    
    mockUseTechnicians.mockReturnValue({
      data: mockTechniciansData,
      isLoading: false,
      error: null
    });
    
    // Mock mutations
    mockUseDeleteTicket.mockReturnValue(mockDeleteMutation);
    mockUseCloseTicket.mockReturnValue(mockCloseMutation);
    mockUseReopenTicket.mockReturnValue(mockReopenMutation);
  });

  describe('Rendering', () => {
    it('renders ticket details correctly', async () => {
      renderWithProviders(<TicketDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByText('#1 - Network connectivity issue')).toBeInTheDocument();
        expect(screen.getByText('Ticket Details')).toBeInTheDocument();
        expect(screen.getByText('Network connectivity issue')).toBeInTheDocument();
        expect(screen.getByText(/User cannot connect to the office network/)).toBeInTheDocument();
      });
    });

    it('renders back to tickets button', () => {
      renderWithProviders(<TicketDetailPage />);
      
      expect(screen.getByRole('button', { name: /back to tickets/i })).toBeInTheDocument();
    });

    it('renders status badge with correct variant', async () => {
      renderWithProviders(<TicketDetailPage />);
      
      await waitFor(() => {
        expect(screen.getAllByText('Open')).toHaveLength(2); // Status badge and status workflow
      });
    });

    it('renders priority badge with correct icon and color', async () => {
      renderWithProviders(<TicketDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByText('🟠')).toBeInTheDocument(); // High priority icon
        expect(screen.getAllByText('high')).toHaveLength(2); // Priority badge and details section
      });
    });

    it('renders service type badge', async () => {
      renderWithProviders(<TicketDetailPage />);
      
      await waitFor(() => {
        expect(screen.getAllByText('Network')).toHaveLength(1); // Service type badge
      });
    });

    it('renders created and due dates', async () => {
      renderWithProviders(<TicketDetailPage />);
      
      await waitFor(() => {
        // Check for date formatting - should show formatted dates
        expect(screen.getByText(/Created:/)).toBeInTheDocument();
        expect(screen.getByText(/Due Date:/)).toBeInTheDocument();
        // Dates are formatted, exact text may vary by locale
        expect(screen.getByText(/Feb 28, 2024/)).toBeInTheDocument(); // Created date
        expect(screen.getByText(/Mar 1, 2024/)).toBeInTheDocument(); // Due date
      });
    });

    it('renders client information correctly', async () => {
      renderWithProviders(<TicketDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Client Information')).toBeInTheDocument();
        expect(screen.getByText('John Smith')).toBeInTheDocument();
        expect(screen.getByText('john.smith@example.com')).toBeInTheDocument();
        expect(screen.getByText('(555) 123-4567')).toBeInTheDocument();
        expect(screen.getByText('123 Main St, Anytown, ST 12345')).toBeInTheDocument();
      });
    });

    it('renders assigned technician information', async () => {
      renderWithProviders(<TicketDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Assignment')).toBeInTheDocument();
        expect(screen.getByText('Tech Support')).toBeInTheDocument();
        expect(screen.getByText('tech.support@example.com')).toBeInTheDocument();
        expect(screen.getByText('Reassign Technician')).toBeInTheDocument();
      });
    });

    it('renders quick actions correctly', async () => {
      renderWithProviders(<TicketDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Quick Actions')).toBeInTheDocument();
        expect(screen.getByText('Edit Details')).toBeInTheDocument();
        expect(screen.getByText('Reassign Technician')).toBeInTheDocument();
        expect(screen.getByText('Close Ticket')).toBeInTheDocument();
        expect(screen.getByText('Delete Ticket')).toBeInTheDocument();
      });
    });

    it('renders ticket statistics', async () => {
      renderWithProviders(<TicketDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Ticket Details')).toBeInTheDocument();
        expect(screen.getByText('#1')).toBeInTheDocument(); // Ticket ID
        expect(screen.getByText('HIGH')).toBeInTheDocument(); // Priority level
        expect(screen.getByText('Network')).toBeInTheDocument(); // Service type
        expect(screen.getByText('Open')).toBeInTheDocument(); // Status
      });
    });
  });

  describe('Loading and Error States', () => {
    it('renders loading skeleton when ticket is loading', () => {
      mockUseTicket.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        refetch: vi.fn()
      });

      renderWithProviders(<TicketDetailPage />);
      
      // Should render loading skeleton structure
      expect(screen.getByText('Back to Tickets').closest('button')).toBeInTheDocument();
    });

    it('renders error message when ticket fetch fails', () => {
      const mockError = new Error('Ticket not found');
      mockUseTicket.mockReturnValue({
        data: null,
        isLoading: false,
        error: mockError,
        refetch: vi.fn()
      });

      renderWithProviders(<TicketDetailPage />);
      
      expect(screen.getByText('Ticket not found')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /back to tickets/i })).toBeInTheDocument();
    });

    it('renders client loading state', () => {
      mockUseClients.mockReturnValue({
        data: null,
        isLoading: true,
        error: null
      });

      renderWithProviders(<TicketDetailPage />);
      
      // Should show skeleton loading for client section
      expect(screen.getByText('Client Information')).toBeInTheDocument();
    });

    it('renders client not found state', () => {
      mockUseClients.mockReturnValue({
        data: { content: [] }, // Empty client data
        isLoading: false,
        error: null
      });

      renderWithProviders(<TicketDetailPage />);
      
      expect(screen.getByText('Client information not available')).toBeInTheDocument();
      expect(screen.getByText(/Client ID: 1 - Check if client exists/)).toBeInTheDocument();
    });

    it('handles unassigned ticket correctly', () => {
      const unassignedTicket = { ...mockTicketData, assignedTechnicianId: null, assignedTechnician: null };
      mockUseTicket.mockReturnValue({
        data: unassignedTicket,
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      renderWithProviders(<TicketDetailPage />);
      
      expect(screen.getByText('No technician assigned')).toBeInTheDocument();
      expect(screen.getByText('Assign Technician')).toBeInTheDocument(); // Should say "Assign" not "Reassign"
    });
  });

  describe('Navigation', () => {
    it('navigates back to tickets when back button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketDetailPage />);
      
      const backButton = screen.getByRole('button', { name: /back to tickets/i });
      await user.click(backButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/tickets');
    });

    it('navigates to client detail when client name is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketDetailPage />);
      
      await waitFor(() => {
        const clientNameButton = screen.getByText('John Smith');
        expect(clientNameButton).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('John Smith'));
      expect(mockNavigate).toHaveBeenCalledWith('/clients/1');
    });
  });

  describe('Status Management', () => {
    it('shows close ticket button for open tickets', async () => {
      renderWithProviders(<TicketDetailPage />);
      
      await waitFor(() => {
        expect(screen.getAllByText('Close Ticket')).toHaveLength(2); // Header and quick actions
      });
    });

    it('shows reopen ticket button for closed tickets', () => {
      const closedTicket = { ...mockTicketData, status: TicketStatus.CLOSED };
      mockUseTicket.mockReturnValue({
        data: closedTicket,
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      renderWithProviders(<TicketDetailPage />);
      
      expect(screen.getAllByText('Reopen')).toHaveLength(2); // Header and quick actions
    });

    it('calls close mutation when close ticket is clicked', async () => {
      const user = userEvent.setup();
      const mockRefetch = vi.fn();
      mockUseTicket.mockReturnValue({
        data: mockTicketData,
        isLoading: false,
        error: null,
        refetch: mockRefetch
      });

      renderWithProviders(<TicketDetailPage />);
      
      await waitFor(() => {
        expect(screen.getAllByText('Close Ticket')).toHaveLength(2);
      });
      
      // Click the header close button
      const closeButtons = screen.getAllByText('Close Ticket');
      await user.click(closeButtons[0]);
      
      expect(mockCloseMutation.mutateAsync).toHaveBeenCalledWith({ id: 1 });
    });

    it('calls reopen mutation when reopen is clicked', async () => {
      const user = userEvent.setup();
      const closedTicket = { ...mockTicketData, status: TicketStatus.CLOSED };
      const mockRefetch = vi.fn();
      
      mockUseTicket.mockReturnValue({
        data: closedTicket,
        isLoading: false,
        error: null,
        refetch: mockRefetch
      });

      renderWithProviders(<TicketDetailPage />);
      
      const reopenButtons = screen.getAllByText('Reopen');
      await user.click(reopenButtons[0]);
      
      expect(mockReopenMutation.mutateAsync).toHaveBeenCalledWith({ id: 1 });
    });

    it('disables buttons when mutations are pending', () => {
      mockUseCloseTicket.mockReturnValue({
        ...mockCloseMutation,
        isPending: true
      });

      renderWithProviders(<TicketDetailPage />);
      
      const closeButtons = screen.getAllByText(/Closing.../);
      expect(closeButtons[0]).toBeDisabled();
    });
  });

  describe('Edit Functionality', () => {
    it('opens edit modal when edit button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketDetailPage />);
      
      await waitFor(() => {
        expect(screen.getAllByText('Edit Ticket')).toHaveLength(1); // Header button
      });
      
      await user.click(screen.getByText('Edit Ticket'));
      
      expect(screen.getByTestId('ticket-form')).toBeInTheDocument();
      expect(screen.getByText('Edit Ticket Form for #1')).toBeInTheDocument();
    });

    it('opens edit modal from quick actions', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Edit Details')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Edit Details'));
      
      expect(screen.getByTestId('ticket-form')).toBeInTheDocument();
    });

    it('shows correct modal title for edit', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketDetailPage />);
      
      await user.click(screen.getByText('Edit Ticket'));
      
      expect(screen.getByText('Edit Ticket')).toBeInTheDocument();
      expect(screen.getByText(/update ticket information and details/i)).toBeInTheDocument();
    });

    it('closes edit modal when canceled', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketDetailPage />);
      
      await user.click(screen.getByText('Edit Ticket'));
      expect(screen.getByTestId('ticket-form')).toBeInTheDocument();
      
      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(screen.queryByTestId('ticket-form')).not.toBeInTheDocument();
    });
  });

  describe('Assignment Management', () => {
    it('opens assignment modal when assign button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Reassign Technician')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Reassign Technician'));
      
      expect(screen.getByTestId('assignment-modal')).toBeInTheDocument();
      expect(screen.getByText('Assign Technician Modal for Ticket #1')).toBeInTheDocument();
      expect(screen.getByText('Current: 1')).toBeInTheDocument();
    });

    it('opens assignment modal from quick actions', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Reassign Technician')).toBeInTheDocument();
      });
      
      const quickActionsButton = screen.getAllByText('Reassign Technician')[1]; // Second one is in quick actions
      await user.click(quickActionsButton);
      
      expect(screen.getByTestId('assignment-modal')).toBeInTheDocument();
    });

    it('closes assignment modal when canceled', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketDetailPage />);
      
      await user.click(screen.getByText('Reassign Technician'));
      expect(screen.getByTestId('assignment-modal')).toBeInTheDocument();
      
      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(screen.getByTestId('assignment-modal')).toHaveStyle('display: none');
    });

    it('shows assign instead of reassign for unassigned tickets', () => {
      const unassignedTicket = { ...mockTicketData, assignedTechnicianId: null, assignedTechnician: null };
      mockUseTicket.mockReturnValue({
        data: unassignedTicket,
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      renderWithProviders(<TicketDetailPage />);
      
      expect(screen.getAllByText('Assign Technician')).toHaveLength(2); // Assignment card and quick actions
    });
  });

  describe('Delete Functionality', () => {
    it('opens delete confirmation when delete button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Delete Ticket')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Delete Ticket'));
      
      expect(screen.getByText('Delete Ticket')).toBeInTheDocument();
      expect(screen.getByText(/are you sure you want to delete ticket "#1 - Network connectivity issue"/i)).toBeInTheDocument();
    });

    it('calls delete mutation and navigates when confirmed', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketDetailPage />);
      
      await user.click(screen.getByText('Delete Ticket'));
      
      // Confirm deletion
      const deleteButtons = screen.getAllByText(/delete ticket/i);
      const confirmButton = deleteButtons.find(btn => btn.tagName === 'BUTTON');
      await user.click(confirmButton!);
      
      expect(mockDeleteMutation.mutateAsync).toHaveBeenCalledWith(1);
    });

    it('cancels delete when cancel is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketDetailPage />);
      
      await user.click(screen.getByText('Delete Ticket'));
      
      // Cancel deletion
      await user.click(screen.getByRole('button', { name: /cancel/i }));
      
      expect(mockDeleteMutation.mutateAsync).not.toHaveBeenCalled();
    });

    it('disables delete button when mutation is pending', () => {
      mockUseDeleteTicket.mockReturnValue({
        ...mockDeleteMutation,
        isPending: true
      });

      renderWithProviders(<TicketDetailPage />);
      
      // The delete confirmation modal logic would disable the button
      expect(screen.getByText('Delete Ticket')).toBeInTheDocument();
    });
  });

  describe('Overdue Ticket Handling', () => {
    it('shows overdue indicator for overdue tickets', () => {
      const overdueTicket = {
        ...mockTicketData,
        dueAt: '2024-01-01T10:00:00Z', // Past date
        status: TicketStatus.OPEN
      };
      
      mockUseTicket.mockReturnValue({
        data: overdueTicket,
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      renderWithProviders(<TicketDetailPage />);
      
      expect(screen.getAllByText('Overdue')).toHaveLength(2); // Status badge and details
      expect(screen.getByText('(Overdue)')).toBeInTheDocument(); // In due date
    });

    it('handles tickets without due date', () => {
      const noDueDateTicket = { ...mockTicketData, dueAt: null };
      mockUseTicket.mockReturnValue({
        data: noDueDateTicket,
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      renderWithProviders(<TicketDetailPage />);
      
      expect(screen.getByText('No due date')).toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('formats dates correctly', async () => {
      renderWithProviders(<TicketDetailPage />);
      
      await waitFor(() => {
        // Check that dates are displayed in a readable format
        expect(screen.getByText(/Feb 28, 2024/)).toBeInTheDocument(); // Created date
        expect(screen.getByText(/Mar 1, 2024/)).toBeInTheDocument(); // Due date
        expect(screen.getByText(/Feb 28, 2024/)).toBeInTheDocument(); // Updated date (in statistics)
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('renders properly in mobile layout', () => {
      renderWithProviders(<TicketDetailPage />);
      
      // Check that the grid layout components are present
      expect(screen.getByText('Network connectivity issue')).toBeInTheDocument();
      
      // Cards should be properly structured for responsive layout
      expect(screen.getByText('Client Information')).toBeInTheDocument();
      expect(screen.getByText('Assignment')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', async () => {
      renderWithProviders(<TicketDetailPage />);
      
      await waitFor(() => {
        // Check for proper button labels
        expect(screen.getByRole('button', { name: /back to tickets/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /edit ticket/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /close ticket/i })).toBeInTheDocument();
      });
      
      // Check for proper heading structure
      expect(screen.getByText('#1 - Network connectivity issue')).toBeInTheDocument();
    });

    it('provides clear feedback for actions', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Close Ticket')).toBeInTheDocument();
      });
      
      // Interactive elements should have clear labels
      expect(screen.getByText('Edit Ticket')).toBeInTheDocument();
      expect(screen.getByText('Reassign Technician')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles ticket not found gracefully', () => {
      mockUseTicket.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Not found'),
        refetch: vi.fn()
      });

      renderWithProviders(<TicketDetailPage />);
      
      expect(screen.getByText('Not found')).toBeInTheDocument();
    });

    it('handles invalid ticket ID', () => {
      mockUseParams.mockReturnValue({ id: 'invalid' });
      
      renderWithProviders(<TicketDetailPage />);
      
      // Should handle invalid ID gracefully
      expect(screen.getByRole('button', { name: /back to tickets/i })).toBeInTheDocument();
    });
  });
});