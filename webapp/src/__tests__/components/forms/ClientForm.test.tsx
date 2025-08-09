/**
 * Tests for ClientForm component
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClientForm } from '../../../components/forms/ClientForm';
import { ClientStatus } from '../../../types';
import { renderWithProviders } from '../../utils/test-utils';

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

const mockCreateClient = vi.fn();
const mockUpdateClient = vi.fn();
const mockOnSuccess = vi.fn();
const mockOnCancel = vi.fn();

describe('ClientForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    const { useCreateClient, useUpdateClient } = require('../../../hooks');
    useCreateClient.mockReturnValue({
      mutateAsync: mockCreateClient,
      isPending: false,
      error: null
    });
    useUpdateClient.mockReturnValue({
      mutateAsync: mockUpdateClient,
      isPending: false,
      error: null
    });
  });

  describe('Creation Mode', () => {
    it('should render creation form with empty fields', () => {
      renderWithProviders(
        <ClientForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      expect(screen.getByLabelText(/first name/i)).toHaveValue('');
      expect(screen.getByLabelText(/last name/i)).toHaveValue('');
      expect(screen.getByLabelText(/email/i)).toHaveValue('');
      expect(screen.getByLabelText(/phone/i)).toHaveValue('');
      expect(screen.getByLabelText(/address/i)).toHaveValue('');
      expect(screen.getByLabelText(/notes/i)).toHaveValue('');
      expect(screen.getByRole('button', { name: /create client/i })).toBeInTheDocument();
    });

    it('should validate required fields', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <ClientForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const submitButton = screen.getByRole('button', { name: /create client/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/phone number is required/i)).toBeInTheDocument();
      });

      expect(mockCreateClient).not.toHaveBeenCalled();
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <ClientForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid-email');
      await user.tab(); // Trigger validation

      await waitFor(() => {
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      });
    });

    it('should validate phone number length', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <ClientForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const phoneInput = screen.getByLabelText(/phone/i);
      await user.type(phoneInput, '123');
      await user.tab(); // Trigger validation

      await waitFor(() => {
        expect(screen.getByText(/phone number must be at least 10 digits/i)).toBeInTheDocument();
      });
    });

    it('should create client with valid data', async () => {
      const user = userEvent.setup();
      const newClient = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        address: '123 Main St',
        notes: 'Test notes',
        status: ClientStatus.ACTIVE,
        active: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      mockCreateClient.mockResolvedValue(newClient);

      renderWithProviders(
        <ClientForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      // Fill out the form
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
      await user.type(screen.getByLabelText(/phone/i), '1234567890');
      await user.type(screen.getByLabelText(/address/i), '123 Main St');
      await user.type(screen.getByLabelText(/notes/i), 'Test notes');

      // Submit the form
      await user.click(screen.getByRole('button', { name: /create client/i }));

      await waitFor(() => {
        expect(mockCreateClient).toHaveBeenCalledWith({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '1234567890',
          address: '123 Main St',
          notes: 'Test notes',
          status: ClientStatus.ACTIVE
        });
      });

      expect(mockOnSuccess).toHaveBeenCalledWith(newClient);
    });

    it('should handle creation error', async () => {
      const user = userEvent.setup();
      const error = new Error('Failed to create client');
      mockCreateClient.mockRejectedValue(error);

      renderWithProviders(
        <ClientForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      // Fill required fields
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
      await user.type(screen.getByLabelText(/phone/i), '1234567890');

      // Submit the form
      await user.click(screen.getByRole('button', { name: /create client/i }));

      await waitFor(() => {
        expect(mockCreateClient).toHaveBeenCalled();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <ClientForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('Edit Mode', () => {
    const existingClient = {
      id: 1,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '9876543210',
      address: '456 Oak St',
      notes: 'Existing notes',
      status: ClientStatus.ACTIVE,
      active: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };

    it('should render edit form with pre-filled data', () => {
      renderWithProviders(
        <ClientForm 
          client={existingClient}
          onSuccess={mockOnSuccess} 
          onCancel={mockOnCancel} 
        />
      );

      expect(screen.getByLabelText(/first name/i)).toHaveValue('Jane');
      expect(screen.getByLabelText(/last name/i)).toHaveValue('Smith');
      expect(screen.getByLabelText(/email/i)).toHaveValue('jane.smith@example.com');
      expect(screen.getByLabelText(/phone/i)).toHaveValue('9876543210');
      expect(screen.getByLabelText(/address/i)).toHaveValue('456 Oak St');
      expect(screen.getByLabelText(/notes/i)).toHaveValue('Existing notes');
      expect(screen.getByRole('button', { name: /update client/i })).toBeInTheDocument();
    });

    it('should update client with modified data', async () => {
      const user = userEvent.setup();
      const updatedClient = { ...existingClient, firstName: 'Updated Jane' };
      mockUpdateClient.mockResolvedValue(updatedClient);

      renderWithProviders(
        <ClientForm 
          client={existingClient}
          onSuccess={mockOnSuccess} 
          onCancel={mockOnCancel} 
        />
      );

      // Modify first name
      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'Updated Jane');

      // Submit the form
      await user.click(screen.getByRole('button', { name: /update client/i }));

      await waitFor(() => {
        expect(mockUpdateClient).toHaveBeenCalledWith({
          id: 1,
          data: {
            firstName: 'Updated Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            phone: '9876543210',
            address: '456 Oak St',
            notes: 'Existing notes',
            status: ClientStatus.ACTIVE
          }
        });
      });

      expect(mockOnSuccess).toHaveBeenCalledWith(updatedClient);
    });

    it('should handle update error', async () => {
      const user = userEvent.setup();
      const error = new Error('Failed to update client');
      mockUpdateClient.mockRejectedValue(error);

      renderWithProviders(
        <ClientForm 
          client={existingClient}
          onSuccess={mockOnSuccess} 
          onCancel={mockOnCancel} 
        />
      );

      // Submit the form
      await user.click(screen.getByRole('button', { name: /update client/i }));

      await waitFor(() => {
        expect(mockUpdateClient).toHaveBeenCalled();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should show loading state during creation', () => {
      const { useCreateClient } = require('../../../hooks');
      useCreateClient.mockReturnValue({
        mutateAsync: mockCreateClient,
        isPending: true,
        error: null
      });

      renderWithProviders(
        <ClientForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      expect(screen.getByRole('button', { name: /create client/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    });

    it('should show loading state during update', () => {
      const { useUpdateClient } = require('../../../hooks');
      useUpdateClient.mockReturnValue({
        mutateAsync: mockUpdateClient,
        isPending: true,
        error: null
      });

      const existingClient = {
        id: 1,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '9876543210',
        status: ClientStatus.ACTIVE,
        active: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      renderWithProviders(
        <ClientForm 
          client={existingClient}
          onSuccess={mockOnSuccess} 
          onCancel={mockOnCancel} 
        />
      );

      expect(screen.getByRole('button', { name: /update client/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    });
  });
});