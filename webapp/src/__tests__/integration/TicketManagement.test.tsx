/**
 * Integration Tests for Complete Ticket Management Workflow
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TicketsPage } from '../../pages/tickets/TicketsPage';
import { TicketDetailPage } from '../../pages/tickets/TicketDetailPage';
import { TicketStatus, TicketPriority, ServiceType, TechnicianStatus } from '../../types';
import { renderWithProviders } from '../utils/test-utils';

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockUseParams = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: mockUseParams,
  };
});

// Mock all the hooks
const mockUseTickets = vi.fn();
const mockUseTicket = vi.fn();
const mockUseCreateTicket = vi.fn();
const mockUseUpdateTicket = vi.fn();
const mockUseDeleteTicket = vi.fn();
const mockUseAssignTicket = vi.fn();
const mockUseCloseTicket = vi.fn();
const mockUseReopenTicket = vi.fn();
const mockUseClients = vi.fn();
const mockUseTechnicians = vi.fn();

vi.mock('../../hooks/useTickets', () => ({
  useTickets: mockUseTickets,
  useTicket: mockUseTicket,
  useCreateTicket: mockUseCreateTicket,
  useUpdateTicket: mockUseUpdateTicket,
  useDeleteTicket: mockUseDeleteTicket,
  useAssignTicket: mockUseAssignTicket,
  useCloseTicket: mockUseCloseTicket,
  useReopenTicket: mockUseReopenTicket,
}));

vi.mock('../../hooks/useClients', () => ({
  useClients: mockUseClients,
}));

vi.mock('../../hooks/useTechnicians', () => ({
  useTechnicians: mockUseTechnicians,
}));

// Mock the form components with real implementation-like behavior
vi.mock('../../components/forms/TicketForm', () => ({
  TicketForm: vi.fn(({ ticket, onSuccess, onCancel }) => {
    const [formData, setFormData] = React.useState({
      title: ticket?.title || '',
      description: ticket?.description || '',
      serviceType: ticket?.serviceType || '',
      priority: ticket?.priority || '',
      clientId: ticket?.clientId || '',
      dueAt: ticket?.dueAt || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Simulate validation
      if (!formData.title || !formData.description || !formData.serviceType || !formData.priority || !formData.clientId) {
        return;
      }

      // Simulate successful submission
      setTimeout(() => {
        onSuccess?.();
      }, 100);
    };

    return (
      <div data-testid="ticket-form">
        <form onSubmit={handleSubmit}>
          <input
            data-testid="title-input"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Title"
          />
          <textarea
            data-testid="description-input"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Description"
          />
          <select
            data-testid="service-type-select"
            value={formData.serviceType}
            onChange={(e) => setFormData(prev => ({ ...prev, serviceType: e.target.value }))}
          >
            <option value="">Select Service Type</option>
            <option value="HARDWARE">Hardware</option>
            <option value="SOFTWARE">Software</option>
            <option value="NETWORK">Network</option>
          </select>
          <select
            data-testid="priority-select"
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
          >
            <option value="">Select Priority</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <select
            data-testid="client-select"
            value={formData.clientId}
            onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
          >
            <option value="">Select Client</option>
            <option value="1">John Doe</option>
            <option value="2">Jane Smith</option>
          </select>
          <button type="submit" data-testid="submit-button">
            {ticket ? 'Update Ticket' : 'Create Ticket'}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} data-testid="cancel-button">
              Cancel
            </button>
          )}
        </form>
      </div>
    );
  })
}));

vi.mock('../../components/forms/TechnicianAssignmentModal', () => ({
  TechnicianAssignmentModal: vi.fn(({ open, ticketId, currentTechnicianId, onSuccess, onOpenChange }) => {
    if (!open) return null;

    const handleAssign = (technicianId: number) => {
      setTimeout(() => {
        onSuccess?.();
        onOpenChange(false);
      }, 100);
    };

    return (
      <div data-testid="assignment-modal">
        <h3>Assign Technician</h3>
        <button 
          data-testid="assign-tech-1"
          onClick={() => handleAssign(1)}
        >
          Assign Tech Support (ID: 1)
        </button>
        <button 
          data-testid="assign-tech-2"
          onClick={() => handleAssign(2)}
        >
          Assign Senior Tech (ID: 2)
        </button>
        <button 
          data-testid="close-assignment-modal"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </button>
      </div>
    );
  })
}));

// Test data
const mockTicketsData = {
  content: [
    {
      id: 1,
      title: 'Network Issue',
      description: 'Network connectivity problems',
      status: TicketStatus.OPEN,
      priority: TicketPriority.HIGH,
      serviceType: ServiceType.NETWORK,
      clientId: 1,
      clientName: 'John Doe',
      clientEmail: 'john.doe@example.com',
      assignedTechnicianId: null,
      assignedTechnician: null,
      dueAt: '2024-03-01T10:00:00Z',
      createdAt: '2024-02-28T09:00:00Z',
      updatedAt: '2024-02-28T09:00:00Z'
    },
    {
      id: 2,
      title: 'Software Installation',
      description: 'Need software installed',
      status: TicketStatus.OPEN,
      priority: TicketPriority.MEDIUM,
      serviceType: ServiceType.SOFTWARE,
      clientId: 2,
      clientName: 'Jane Smith',
      clientEmail: 'jane.smith@example.com',
      assignedTechnicianId: 1,
      assignedTechnician: {
        id: 1,
        firstName: 'Tech',
        lastName: 'Support',
        email: 'tech.support@example.com',
        status: TechnicianStatus.ACTIVE
      },
      dueAt: null,
      createdAt: '2024-02-27T14:30:00Z',
      updatedAt: '2024-02-28T08:15:00Z'
    }
  ],
  totalElements: 2,
  totalPages: 1,
  size: 20,
  number: 0
};

const mockClientsData = {
  content: [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '(555) 123-4567',
      address: '123 Main St'
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '(555) 987-6543',
      address: '456 Oak Ave'
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
      phone: '(555) 111-2222',
      status: TechnicianStatus.ACTIVE,
      skills: ['Network', 'Hardware']
    },
    {
      id: 2,
      firstName: 'Senior',
      lastName: 'Tech',
      email: 'senior.tech@example.com',
      phone: '(555) 333-4444',
      status: TechnicianStatus.ACTIVE,
      skills: ['Software', 'Security']
    }
  ]
};

// Default mutations
const createMockMutations = () => ({
  create: { mutateAsync: vi.fn(), isPending: false, error: null },
  update: { mutateAsync: vi.fn(), isPending: false, error: null },
  delete: { mutateAsync: vi.fn(), isPending: false, error: null },
  assign: { mutateAsync: vi.fn(), isPending: false, error: null },
  close: { mutateAsync: vi.fn(), isPending: false, error: null },
  reopen: { mutateAsync: vi.fn(), isPending: false, error: null }
});

describe('Ticket Management Integration Tests', () => {
  let mutations: ReturnType<typeof createMockMutations>;

  beforeEach(() => {
    vi.clearAllMocks();
    mutations = createMockMutations();

    // Setup default mocks
    mockUseTickets.mockReturnValue({
      data: mockTicketsData,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });

    mockUseClients.mockReturnValue({
      data: mockClientsData,
      isLoading: false,
      error: null
    });

    mockUseTechnicians.mockReturnValue({
      data: mockTechniciansData,
      isLoading: false,
      error: null
    });

    mockUseCreateTicket.mockReturnValue(mutations.create);
    mockUseUpdateTicket.mockReturnValue(mutations.update);
    mockUseDeleteTicket.mockReturnValue(mutations.delete);
    mockUseAssignTicket.mockReturnValue(mutations.assign);
    mockUseCloseTicket.mockReturnValue(mutations.close);
    mockUseReopenTicket.mockReturnValue(mutations.reopen);
  });

  describe('Complete CRUD Workflow', () => {
    it('allows users to create, view, edit, and delete tickets', async () => {
      const user = userEvent.setup();

      // Mock successful creation
      mutations.create.mutateAsync.mockResolvedValue({
        id: 3,
        title: 'New Test Ticket',
        description: 'This is a test ticket created through integration test'
      });

      renderWithProviders(<TicketsPage />);

      // 1. CREATE: Open create modal and create a new ticket
      await waitFor(() => {
        expect(screen.getByText('Network Issue')).toBeInTheDocument();
      });

      const newTicketButton = screen.getByRole('button', { name: /new ticket/i });
      await user.click(newTicketButton);

      // Fill out the form
      expect(screen.getByTestId('ticket-form')).toBeInTheDocument();
      
      await user.type(screen.getByTestId('title-input'), 'New Test Ticket');
      await user.type(screen.getByTestId('description-input'), 'This is a test ticket created through integration test');
      await user.selectOptions(screen.getByTestId('service-type-select'), 'HARDWARE');
      await user.selectOptions(screen.getByTestId('priority-select'), 'URGENT');
      await user.selectOptions(screen.getByTestId('client-select'), '1');

      // Submit the form
      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(mutations.create.mutateAsync).toHaveBeenCalledWith({
          title: 'New Test Ticket',
          description: 'This is a test ticket created through integration test',
          serviceType: 'HARDWARE',
          priority: 'URGENT',
          clientId: 1,
          dueAt: ''
        });
      });

      // 2. VIEW: Navigate to ticket detail page
      await waitFor(() => {
        // Mock the new ticket being added to the list
        const updatedTicketsData = {
          ...mockTicketsData,
          content: [...mockTicketsData.content, {
            id: 3,
            title: 'New Test Ticket',
            description: 'This is a test ticket created through integration test',
            status: TicketStatus.OPEN,
            priority: TicketPriority.URGENT,
            serviceType: ServiceType.HARDWARE,
            clientId: 1,
            clientName: 'John Doe',
            clientEmail: 'john.doe@example.com',
            assignedTechnicianId: null,
            assignedTechnician: null,
            dueAt: null,
            createdAt: '2024-02-28T12:00:00Z',
            updatedAt: '2024-02-28T12:00:00Z'
          }],
          totalElements: 3
        };
        
        mockUseTickets.mockReturnValue({
          data: updatedTicketsData,
          isLoading: false,
          error: null,
          refetch: vi.fn()
        });
      });

      // Click on a ticket to view details
      const firstTicket = screen.getAllByRole('button', { name: '' })[0]; // Actions dropdown
      await user.click(firstTicket);
      await user.click(screen.getByText(/view details/i));

      expect(mockNavigate).toHaveBeenCalledWith('/tickets/1');

      // 3. EDIT: Test edit functionality
      // Set up for detail page
      mockUseParams.mockReturnValue({ id: '1' });
      mockUseTicket.mockReturnValue({
        data: mockTicketsData.content[0],
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      // Mock successful update
      mutations.update.mutateAsync.mockResolvedValue({
        ...mockTicketsData.content[0],
        title: 'Updated Network Issue'
      });

      // Render detail page and edit
      renderWithProviders(<TicketDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('#1 - Network Issue')).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit ticket/i });
      await user.click(editButton);

      // Edit the ticket
      const titleInput = screen.getByTestId('title-input');
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Network Issue');

      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(mutations.update.mutateAsync).toHaveBeenCalledWith({
          id: 1,
          title: 'Updated Network Issue',
          description: 'Network connectivity problems',
          serviceType: 'NETWORK',
          priority: 'HIGH',
          clientId: 1,
          dueAt: '2024-03-01T10:00:00Z'
        });
      });

      // 4. DELETE: Test delete functionality
      mutations.delete.mutateAsync.mockResolvedValue(undefined);

      const deleteButton = screen.getByText('Delete Ticket');
      await user.click(deleteButton);

      // Confirm deletion
      const confirmDeleteButton = screen.getByRole('button', { name: /delete ticket/i });
      await user.click(confirmDeleteButton);

      await waitFor(() => {
        expect(mutations.delete.mutateAsync).toHaveBeenCalledWith(1);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/tickets');
    });
  });

  describe('Assignment Workflow', () => {
    it('allows assigning and reassigning technicians to tickets', async () => {
      const user = userEvent.setup();
      
      // Set up detail page for an unassigned ticket
      mockUseParams.mockReturnValue({ id: '1' });
      mockUseTicket.mockReturnValue({
        data: mockTicketsData.content[0], // Unassigned ticket
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      mutations.assign.mutateAsync.mockResolvedValue({
        ...mockTicketsData.content[0],
        assignedTechnicianId: 1,
        assignedTechnician: mockTechniciansData.content[0]
      });

      renderWithProviders(<TicketDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('No technician assigned')).toBeInTheDocument();
      });

      // Open assignment modal
      const assignButton = screen.getByText('Assign Technician');
      await user.click(assignButton);

      expect(screen.getByTestId('assignment-modal')).toBeInTheDocument();

      // Assign first technician
      await user.click(screen.getByTestId('assign-tech-1'));

      await waitFor(() => {
        expect(mutations.assign.mutateAsync).toHaveBeenCalledWith({
          id: 1,
          assignment: { technicianId: 1 }
        });
      });

      // Now test reassignment
      const reassignedTicket = {
        ...mockTicketsData.content[0],
        assignedTechnicianId: 1,
        assignedTechnician: mockTechniciansData.content[0]
      };

      mockUseTicket.mockReturnValue({
        data: reassignedTicket,
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      // Re-render with assigned technician
      renderWithProviders(<TicketDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Tech Support')).toBeInTheDocument();
        expect(screen.getByText('Reassign Technician')).toBeInTheDocument();
      });

      // Reassign to different technician
      const reassignButton = screen.getByText('Reassign Technician');
      await user.click(reassignButton);

      await user.click(screen.getByTestId('assign-tech-2'));

      await waitFor(() => {
        expect(mutations.assign.mutateAsync).toHaveBeenCalledWith({
          id: 1,
          assignment: { technicianId: 2 }
        });
      });
    });
  });

  describe('Status Workflow', () => {
    it('allows opening, closing, and reopening tickets', async () => {
      const user = userEvent.setup();
      
      // Set up detail page for an open ticket
      mockUseParams.mockReturnValue({ id: '1' });
      mockUseTicket.mockReturnValue({
        data: mockTicketsData.content[0], // Open ticket
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      mutations.close.mutateAsync.mockResolvedValue({
        ...mockTicketsData.content[0],
        status: TicketStatus.CLOSED
      });

      renderWithProviders(<TicketDetailPage />);

      await waitFor(() => {
        expect(screen.getAllByText('Close Ticket')).toHaveLength(2); // Header and quick actions
      });

      // Close the ticket
      const closeButtons = screen.getAllByText('Close Ticket');
      await user.click(closeButtons[0]); // Click header button

      await waitFor(() => {
        expect(mutations.close.mutateAsync).toHaveBeenCalledWith({ id: 1 });
      });

      // Now test reopening
      const closedTicket = {
        ...mockTicketsData.content[0],
        status: TicketStatus.CLOSED
      };

      mockUseTicket.mockReturnValue({
        data: closedTicket,
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      mutations.reopen.mutateAsync.mockResolvedValue({
        ...closedTicket,
        status: TicketStatus.OPEN
      });

      // Re-render with closed ticket
      renderWithProviders(<TicketDetailPage />);

      await waitFor(() => {
        expect(screen.getAllByText('Reopen')).toHaveLength(2);
      });

      // Reopen the ticket
      const reopenButtons = screen.getAllByText('Reopen');
      await user.click(reopenButtons[0]);

      await waitFor(() => {
        expect(mutations.reopen.mutateAsync).toHaveBeenCalledWith({ id: 1 });
      });
    });
  });

  describe('Search and Filter Integration', () => {
    it('allows searching and filtering tickets with real-time updates', async () => {
      const user = userEvent.setup();

      renderWithProviders(<TicketsPage />);

      await waitFor(() => {
        expect(screen.getByText('Network Issue')).toBeInTheDocument();
        expect(screen.getByText('Software Installation')).toBeInTheDocument();
      });

      // Test search functionality
      const searchInput = screen.getByPlaceholderText(/search tickets by title, description, or client/i);
      await user.type(searchInput, 'Network');

      await waitFor(() => {
        expect(screen.getByText('Network Issue')).toBeInTheDocument();
        expect(screen.queryByText('Software Installation')).not.toBeInTheDocument();
      });

      // Clear search and test filtering
      await user.clear(searchInput);

      await waitFor(() => {
        expect(screen.getByText('Software Installation')).toBeInTheDocument();
      });

      // Test status filtering
      await user.click(screen.getByText('All Status'));
      await user.click(screen.getByText('Open'));

      await waitFor(() => {
        // Both tickets are open, so both should be visible
        expect(screen.getByText('Network Issue')).toBeInTheDocument();
        expect(screen.getByText('Software Installation')).toBeInTheDocument();
      });

      // Test priority filtering
      await user.click(screen.getByText('All Priority'));
      await user.click(screen.getByText('🟠 High'));

      await waitFor(() => {
        expect(screen.getByText('Network Issue')).toBeInTheDocument();
        expect(screen.queryByText('Software Installation')).not.toBeInTheDocument();
      });

      // Test combined filters
      await user.type(searchInput, 'Network');

      await waitFor(() => {
        expect(screen.getByText('Network Issue')).toBeInTheDocument();
        expect(screen.getByText('Showing 1 of 2 tickets matching "Network"')).toBeInTheDocument();
      });

      // Clear all filters
      await user.click(screen.getByRole('button', { name: /clear filters/i }));

      await waitFor(() => {
        expect(searchInput).toHaveValue('');
        expect(screen.getByText('Network Issue')).toBeInTheDocument();
        expect(screen.getByText('Software Installation')).toBeInTheDocument();
      });
    });
  });

  describe('Bulk Operations Integration', () => {
    it('allows selecting multiple tickets and performing bulk actions', async () => {
      const user = userEvent.setup();

      renderWithProviders(<TicketsPage />);

      await waitFor(() => {
        expect(screen.getByText('Network Issue')).toBeInTheDocument();
      });

      // Select multiple tickets
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3); // 1 select all + 2 individual

      // Select first ticket
      await user.click(checkboxes[1]);
      expect(screen.getByRole('button', { name: /export \(1\)/i })).toBeInTheDocument();

      // Select second ticket
      await user.click(checkboxes[2]);
      expect(screen.getByRole('button', { name: /export \(2\)/i })).toBeInTheDocument();

      // Test select all
      await user.click(checkboxes[0]); // Select all checkbox
      expect(screen.getByRole('button', { name: /export \(2\)/i })).toBeInTheDocument();

      // Test bulk actions menu
      await user.click(screen.getByRole('button', { name: /bulk actions/i }));

      expect(screen.getByText('Close Selected')).toBeInTheDocument();
      expect(screen.getByText('Assign Technician')).toBeInTheDocument();
      expect(screen.getByText('Change Priority')).toBeInTheDocument();
      expect(screen.getByText('Delete Selected')).toBeInTheDocument();
    });
  });

  describe('Error Handling Integration', () => {
    it('gracefully handles API errors across the workflow', async () => {
      const user = userEvent.setup();

      // Test creation error
      mutations.create.mutateAsync.mockRejectedValue(new Error('Server error'));

      renderWithProviders(<TicketsPage />);

      await user.click(screen.getByRole('button', { name: /new ticket/i }));

      // Fill out form
      await user.type(screen.getByTestId('title-input'), 'Test Ticket');
      await user.type(screen.getByTestId('description-input'), 'Test description');
      await user.selectOptions(screen.getByTestId('service-type-select'), 'HARDWARE');
      await user.selectOptions(screen.getByTestId('priority-select'), 'HIGH');
      await user.selectOptions(screen.getByTestId('client-select'), '1');

      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(mutations.create.mutateAsync).toHaveBeenCalled();
      });

      // Test loading states
      mutations.create.isPending = true;
      mockUseCreateTicket.mockReturnValue({
        ...mutations.create,
        isPending: true
      });

      renderWithProviders(<TicketsPage />);

      await user.click(screen.getByRole('button', { name: /new ticket/i }));
      
      // Form should show loading state
      expect(screen.getByTestId('ticket-form')).toBeInTheDocument();

      // Test network error handling
      const networkError = new Error('Network error');
      mockUseTickets.mockReturnValue({
        data: null,
        isLoading: false,
        error: networkError,
        refetch: vi.fn()
      });

      renderWithProviders(<TicketsPage />);

      expect(screen.getByText(/failed to load tickets/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  describe('Real-time Updates Simulation', () => {
    it('simulates real-time updates across components', async () => {
      const user = userEvent.setup();
      const mockRefetch = vi.fn();

      mockUseTickets.mockReturnValue({
        data: mockTicketsData,
        isLoading: false,
        error: null,
        refetch: mockRefetch
      });

      renderWithProviders(<TicketsPage />);

      await waitFor(() => {
        expect(screen.getByText('Network Issue')).toBeInTheDocument();
      });

      // Simulate creating a new ticket
      mutations.create.mutateAsync.mockResolvedValue({
        id: 3,
        title: 'Real-time Test Ticket',
        description: 'This simulates a real-time update'
      });

      await user.click(screen.getByRole('button', { name: /new ticket/i }));

      // Fill and submit form
      await user.type(screen.getByTestId('title-input'), 'Real-time Test Ticket');
      await user.type(screen.getByTestId('description-input'), 'This simulates a real-time update');
      await user.selectOptions(screen.getByTestId('service-type-select'), 'SOFTWARE');
      await user.selectOptions(screen.getByTestId('priority-select'), 'MEDIUM');
      await user.selectOptions(screen.getByTestId('client-select'), '2');

      await user.click(screen.getByTestId('submit-button'));

      // Verify refetch was called to update the list
      await waitFor(() => {
        expect(mutations.create.mutateAsync).toHaveBeenCalled();
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
  });

  describe('Navigation Integration', () => {
    it('provides seamless navigation between tickets list and detail pages', async () => {
      const user = userEvent.setup();

      renderWithProviders(<TicketsPage />);

      await waitFor(() => {
        expect(screen.getByText('Network Issue')).toBeInTheDocument();
      });

      // Navigate to detail page
      const actionButtons = screen.getAllByRole('button', { name: '' });
      await user.click(actionButtons[0]); // First ticket's actions dropdown

      await user.click(screen.getByText(/view details/i));

      expect(mockNavigate).toHaveBeenCalledWith('/tickets/1');

      // Test back navigation from detail page
      mockUseParams.mockReturnValue({ id: '1' });
      mockUseTicket.mockReturnValue({
        data: mockTicketsData.content[0],
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      renderWithProviders(<TicketDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('#1 - Network Issue')).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /back to tickets/i });
      await user.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/tickets');

      // Test client navigation
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      await user.click(screen.getByText('John Doe'));

      expect(mockNavigate).toHaveBeenCalledWith('/clients/1');
    });
  });

  describe('Data Consistency Integration', () => {
    it('maintains data consistency across component updates', async () => {
      const user = userEvent.setup();
      const mockRefetch = vi.fn();

      // Create mutable data reference
      let currentTicketsData = { ...mockTicketsData };

      mockUseTickets.mockImplementation(() => ({
        data: currentTicketsData,
        isLoading: false,
        error: null,
        refetch: mockRefetch
      }));

      renderWithProviders(<TicketsPage />);

      // Verify initial statistics
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument(); // Total count
        expect(screen.getByText('2')).toBeInTheDocument(); // Open count
      });

      // Simulate closing a ticket
      mutations.close.mutateAsync.mockImplementation(() => {
        // Update the mock data
        currentTicketsData = {
          ...currentTicketsData,
          content: currentTicketsData.content.map(ticket => 
            ticket.id === 1 ? { ...ticket, status: TicketStatus.CLOSED } : ticket
          )
        };
        return Promise.resolve(currentTicketsData.content[0]);
      });

      // Navigate to detail page and close ticket
      mockUseParams.mockReturnValue({ id: '1' });
      mockUseTicket.mockReturnValue({
        data: currentTicketsData.content[0],
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      renderWithProviders(<TicketDetailPage />);

      await waitFor(() => {
        expect(screen.getAllByText('Close Ticket')).toHaveLength(2);
      });

      const closeButton = screen.getAllByText('Close Ticket')[0];
      await user.click(closeButton);

      await waitFor(() => {
        expect(mutations.close.mutateAsync).toHaveBeenCalledWith({ id: 1 });
      });

      // Verify statistics would update (simulate refetch)
      renderWithProviders(<TicketsPage />);

      // Statistics should reflect the closed ticket
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument(); // Total still 2
        expect(screen.getByText('1')).toBeInTheDocument(); // Open count should be 1
        expect(screen.getByText('1')).toBeInTheDocument(); // Closed count should be 1
      });
    });
  });
});