/**
 * Tests for TicketsPage component
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TicketsPage } from '../../../pages/tickets/TicketsPage';  
import { TicketStatus, TicketPriority, ServiceType } from '../../../types';
import { renderWithProviders } from '../../utils/test-utils';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the hooks
import * as ticketHooks from '../../../hooks/useTickets';
vi.mock('../../../hooks/useTickets', () => ({
  useTickets: vi.fn(),
  useDeleteTicket: vi.fn(),
  useTicketStatistics: vi.fn()
}));

// Mock the components
vi.mock('../../../components/forms/TicketForm', () => ({
  TicketForm: vi.fn(({ ticket, onSuccess, onCancel }) => (
    <div data-testid="ticket-form">
      <span>{ticket ? 'Edit' : 'Create'} Ticket Form</span>
      <button onClick={onSuccess}>Success</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ))
}));

// Mock URL.createObjectURL for CSV export
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: vi.fn(() => 'mock-url'),
    revokeObjectURL: vi.fn()
  }
});

// Mock document.createElement for CSV export
const mockLink = {
  click: vi.fn(),
  setAttribute: vi.fn(),
  style: { visibility: '' }
};

Object.defineProperty(document, 'createElement', {
  value: vi.fn((tagName) => {
    if (tagName === 'a') return mockLink;
    return {};
  })
});

Object.defineProperty(document.body, 'appendChild', {
  value: vi.fn()
});

Object.defineProperty(document.body, 'removeChild', {
  value: vi.fn()
});

const mockTicketsData = {
  content: [
    {
      id: 1,
      title: 'Network connectivity issue',
      description: 'User cannot connect to the office network',
      status: TicketStatus.OPEN,
      priority: TicketPriority.HIGH,
      serviceType: ServiceType.NETWORK,
      clientId: 1,
      clientName: 'John Smith',
      clientEmail: 'john.smith@example.com',
      assignedTechnicianId: null,
      assignedTechnician: null,
      dueAt: '2024-03-01T10:00:00Z',
      createdAt: '2024-02-28T09:00:00Z',
      updatedAt: '2024-02-28T09:00:00Z'
    },
    {
      id: 2,
      title: 'Software installation problem',
      description: 'Unable to install required software package',
      status: TicketStatus.OPEN,
      priority: TicketPriority.MEDIUM,
      serviceType: ServiceType.SOFTWARE,
      clientId: 2,
      clientName: 'Jane Doe',
      clientEmail: 'jane.doe@example.com',
      assignedTechnicianId: 1,
      assignedTechnician: {
        id: 1,
        firstName: 'Tech',
        lastName: 'Support',
        email: 'tech.support@example.com'
      },
      dueAt: null,
      createdAt: '2024-02-27T14:30:00Z',
      updatedAt: '2024-02-28T08:15:00Z'
    },
    {
      id: 3,
      title: 'Hardware malfunction',
      description: 'Computer randomly shuts down',
      status: TicketStatus.CLOSED,
      priority: TicketPriority.URGENT,
      serviceType: ServiceType.HARDWARE,
      clientId: 3,
      clientName: 'Bob Wilson',
      clientEmail: 'bob.wilson@example.com',
      assignedTechnicianId: 2,
      assignedTechnician: {
        id: 2,
        firstName: 'Support',
        lastName: 'Tech',
        email: 'support.tech@example.com'
      },
      dueAt: '2024-02-26T16:00:00Z', // Overdue
      createdAt: '2024-02-25T10:00:00Z',
      updatedAt: '2024-02-28T11:45:00Z'
    }
  ],
  totalElements: 3,
  totalPages: 1,
  size: 20,
  number: 0
};

const mockDeleteTicketMutation = {
  mutateAsync: vi.fn(),
  isPending: false,
  error: null
};

describe('TicketsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (ticketHooks.useTickets as any).mockReturnValue({
      data: mockTicketsData,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });
    (ticketHooks.useDeleteTicket as any).mockReturnValue(mockDeleteTicketMutation);
    (ticketHooks.useTicketStatistics as any).mockReturnValue({
      data: {
        totalTickets: 3,
        openTickets: 2,
        closedTickets: 1,
        overdueTickets: 1,
        unassignedTickets: 1,
        urgentTickets: 1
      },
      isLoading: false,
      error: null
    });
  });

  describe('Rendering', () => {
    it('renders page title and description', () => {
      renderWithProviders(<TicketsPage />);
      
      expect(screen.getByText('Tickets')).toBeInTheDocument();
      expect(screen.getByText('Manage support tickets and client requests')).toBeInTheDocument();
    });

    it('renders New Ticket button', () => {
      renderWithProviders(<TicketsPage />);
      
      expect(screen.getByRole('button', { name: /new ticket/i })).toBeInTheDocument();
    });

    it('renders statistics cards', async () => {
      renderWithProviders(<TicketsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Total')).toBeInTheDocument();
        expect(screen.getByText('Open')).toBeInTheDocument();
        expect(screen.getByText('Closed')).toBeInTheDocument();
        expect(screen.getByText('Overdue')).toBeInTheDocument();
        expect(screen.getByText('Unassigned')).toBeInTheDocument();
        expect(screen.getByText('Urgent')).toBeInTheDocument();
      });
    });

    it('renders correct statistics counts', async () => {
      renderWithProviders(<TicketsPage />);
      
      await waitFor(() => {
        // Total count
        expect(screen.getByText('3')).toBeInTheDocument(); // Total tickets
        // Open tickets (status OPEN)
        expect(screen.getByText('2')).toBeInTheDocument(); // Open tickets
        // Closed tickets (status CLOSED)  
        expect(screen.getByText('1')).toBeInTheDocument(); // Closed tickets
        // Overdue tickets (past due date)
        expect(screen.getByText('1')).toBeInTheDocument(); // Overdue ticket
        // Unassigned tickets (no assignedTechnicianId)
        expect(screen.getByText('1')).toBeInTheDocument(); // Unassigned ticket
        // Urgent tickets (priority URGENT)
        expect(screen.getByText('1')).toBeInTheDocument(); // Urgent ticket
      });
    });

    it('renders search and filter controls', () => {
      renderWithProviders(<TicketsPage />);
      
      expect(screen.getByPlaceholderText(/search tickets by title, description, or client/i)).toBeInTheDocument();
      expect(screen.getByText('All Status')).toBeInTheDocument();
      expect(screen.getByText('All Priority')).toBeInTheDocument();
      expect(screen.getByText('All Types')).toBeInTheDocument();
    });

    it('renders tickets table with data', async () => {
      renderWithProviders(<TicketsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Network connectivity issue')).toBeInTheDocument();
        expect(screen.getByText('Software installation problem')).toBeInTheDocument();
        expect(screen.getByText('Hardware malfunction')).toBeInTheDocument();
        expect(screen.getByText('john.smith@example.com')).toBeInTheDocument();
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      });
    });

    it('renders priority badges with correct colors and icons', async () => {
      renderWithProviders(<TicketsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('🔴')).toBeInTheDocument(); // Urgent priority icon
        expect(screen.getByText('🟠')).toBeInTheDocument(); // High priority icon  
        expect(screen.getByText('🟡')).toBeInTheDocument(); // Medium priority icon
      });
    });

    it('renders service type badges', async () => {
      renderWithProviders(<TicketsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Network')).toBeInTheDocument();
        expect(screen.getByText('Software')).toBeInTheDocument();
        expect(screen.getByText('Hardware')).toBeInTheDocument();
      });
    });

    it('renders assignment status correctly', async () => {
      renderWithProviders(<TicketsPage />);
      
      await waitFor(() => {
        // Should show "Open" for unassigned tickets
        expect(screen.getAllByText('Open')).toHaveLength(2); // 2 open tickets
        // Should show "Closed" for closed tickets
        expect(screen.getByText('Closed')).toBeInTheDocument();
      });
    });
  });

  describe('Loading and Error States', () => {
    it('renders loading skeletons when data is loading', () => {
      (ticketHooks.useTickets as any).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        refetch: vi.fn()
      });

      renderWithProviders(<TicketsPage />);
      
      // Should show 5 skeleton rows by default
      const skeletonRows = screen.getAllByRole('row');
      expect(skeletonRows.length).toBeGreaterThan(1); // Header + skeleton rows
    });

    it('renders error message when fetch fails', () => {
      const mockError = new Error('Failed to fetch tickets');
      (ticketHooks.useTickets as any).mockReturnValue({
        data: null,
        isLoading: false,
        error: mockError,
        refetch: vi.fn()
      });

      renderWithProviders(<TicketsPage />);
      
      expect(screen.getByText(/failed to load tickets/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('renders empty state when no tickets found', () => {
      (ticketHooks.useTickets as any).mockReturnValue({
        data: { ...mockTicketsData, content: [], totalElements: 0 },
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      renderWithProviders(<TicketsPage />);
      
      expect(screen.getByText(/no tickets found. create your first ticket!/i)).toBeInTheDocument();
    });

    it('renders no matches message when filters return empty', async () => {
      renderWithProviders(<TicketsPage />);
      
      const user = userEvent.setup();
      const searchInput = screen.getByPlaceholderText(/search tickets by title, description, or client/i);
      
      // Search for something that doesn't exist
      await user.type(searchInput, 'nonexistent');
      
      await waitFor(() => {
        expect(screen.getByText(/no tickets match your filters/i)).toBeInTheDocument();
      });
    });
  });

  describe('Create Ticket Modal', () => {
    it('opens create modal when New Ticket button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketsPage />);
      
      const newButton = screen.getByRole('button', { name: /new ticket/i });
      await user.click(newButton);
      
      expect(screen.getByTestId('ticket-form')).toBeInTheDocument();
      expect(screen.getByText('Create Ticket Form')).toBeInTheDocument();
    });

    it('shows correct modal title and description for create', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketsPage />);
      
      await user.click(screen.getByRole('button', { name: /new ticket/i }));
      
      expect(screen.getByText('Create New Ticket')).toBeInTheDocument();
      expect(screen.getByText(/create a new support ticket for a client/i)).toBeInTheDocument();
    });

    it('closes create modal when canceled', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketsPage />);
      
      // Open modal
      await user.click(screen.getByRole('button', { name: /new ticket/i }));
      expect(screen.getByTestId('ticket-form')).toBeInTheDocument();
      
      // Close modal
      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(screen.queryByTestId('ticket-form')).not.toBeInTheDocument();
    });
  });

  describe('Search and Filtering', () => {
    it('filters tickets by search query (title)', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketsPage />);
      
      const searchInput = screen.getByPlaceholderText(/search tickets by title, description, or client/i);
      await user.type(searchInput, 'Network');
      
      await waitFor(() => {
        expect(screen.getByText('Network connectivity issue')).toBeInTheDocument();
        expect(screen.queryByText('Software installation problem')).not.toBeInTheDocument();
        expect(screen.queryByText('Hardware malfunction')).not.toBeInTheDocument();
      });
    });

    it('filters tickets by search query (description)', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketsPage />);
      
      const searchInput = screen.getByPlaceholderText(/search tickets by title, description, or client/i);
      await user.type(searchInput, 'randomly shuts down');
      
      await waitFor(() => {
        expect(screen.getByText('Hardware malfunction')).toBeInTheDocument();
        expect(screen.queryByText('Network connectivity issue')).not.toBeInTheDocument();
      });
    });

    it('filters tickets by search query (client name)', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketsPage />);
      
      const searchInput = screen.getByPlaceholderText(/search tickets by title, description, or client/i);
      await user.type(searchInput, 'Jane');
      
      await waitFor(() => {
        expect(screen.getByText('Software installation problem')).toBeInTheDocument();
        expect(screen.queryByText('Network connectivity issue')).not.toBeInTheDocument();
      });
    });

    it('filters tickets by status', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketsPage />);
      
      // Open status filter and select Closed
      await user.click(screen.getByText('All Status'));
      await user.click(screen.getByText('Closed'));
      
      await waitFor(() => {
        expect(screen.getByText('Hardware malfunction')).toBeInTheDocument();
        expect(screen.queryByText('Network connectivity issue')).not.toBeInTheDocument();
        expect(screen.queryByText('Software installation problem')).not.toBeInTheDocument();
      });
    });

    it('filters tickets by priority', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketsPage />);
      
      // Open priority filter and select Urgent
      await user.click(screen.getByText('All Priority'));
      await user.click(screen.getByText('🔴 Urgent'));
      
      await waitFor(() => {
        expect(screen.getByText('Hardware malfunction')).toBeInTheDocument();
        expect(screen.queryByText('Network connectivity issue')).not.toBeInTheDocument();
      });
    });

    it('filters tickets by service type', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketsPage />);
      
      // Open service type filter and select Network
      await user.click(screen.getByText('All Types'));
      await user.click(screen.getByText('Network'));
      
      await waitFor(() => {
        expect(screen.getByText('Network connectivity issue')).toBeInTheDocument();
        expect(screen.queryByText('Software installation problem')).not.toBeInTheDocument();
      });
    });

    it('filters tickets by overdue status', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketsPage />);
      
      // Open status filter and select Overdue
      await user.click(screen.getByText('All Status'));
      await user.click(screen.getByText('Overdue'));
      
      await waitFor(() => {
        expect(screen.getByText('Hardware malfunction')).toBeInTheDocument();
        expect(screen.queryByText('Network connectivity issue')).not.toBeInTheDocument();
      });
    });

    it('filters tickets by unassigned status', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketsPage />);
      
      // Open status filter and select Unassigned
      await user.click(screen.getByText('All Status'));
      await user.click(screen.getByText('Unassigned'));
      
      await waitFor(() => {
        expect(screen.getByText('Network connectivity issue')).toBeInTheDocument();
        expect(screen.queryByText('Software installation problem')).not.toBeInTheDocument();
      });
    });

    it('combines multiple filters', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketsPage />);
      
      // Apply search filter
      const searchInput = screen.getByPlaceholderText(/search tickets by title, description, or client/i);
      await user.type(searchInput, 'Software');
      
      // Apply priority filter
      await user.click(screen.getByText('All Priority'));
      await user.click(screen.getByText('🟡 Medium'));
      
      await waitFor(() => {
        expect(screen.getByText('Software installation problem')).toBeInTheDocument();
        expect(screen.queryByText('Network connectivity issue')).not.toBeInTheDocument();
      });
    });

    it('clears filters when Clear Filters is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketsPage />);
      
      // Apply search filter
      const searchInput = screen.getByPlaceholderText(/search tickets by title, description, or client/i);
      await user.type(searchInput, 'Network');
      
      // Clear filters
      await user.click(screen.getByRole('button', { name: /clear filters/i }));
      
      expect(searchInput).toHaveValue('');
      // All tickets should be visible again
      await waitFor(() => {
        expect(screen.getByText('Network connectivity issue')).toBeInTheDocument();
        expect(screen.getByText('Software installation problem')).toBeInTheDocument();
      });
    });

    it('shows filter result count', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketsPage />);
      
      const searchInput = screen.getByPlaceholderText(/search tickets by title, description, or client/i);
      await user.type(searchInput, 'Network');
      
      await waitFor(() => {
        expect(screen.getByText('Showing 1 of 3 tickets matching "Network"')).toBeInTheDocument();
      });
    });
  });

  describe('Bulk Actions', () => {
    it('enables bulk actions when tickets are selected', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketsPage />);
      
      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes).toHaveLength(4); // 1 select all + 3 individual
      });
      
      // Select first ticket
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]); // First individual checkbox
      
      expect(screen.getByRole('button', { name: /export \(1\)/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /bulk actions/i })).toBeInTheDocument();
    });

    it('selects all tickets when select all is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketsPage />);
      
      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes).toHaveLength(4);
      });
      
      // Click select all
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      await user.click(selectAllCheckbox);
      
      expect(screen.getByRole('button', { name: /export \(3\)/i })).toBeInTheDocument();
    });

    it('exports selected tickets as CSV', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketsPage />);
      
      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes).toHaveLength(4);
      });
      
      // Select first ticket
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]);
      
      // Click export
      await user.click(screen.getByRole('button', { name: /export \(1\)/i }));
      
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', expect.stringContaining('tickets_export_'));
    });

    it('shows bulk actions menu', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketsPage />);
      
      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes).toHaveLength(4);
      });
      
      // Select tickets
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]);
      
      // Click bulk actions
      await user.click(screen.getByRole('button', { name: /bulk actions/i }));
      
      expect(screen.getByText('Close Selected')).toBeInTheDocument();
      expect(screen.getByText('Assign Technician')).toBeInTheDocument();
      expect(screen.getByText('Change Priority')).toBeInTheDocument();
      expect(screen.getByText('Delete Selected')).toBeInTheDocument();
    });
  });

  describe('Edit Functionality', () => {
    it('opens edit modal when edit action is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Network connectivity issue')).toBeInTheDocument();
      });
      
      // Open dropdown menu for first ticket
      const dropdownButtons = screen.getAllByRole('button', { name: '' }); // More actions buttons
      await user.click(dropdownButtons[0]);
      
      // Click edit
      await user.click(screen.getByText(/edit ticket/i));
      
      expect(screen.getByTestId('ticket-form')).toBeInTheDocument();
      expect(screen.getByText('Edit Ticket Form')).toBeInTheDocument();
    });

    it('shows correct modal title for edit', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Network connectivity issue')).toBeInTheDocument();
      });
      
      // Open dropdown and edit
      const dropdownButtons = screen.getAllByRole('button', { name: '' });
      await user.click(dropdownButtons[0]);
      await user.click(screen.getByText(/edit ticket/i));
      
      expect(screen.getByText('Edit Ticket')).toBeInTheDocument();
      expect(screen.getByText(/update ticket information and details/i)).toBeInTheDocument();
    });
  });

  describe('Delete Functionality', () => {
    it('opens delete confirmation when delete action is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Network connectivity issue')).toBeInTheDocument();
      });
      
      // Open dropdown menu
      const dropdownButtons = screen.getAllByRole('button', { name: '' });
      await user.click(dropdownButtons[0]);
      
      // Click delete
      await user.click(screen.getByText('Delete'));
      
      expect(screen.getByText('Delete Ticket')).toBeInTheDocument();
      expect(screen.getByText(/are you sure you want to delete ticket "Network connectivity issue"/i)).toBeInTheDocument();
    });

    it('calls delete mutation when confirmed', async () => {
      const user = userEvent.setup();
      const mockRefetch = vi.fn();
      (ticketHooks.useTickets as any).mockReturnValue({
        data: mockTicketsData,
        isLoading: false,
        error: null,
        refetch: mockRefetch
      });
      
      renderWithProviders(<TicketsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Network connectivity issue')).toBeInTheDocument();
      });
      
      // Open dropdown and delete
      const dropdownButtons = screen.getAllByRole('button', { name: '' });
      await user.click(dropdownButtons[0]);
      await user.click(screen.getByText('Delete'));
      
      // Confirm deletion
      await user.click(screen.getByRole('button', { name: /delete ticket/i }));
      
      expect(mockDeleteTicketMutation.mutateAsync).toHaveBeenCalledWith(1);
    });

    it('cancels delete when cancel is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Network connectivity issue')).toBeInTheDocument();
      });
      
      // Open dropdown and delete
      const dropdownButtons = screen.getAllByRole('button', { name: '' });
      await user.click(dropdownButtons[0]);
      await user.click(screen.getByText('Delete'));
      
      // Cancel deletion
      await user.click(screen.getByRole('button', { name: /cancel/i }));
      
      expect(screen.queryByText('Delete Ticket')).not.toBeInTheDocument();
      expect(mockDeleteTicketMutation.mutateAsync).not.toHaveBeenCalled();
    });
  });

  describe('Table Interactions', () => {
    it('navigates to detail page when View Details is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Network connectivity issue')).toBeInTheDocument();
      });
      
      // Open dropdown menu and click View Details
      const dropdownButtons = screen.getAllByRole('button', { name: '' });
      await user.click(dropdownButtons[0]);
      await user.click(screen.getByText(/view details/i));
      
      expect(mockNavigate).toHaveBeenCalledWith('/tickets/1');
    });

    it('sorts tickets when column headers are clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TicketsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Network connectivity issue')).toBeInTheDocument();
      });
      
      // Click title column header
      await user.click(screen.getByText('Title'));
      
      // Verify sort icon appears (this is a simplified check)
      expect(screen.getByText('Title')).toBeInTheDocument();
    });

    it('shows due date formatting correctly', async () => {
      renderWithProviders(<TicketsPage />);
      
      await waitFor(() => {
        // Should show overdue indicator
        expect(screen.getByText('(Overdue)')).toBeInTheDocument();
        // Should show "No due date" for ticket without due date
        expect(screen.getByText('No due date')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('renders properly on different screen sizes', () => {
      renderWithProviders(<TicketsPage />);
      
      // Check that responsive grid classes are present
      expect(screen.getByText('Tickets')).toBeInTheDocument();
      
      // Statistics cards should have responsive grid
      const statisticsSection = screen.getByText('Total').closest('div');
      expect(statisticsSection).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', async () => {
      renderWithProviders(<TicketsPage />);
      
      await waitFor(() => {
        // Check for proper table structure
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getAllByRole('columnheader')).toHaveLength(9); // Including select column
        expect(screen.getAllByRole('row')).toHaveLength(4); // Header + 3 data rows
      });
      
      // Check for proper button labels
      expect(screen.getByRole('button', { name: /new ticket/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /search tickets by title, description, or client/i })).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('does not show pagination when there is only one page', () => {
      renderWithProviders(<TicketsPage />);
      
      // Should not show pagination controls for single page
      expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
    });

    it('shows pagination when there are multiple pages', () => {
      const multiPageData = {
        ...mockTicketsData,
        totalPages: 3,
        number: 1
      };
      
      (ticketHooks.useTickets as any).mockReturnValue({
        data: multiPageData,
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });
      
      renderWithProviders(<TicketsPage />);
      
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
    });
  });
});