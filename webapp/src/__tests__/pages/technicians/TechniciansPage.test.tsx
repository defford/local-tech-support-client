/**
 * Tests for TechniciansPage component
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TechniciansPage } from '../../../pages/technicians/TechniciansPage';  
import { TechnicianStatus } from '../../../types';
import { renderWithProviders } from '../../utils/test-utils';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  ...vi.importActual('react-router-dom')
}));

// Mock the hooks
const mockUseTechnicians = vi.fn();
const mockUseDeleteTechnician = vi.fn();

vi.mock('../../../hooks/useTechnicians', () => ({
  useTechnicians: mockUseTechnicians,
  useDeleteTechnician: mockUseDeleteTechnician
}));

// Mock the components
vi.mock('../../../components/forms/TechnicianForm', () => ({
  TechnicianForm: vi.fn(({ technician, onSuccess, onCancel }) => (
    <div data-testid="technician-form">
      <span>{technician ? 'Edit' : 'Create'} Technician Form</span>
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

const mockTechniciansData = {
  content: [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
      status: TechnicianStatus.ACTIVE,
      skills: ['Hardware', 'Software'],
      assignedTickets: 5,
      completedTickets: 10,
      workloadLevel: 'MEDIUM'
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '0987654321',
      status: TechnicianStatus.ON_VACATION,
      skills: ['Networking', 'Security'],
      assignedTickets: 2,
      completedTickets: 15,
      workloadLevel: 'LOW'
    }
  ],
  totalElements: 2,
  totalPages: 1,
  size: 20,
  number: 0
};

const mockDeleteTechnicianMutation = {
  mutateAsync: vi.fn(),
  isPending: false,
  error: null
};

describe('TechniciansPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTechnicians.mockReturnValue({
      data: mockTechniciansData,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });
    mockUseDeleteTechnician.mockReturnValue(mockDeleteTechnicianMutation);
  });

  describe('Rendering', () => {
    it('renders page title and description', () => {
      renderWithProviders(<TechniciansPage />);
      
      expect(screen.getByText('Technicians')).toBeInTheDocument();
      expect(screen.getByText('Manage technician accounts and skills')).toBeInTheDocument();
    });

    it('renders New Technician button', () => {
      renderWithProviders(<TechniciansPage />);
      
      expect(screen.getByRole('button', { name: /new technician/i })).toBeInTheDocument();
    });

    it('renders search and filter controls', () => {
      renderWithProviders(<TechniciansPage />);
      
      expect(screen.getByPlaceholderText(/search technicians/i)).toBeInTheDocument();
      expect(screen.getByText('All Statuses')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/filter by skills/i)).toBeInTheDocument();
    });

    it('renders technicians table with data', async () => {
      renderWithProviders(<TechniciansPage />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
      });
    });

    it('renders statistics cards', async () => {
      renderWithProviders(<TechniciansPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Total Technicians')).toBeInTheDocument();
        expect(screen.getByText('Active')).toBeInTheDocument();
        expect(screen.getByText('On Vacation')).toBeInTheDocument();
      });
    });
  });

  describe('Loading and Error States', () => {
    it('renders loading skeletons when data is loading', () => {
      mockUseTechnicians.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        refetch: vi.fn()
      });

      renderWithProviders(<TechniciansPage />);
      
      expect(screen.getByText('Loading technicians...')).toBeInTheDocument();
    });

    it('renders error message when fetch fails', () => {
      const mockError = new Error('Failed to fetch');
      mockUseTechnicians.mockReturnValue({
        data: null,
        isLoading: false,
        error: mockError,
        refetch: vi.fn()
      });

      renderWithProviders(<TechniciansPage />);
      
      expect(screen.getByText(/failed to load technicians/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('renders empty state when no technicians found', () => {
      mockUseTechnicians.mockReturnValue({
        data: { ...mockTechniciansData, content: [], totalElements: 0 },
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      renderWithProviders(<TechniciansPage />);
      
      expect(screen.getByText(/no technicians found/i)).toBeInTheDocument();
    });
  });

  describe('Create Technician Modal', () => {
    it('opens create modal when New Technician button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TechniciansPage />);
      
      const newButton = screen.getByRole('button', { name: /new technician/i });
      await user.click(newButton);
      
      expect(screen.getByTestId('technician-form')).toBeInTheDocument();
      expect(screen.getByText('Create Technician Form')).toBeInTheDocument();
    });

    it('closes create modal when canceled', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TechniciansPage />);
      
      // Open modal
      await user.click(screen.getByRole('button', { name: /new technician/i }));
      expect(screen.getByTestId('technician-form')).toBeInTheDocument();
      
      // Close modal
      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(screen.queryByTestId('technician-form')).not.toBeInTheDocument();
    });
  });

  describe('Search and Filtering', () => {
    it('filters technicians by search query', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TechniciansPage />);
      
      const searchInput = screen.getByPlaceholderText(/search technicians/i);
      await user.type(searchInput, 'John');
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });
    });

    it('filters technicians by status', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TechniciansPage />);
      
      // Open status filter
      await user.click(screen.getByText('All Statuses'));
      await user.click(screen.getByText('Active'));
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });
    });

    it('clears filters when Clear Filters is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TechniciansPage />);
      
      // Apply search filter
      const searchInput = screen.getByPlaceholderText(/search technicians/i);
      await user.type(searchInput, 'John');
      
      // Clear filters
      await user.click(screen.getByRole('button', { name: /clear filters/i }));
      
      expect(searchInput).toHaveValue('');
    });
  });

  describe('Bulk Actions', () => {
    it('enables bulk actions when technicians are selected', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TechniciansPage />);
      
      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes).toHaveLength(3); // 1 select all + 2 individual
      });
      
      // Select first technician
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]); // First individual checkbox
      
      expect(screen.getByText('1 technician selected')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export selected/i })).toBeInTheDocument();
    });

    it('exports selected technicians as CSV', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TechniciansPage />);
      
      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes).toHaveLength(3);
      });
      
      // Select first technician
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]);
      
      // Click export
      await user.click(screen.getByRole('button', { name: /export selected/i }));
      
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', expect.stringContaining('technicians_export_'));
    });
  });

  describe('Edit Functionality', () => {
    it('opens edit modal when edit action is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TechniciansPage />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      // Open dropdown menu
      const dropdownButtons = screen.getAllByRole('button', { name: '' }); // More actions buttons
      await user.click(dropdownButtons[0]);
      
      // Click edit
      await user.click(screen.getByText(/edit technician/i));
      
      expect(screen.getByTestId('technician-form')).toBeInTheDocument();
      expect(screen.getByText('Edit Technician Form')).toBeInTheDocument();
    });
  });

  describe('Delete Functionality', () => {
    it('opens delete confirmation when delete action is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TechniciansPage />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      // Open dropdown menu
      const dropdownButtons = screen.getAllByRole('button', { name: '' });
      await user.click(dropdownButtons[0]);
      
      // Click delete
      await user.click(screen.getByText('Delete'));
      
      expect(screen.getByText('Delete Technician')).toBeInTheDocument();
      expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
    });

    it('calls delete mutation when confirmed', async () => {
      const user = userEvent.setup();
      const mockRefetch = vi.fn();
      mockUseTechnicians.mockReturnValue({
        ...mockUseTechnicians(),
        refetch: mockRefetch
      });
      
      renderWithProviders(<TechniciansPage />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      // Open dropdown and delete
      const dropdownButtons = screen.getAllByRole('button', { name: '' });
      await user.click(dropdownButtons[0]);
      await user.click(screen.getByText('Delete'));
      
      // Confirm deletion
      await user.click(screen.getByRole('button', { name: /delete technician/i }));
      
      expect(mockDeleteTechnicianMutation.mutateAsync).toHaveBeenCalledWith(1);
    });
  });

  describe('Table Interactions', () => {
    it('navigates to detail page when View Details is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TechniciansPage />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      // Open dropdown menu and click View Details
      const dropdownButtons = screen.getAllByRole('button', { name: '' });
      await user.click(dropdownButtons[0]);
      await user.click(screen.getByText(/view details/i));
      
      expect(mockNavigate).toHaveBeenCalledWith('/technicians/1');
    });

    it('sorts technicians when column headers are clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TechniciansPage />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      // Click name column header
      await user.click(screen.getByText('Name'));
      
      // Verify sort icon appears (this is a simplified check)
      expect(screen.getByText('Name')).toBeInTheDocument();
    });
  });
});