/**
 * Tests for ClientModal component
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClientModal } from '../../../components/forms/ClientModal';
import { ClientStatus } from '../../../types';
import { renderWithProviders } from '../../utils/test-utils';

// Mock the ClientForm component
vi.mock('../../../components/forms/ClientForm', () => ({
  ClientForm: vi.fn(({ onSuccess, onCancel }) => (
    <div data-testid="client-form">
      <button onClick={() => onSuccess?.({ id: 1, firstName: 'Test', lastName: 'User' })}>
        Mock Success
      </button>
      <button onClick={onCancel}>Mock Cancel</button>
    </div>
  ))
}));

const mockOnClose = vi.fn();
const mockOnSuccess = vi.fn();

describe('ClientModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render creation modal when no client is provided', () => {
    renderWithProviders(
      <ClientModal 
        opened={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Create New Client')).toBeInTheDocument();
    expect(screen.getByTestId('client-form')).toBeInTheDocument();
  });

  it('should render edit modal when client is provided', () => {
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
      <ClientModal 
        opened={true}
        onClose={mockOnClose}
        client={existingClient}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Edit Client')).toBeInTheDocument();
    expect(screen.getByTestId('client-form')).toBeInTheDocument();
  });

  it('should not render when modal is closed', () => {
    renderWithProviders(
      <ClientModal 
        opened={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.queryByText('Create New Client')).not.toBeInTheDocument();
    expect(screen.queryByTestId('client-form')).not.toBeInTheDocument();
  });

  it('should handle form success and close modal', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ClientModal 
        opened={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const successButton = screen.getByText('Mock Success');
    await user.click(successButton);

    expect(mockOnSuccess).toHaveBeenCalledWith({ id: 1, firstName: 'Test', lastName: 'User' });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should handle form cancel and close modal', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ClientModal 
        opened={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const cancelButton = screen.getByText('Mock Cancel');
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});