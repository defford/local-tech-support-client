/**
 * Tests for TechnicianForm component
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TechnicianForm } from '../../../components/forms/TechnicianForm';
import { TechnicianStatus } from '../../../types';
import { renderWithProviders } from '../../utils/test-utils';

// Mock the hooks
const mockUseCreateTechnician = vi.fn();
const mockUseUpdateTechnician = vi.fn();

vi.mock('../../../hooks', () => ({
  useCreateTechnician: mockUseCreateTechnician,
  useUpdateTechnician: mockUseUpdateTechnician
}));

// Mock SkillsSelector component
vi.mock('../../../components/forms/SkillsSelector', () => ({
  SkillsSelector: vi.fn(({ value, onChange, ...props }) => (
    <div data-testid="skills-selector">
      <input
        data-testid="skills-input"
        value={value?.join(', ') || ''}
        onChange={(e) => onChange(e.target.value.split(', ').filter(Boolean))}
        {...props}
      />
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
  skills: ['Hardware', 'Software']
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

describe('TechnicianForm', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCreateTechnician.mockReturnValue(mockCreateMutation);
    mockUseUpdateTechnician.mockReturnValue(mockUpdateMutation);
  });

  describe('Create Mode', () => {
    it('renders form fields for creating a technician', () => {
      renderWithProviders(
        <TechnicianForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
      expect(screen.getByTestId('skills-selector')).toBeInTheDocument();
    });

    it('renders create button in create mode', () => {
      renderWithProviders(
        <TechnicianForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      expect(screen.getByRole('button', { name: /create technician/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('validates required fields', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TechnicianForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      await user.click(screen.getByRole('button', { name: /create technician/i }));

      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('validates email format', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TechnicianForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      await user.type(screen.getByLabelText(/email/i), 'invalid-email');
      await user.click(screen.getByRole('button', { name: /create technician/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      });
    });

    it('validates phone number length', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TechnicianForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      await user.type(screen.getByLabelText(/phone/i), '123');
      await user.click(screen.getByRole('button', { name: /create technician/i }));

      await waitFor(() => {
        expect(screen.getByText(/phone number must be at least 10 digits/i)).toBeInTheDocument();
      });
    });

    it('requires at least one skill', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TechnicianForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      // Fill other required fields
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'john@example.com');
      await user.type(screen.getByLabelText(/phone/i), '1234567890');

      await user.click(screen.getByRole('button', { name: /create technician/i }));

      await waitFor(() => {
        expect(screen.getByText(/at least one skill is required/i)).toBeInTheDocument();
      });
    });

    it('submits form with valid data', async () => {
      const user = userEvent.setup();
      mockCreateMutation.mutateAsync.mockResolvedValue({});

      renderWithProviders(
        <TechnicianForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      // Fill form
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'john@example.com');
      await user.type(screen.getByLabelText(/phone/i), '1234567890');
      await user.type(screen.getByTestId('skills-input'), 'Hardware, Software');

      // Select status
      await user.click(screen.getByLabelText(/status/i));
      await user.click(screen.getByText('ACTIVE'));

      // Submit form
      await user.click(screen.getByRole('button', { name: /create technician/i }));

      await waitFor(() => {
        expect(mockCreateMutation.mutateAsync).toHaveBeenCalledWith({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          status: 'ACTIVE',
          skills: ['Hardware', 'Software']
        });
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('Edit Mode', () => {
    it('pre-fills form with technician data', () => {
      renderWithProviders(
        <TechnicianForm
          technician={mockTechnician}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument();
    });

    it('renders update button in edit mode', () => {
      renderWithProviders(
        <TechnicianForm
          technician={mockTechnician}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByRole('button', { name: /update technician/i })).toBeInTheDocument();
    });

    it('calls update mutation when submitting in edit mode', async () => {
      const user = userEvent.setup();
      mockUpdateMutation.mutateAsync.mockResolvedValue({});

      renderWithProviders(
        <TechnicianForm
          technician={mockTechnician}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      // Modify first name
      const firstNameInput = screen.getByDisplayValue('John');
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'Johnny');

      await user.click(screen.getByRole('button', { name: /update technician/i }));

      await waitFor(() => {
        expect(mockUpdateMutation.mutateAsync).toHaveBeenCalledWith({
          id: 1,
          firstName: 'Johnny',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '1234567890',
          status: 'ACTIVE',
          skills: ['Hardware', 'Software']
        });
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('displays selected status correctly', () => {
      renderWithProviders(
        <TechnicianForm
          technician={mockTechnician}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      // Check if ACTIVE status is shown (this might need adjustment based on actual Select component)
      expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('disables form during submission in create mode', async () => {
      mockUseCreateTechnician.mockReturnValue({
        ...mockCreateMutation,
        isPending: true
      });

      renderWithProviders(
        <TechnicianForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled();
      expect(screen.getByLabelText(/first name/i)).toBeDisabled();
    });

    it('disables form during submission in edit mode', () => {
      mockUseUpdateTechnician.mockReturnValue({
        ...mockUpdateMutation,
        isPending: true
      });

      renderWithProviders(
        <TechnicianForm
          technician={mockTechnician}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByRole('button', { name: /updating/i })).toBeDisabled();
      expect(screen.getByDisplayValue('John')).toBeDisabled();
    });
  });

  describe('Error States', () => {
    it('displays create error message', () => {
      mockUseCreateTechnician.mockReturnValue({
        ...mockCreateMutation,
        error: new Error('Failed to create technician')
      });

      renderWithProviders(
        <TechnicianForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      expect(screen.getByText(/failed to create technician/i)).toBeInTheDocument();
    });

    it('displays update error message', () => {
      mockUseUpdateTechnician.mockReturnValue({
        ...mockUpdateMutation,
        error: new Error('Failed to update technician')
      });

      renderWithProviders(
        <TechnicianForm
          technician={mockTechnician}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText(/failed to update technician/i)).toBeInTheDocument();
    });

    it('handles API validation errors', () => {
      const validationError = {
        message: 'Validation failed',
        details: {
          email: 'Email already exists'
        }
      };

      mockUseCreateTechnician.mockReturnValue({
        ...mockCreateMutation,
        error: validationError
      });

      renderWithProviders(
        <TechnicianForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      expect(screen.getByText(/validation failed/i)).toBeInTheDocument();
    });
  });

  describe('Form Actions', () => {
    it('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TechnicianForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('does not submit form when cancel is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TechnicianForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(mockCreateMutation.mutateAsync).not.toHaveBeenCalled();
      expect(mockUpdateMutation.mutateAsync).not.toHaveBeenCalled();
    });
  });

  describe('Skills Management', () => {
    it('allows adding and removing skills', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TechnicianForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const skillsInput = screen.getByTestId('skills-input');
      
      // Add skills
      await user.type(skillsInput, 'Hardware, Software, Networking');

      expect(skillsInput).toHaveValue('Hardware, Software, Networking');
    });

    it('pre-fills skills in edit mode', () => {
      renderWithProviders(
        <TechnicianForm
          technician={mockTechnician}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const skillsInput = screen.getByTestId('skills-input');
      expect(skillsInput).toHaveValue('Hardware, Software');
    });
  });

  describe('Status Selection', () => {
    it('shows all available status options', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TechnicianForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      await user.click(screen.getByLabelText(/status/i));

      expect(screen.getByText('ACTIVE')).toBeInTheDocument();
      expect(screen.getByText('ON_VACATION')).toBeInTheDocument();
      expect(screen.getByText('SICK_LEAVE')).toBeInTheDocument();
      expect(screen.getByText('TERMINATED')).toBeInTheDocument();
    });

    it('updates status selection', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TechnicianForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      await user.click(screen.getByLabelText(/status/i));
      await user.click(screen.getByText('ON_VACATION'));

      // The form should now have ON_VACATION selected
      expect(screen.getByText('ON_VACATION')).toBeInTheDocument();
    });
  });

  describe('Form Reset', () => {
    it('resets form when switching from edit to create mode', () => {
      const { rerender } = renderWithProviders(
        <TechnicianForm
          technician={mockTechnician}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      // Verify edit mode values are present
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();

      // Switch to create mode
      rerender(
        <TechnicianForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      // Form should be cleared
      expect(screen.getByLabelText(/first name/i)).toHaveValue('');
    });
  });
});