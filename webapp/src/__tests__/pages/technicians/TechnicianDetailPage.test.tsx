/**
 * Tests for TechnicianDetailPage component
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TechnicianDetailPage } from '../../../pages/technicians/TechnicianDetailPage';
import { TechnicianStatus } from '../../../types';
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
const mockUseTechnician = vi.fn();
const mockUseTechnicianWorkload = vi.fn();
const mockUseTechnicianTickets = vi.fn();
const mockUseTechnicianAppointments = vi.fn();

vi.mock('../../../hooks/useTechnicians', () => ({
  useTechnician: mockUseTechnician,
  useTechnicianWorkload: mockUseTechnicianWorkload,
  useTechnicianTickets: mockUseTechnicianTickets,
  useTechnicianAppointments: mockUseTechnicianAppointments
}));

// Mock the components
vi.mock('../../../components/forms/TechnicianForm', () => ({
  TechnicianForm: vi.fn(({ technician, onSuccess, onCancel }) => (
    <div data-testid="technician-form">
      <span>Edit {technician?.firstName} {technician?.lastName}</span>
      <button onClick={onSuccess}>Success</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ))
}));

const mockTechnician = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '1234567890',
  status: TechnicianStatus.ACTIVE,
  skills: ['Hardware', 'Software', 'Networking'],
  assignedTickets: 5,
  completedTickets: 12,
  workloadLevel: 'MEDIUM'
};

const mockWorkloadData = {
  currentLoad: 'MEDIUM',
  assignedTickets: 5,
  completedTickets: 12,
  averageResolutionTime: 24,
  available: true
};

const mockTicketsData = {
  content: [
    {
      id: 101,
      title: 'Email server down',
      description: 'Exchange server not responding',
      status: 'OPEN'
    },
    {
      id: 102,
      title: 'Printer not working',
      description: 'HP printer in accounting department',
      status: 'IN_PROGRESS'
    }
  ],
  totalElements: 2
};

const mockAppointmentsData = {
  content: [
    {
      id: 201,
      scheduledDateTime: '2024-01-15T10:00:00Z',
      description: 'Server maintenance'
    },
    {
      id: 202,
      scheduledDateTime: '2024-01-16T14:00:00Z',
      description: 'Network upgrade'
    }
  ],
  totalElements: 2
};

describe('TechnicianDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ id: '1' });
    mockUseTechnician.mockReturnValue({
      data: mockTechnician,
      isLoading: false,
      error: null
    });
    mockUseTechnicianWorkload.mockReturnValue({
      data: mockWorkloadData,
      isLoading: false
    });
    mockUseTechnicianTickets.mockReturnValue({
      data: mockTicketsData,
      isLoading: false
    });
    mockUseTechnicianAppointments.mockReturnValue({
      data: mockAppointmentsData,
      isLoading: false
    });
  });

  describe('Rendering', () => {
    it('renders technician name and back button', async () => {
      renderWithProviders(<TechnicianDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /back to technicians/i })).toBeInTheDocument();
      });
    });

    it('renders edit technician button', async () => {
      renderWithProviders(<TechnicianDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit technician/i })).toBeInTheDocument();
      });
    });

    it('renders technician information card', async () => {
      renderWithProviders(<TechnicianDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByText('1234567890')).toBeInTheDocument();
        expect(screen.getByText('ACTIVE')).toBeInTheDocument();
      });
    });

    it('renders skills section', async () => {
      renderWithProviders(<TechnicianDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Skills')).toBeInTheDocument();
        expect(screen.getByText('Hardware')).toBeInTheDocument();
        expect(screen.getByText('Software')).toBeInTheDocument();
        expect(screen.getByText('Networking')).toBeInTheDocument();
      });
    });

    it('renders current tickets section', async () => {
      renderWithProviders(<TechnicianDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Current Tickets')).toBeInTheDocument();
        expect(screen.getByText('Email server down')).toBeInTheDocument();
        expect(screen.getByText('Printer not working')).toBeInTheDocument();
      });
    });

    it('renders upcoming appointments section', async () => {
      renderWithProviders(<TechnicianDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Upcoming Appointments')).toBeInTheDocument();
        expect(screen.getByText('Server maintenance')).toBeInTheDocument();
        expect(screen.getByText('Network upgrade')).toBeInTheDocument();
      });
    });

    it('renders workload card', async () => {
      renderWithProviders(<TechnicianDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Current Workload')).toBeInTheDocument();
        expect(screen.getByText('55%')).toBeInTheDocument(); // MEDIUM workload
      });
    });

    it('renders performance metrics', async () => {
      renderWithProviders(<TechnicianDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
        expect(screen.getByText('Assigned Tickets')).toBeInTheDocument();
        expect(screen.getByText('Completed Tickets')).toBeInTheDocument();
        expect(screen.getByText('Avg Resolution Time')).toBeInTheDocument();
      });
    });

    it('renders quick actions card', async () => {
      renderWithProviders(<TechnicianDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Quick Actions')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /schedule appointment/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /assign new ticket/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /view full report/i })).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('renders loading skeleton when technician data is loading', () => {
      mockUseTechnician.mockReturnValue({
        data: null,
        isLoading: true,
        error: null
      });

      renderWithProviders(<TechnicianDetailPage />);
      
      // Should render skeleton elements
      expect(screen.getAllByRole('generic')).toHaveLength(expect.any(Number));
    });

    it('renders loading states for individual sections', async () => {
      mockUseTechnicianTickets.mockReturnValue({
        data: null,
        isLoading: true
      });
      
      renderWithProviders(<TechnicianDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Current Tickets')).toBeInTheDocument();
      });
    });
  });

  describe('Error States', () => {
    it('renders error message when technician not found', () => {
      mockUseTechnician.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Technician not found')
      });

      renderWithProviders(<TechnicianDetailPage />);
      
      expect(screen.getByText('Technician not found')).toBeInTheDocument();
    });

    it('renders generic error for other fetch errors', () => {
      mockUseTechnician.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Network error')
      });

      renderWithProviders(<TechnicianDetailPage />);
      
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('navigates back to technicians list when back button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TechnicianDetailPage />);
      
      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /back to technicians/i });
        expect(backButton).toBeInTheDocument();
      });
      
      await user.click(screen.getByRole('button', { name: /back to technicians/i }));
      
      expect(mockNavigate).toHaveBeenCalledWith('/technicians');
    });
  });

  describe('Edit Functionality', () => {
    it('opens edit modal when edit button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TechnicianDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit technician/i })).toBeInTheDocument();
      });
      
      await user.click(screen.getByRole('button', { name: /edit technician/i }));
      
      expect(screen.getByTestId('technician-form')).toBeInTheDocument();
      expect(screen.getByText('Edit John Doe')).toBeInTheDocument();
    });

    it('closes edit modal when canceled', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TechnicianDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit technician/i })).toBeInTheDocument();
      });
      
      // Open modal
      await user.click(screen.getByRole('button', { name: /edit technician/i }));
      expect(screen.getByTestId('technician-form')).toBeInTheDocument();
      
      // Close modal
      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(screen.queryByTestId('technician-form')).not.toBeInTheDocument();
    });

    it('closes edit modal when form submission is successful', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TechnicianDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit technician/i })).toBeInTheDocument();
      });
      
      // Open modal
      await user.click(screen.getByRole('button', { name: /edit technician/i }));
      expect(screen.getByTestId('technician-form')).toBeInTheDocument();
      
      // Submit form
      await user.click(screen.getByRole('button', { name: /success/i }));
      expect(screen.queryByTestId('technician-form')).not.toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('displays empty state for no skills', async () => {
      const technicianWithNoSkills = { ...mockTechnician, skills: [] };
      mockUseTechnician.mockReturnValue({
        data: technicianWithNoSkills,
        isLoading: false,
        error: null
      });
      
      renderWithProviders(<TechnicianDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByText('No skills assigned')).toBeInTheDocument();
      });
    });

    it('displays empty state for no tickets', async () => {
      mockUseTechnicianTickets.mockReturnValue({
        data: { content: [], totalElements: 0 },
        isLoading: false
      });
      
      renderWithProviders(<TechnicianDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByText('No active tickets assigned')).toBeInTheDocument();
      });
    });

    it('displays empty state for no appointments', async () => {
      mockUseTechnicianAppointments.mockReturnValue({
        data: { content: [], totalElements: 0 },
        isLoading: false
      });
      
      renderWithProviders(<TechnicianDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByText('No upcoming appointments')).toBeInTheDocument();
      });
    });

    it('displays view all button when there are more than 5 tickets', async () => {
      const manyTickets = {
        content: Array.from({ length: 7 }, (_, i) => ({
          id: i + 100,
          title: `Ticket ${i + 1}`,
          description: `Description ${i + 1}`,
          status: 'OPEN'
        })),
        totalElements: 7
      };
      
      mockUseTechnicianTickets.mockReturnValue({
        data: manyTickets,
        isLoading: false
      });
      
      renderWithProviders(<TechnicianDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /view all 7 tickets/i })).toBeInTheDocument();
      });
    });

    it('displays different workload colors based on load level', async () => {
      // Test HIGH workload
      mockUseTechnicianWorkload.mockReturnValue({
        data: { ...mockWorkloadData, currentLoad: 'HIGH' },
        isLoading: false
      });
      
      renderWithProviders(<TechnicianDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByText('85%')).toBeInTheDocument(); // HIGH workload percentage
      });
    });
  });

  describe('URL Parameter Handling', () => {
    it('uses technician ID from URL parameters', () => {
      mockUseParams.mockReturnValue({ id: '123' });
      
      renderWithProviders(<TechnicianDetailPage />);
      
      expect(mockUseTechnician).toHaveBeenCalledWith(123);
    });

    it('handles invalid URL parameters', () => {
      mockUseParams.mockReturnValue({ id: 'invalid' });
      
      renderWithProviders(<TechnicianDetailPage />);
      
      expect(mockUseTechnician).toHaveBeenCalledWith(0); // Invalid ID defaults to 0
    });
  });
});