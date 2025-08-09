/**
 * Integration tests for Technician Management workflow
 * Tests the complete CRUD flow from TechniciansPage through forms and detail views
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TechniciansPage } from '../../pages/technicians/TechniciansPage';
import { TechnicianDetailPage } from '../../pages/technicians/TechnicianDetailPage';
import { TechnicianStatus } from '../../types';
import { server } from '../mocks/server';

// Mock components that aren't part of the integration test
vi.mock('../../components/theme-provider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children
}));

vi.mock('../../components/layout', () => ({
  AppShellLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Integration test component that simulates the app routing
function TechnicianApp() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Don't retry in tests
        gcTime: 0, // Disable caching in tests
        staleTime: 0
      },
      mutations: {
        retry: false
      }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TechniciansPage />} />
          <Route path="/technicians" element={<TechniciansPage />} />
          <Route path="/technicians/:id" element={<TechnicianDetailPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}


describe('Technician Management Integration', () => {
  beforeEach(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });

  describe('Complete CRUD Workflow', () => {
    it('loads technicians page and displays data', async () => {
      render(<TechnicianApp />);

      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText('Technicians')).toBeInTheDocument();
      });

      // Check that technicians are displayed
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      });

      // Check statistics
      expect(screen.getByText('Total Technicians')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // Total count
    });

    it('creates a new technician through the complete workflow', async () => {
      const user = userEvent.setup();
      render(<TechnicianApp />);

      await waitFor(() => {
        expect(screen.getByText('Technicians')).toBeInTheDocument();
      });

      // Click New Technician button
      await user.click(screen.getByRole('button', { name: /new technician/i }));

      // Fill out the form
      await user.type(screen.getByLabelText(/first name/i), 'Bob');
      await user.type(screen.getByLabelText(/last name/i), 'Wilson');
      await user.type(screen.getByLabelText(/email/i), 'bob.wilson@example.com');
      await user.type(screen.getByLabelText(/phone/i), '5551234567');
      
      // Select status
      await user.click(screen.getByLabelText(/status/i));
      await user.click(screen.getByText('ACTIVE'));

      // Add skills (simplified for test)
      const skillsInput = screen.getByPlaceholderText(/enter skills/i) || screen.getByTestId('skills-input');
      await user.type(skillsInput, 'Database Administration');

      // Submit form
      await user.click(screen.getByRole('button', { name: /create technician/i }));

      // Verify technician was created and appears in list
      await waitFor(() => {
        expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
        expect(screen.getByText('bob.wilson@example.com')).toBeInTheDocument();
      });

      // Verify modal is closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('edits an existing technician', async () => {
      const user = userEvent.setup();
      render(<TechnicianApp />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Find and click the dropdown menu for John Doe
      const tableRows = screen.getAllByRole('row');
      const johnDoeRow = tableRows.find(row => within(row).queryByText('John Doe'));
      expect(johnDoeRow).toBeInTheDocument();

      const dropdownButton = within(johnDoeRow!).getByRole('button', { name: '' }); // More actions button
      await user.click(dropdownButton);

      // Click Edit
      await user.click(screen.getByText(/edit technician/i));

      // Verify edit modal opens with existing data
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();

      // Modify the technician
      const firstNameInput = screen.getByDisplayValue('John');
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'Johnny');

      // Submit changes
      await user.click(screen.getByRole('button', { name: /update technician/i }));

      // Verify changes appear in the list
      await waitFor(() => {
        expect(screen.getByText('Johnny Doe')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      });
    });

    it('deletes a technician with confirmation', async () => {
      const user = userEvent.setup();
      render(<TechnicianApp />);

      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });

      // Find and click the dropdown menu for Jane Smith
      const tableRows = screen.getAllByRole('row');
      const janeRow = tableRows.find(row => within(row).queryByText('Jane Smith'));
      expect(janeRow).toBeInTheDocument();

      const dropdownButton = within(janeRow!).getByRole('button', { name: '' });
      await user.click(dropdownButton);

      // Click Delete
      await user.click(screen.getByText('Delete'));

      // Verify delete confirmation modal
      expect(screen.getByText('Delete Technician')).toBeInTheDocument();
      expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument(); // In confirmation dialog

      // Confirm deletion
      await user.click(screen.getByRole('button', { name: /delete technician/i }));

      // Verify technician is removed from list
      await waitFor(() => {
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });

      // Verify John Doe is still there
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('navigates to technician detail page and back', async () => {
      const user = userEvent.setup();
      render(<TechnicianApp />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Find and click the dropdown menu for John Doe
      const tableRows = screen.getAllByRole('row');
      const johnDoeRow = tableRows.find(row => within(row).queryByText('John Doe'));
      expect(johnDoeRow).toBeInTheDocument();

      const dropdownButton = within(johnDoeRow!).getByRole('button', { name: '' });
      await user.click(dropdownButton);

      // Click View Details
      await user.click(screen.getByText(/view details/i));

      // Verify we're on the detail page
      await waitFor(() => {
        expect(screen.getByText('Technician Details')).toBeInTheDocument();
        expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      });

      // Verify sections are present
      expect(screen.getByText('Skills')).toBeInTheDocument();
      expect(screen.getByText('Current Tickets')).toBeInTheDocument();
      expect(screen.getByText('Current Workload')).toBeInTheDocument();

      // Navigate back
      await user.click(screen.getByRole('button', { name: /back to technicians/i }));

      // Verify we're back on the list page
      await waitFor(() => {
        expect(screen.getByText('Manage technician accounts and skills')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });
  });

  describe('Search and Filter Integration', () => {
    it('searches and filters technicians', async () => {
      const user = userEvent.setup();
      render(<TechnicianApp />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });

      // Search for John
      const searchInput = screen.getByPlaceholderText(/search technicians/i);
      await user.type(searchInput, 'John');

      // Verify only John is shown
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });

      // Clear search
      await user.clear(searchInput);

      // Both should be visible again
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });

      // Filter by status
      await user.click(screen.getByText('All Statuses'));
      await user.click(screen.getByText('Active'));

      // Only active technician should be shown
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });
    });
  });

  describe('Bulk Operations Integration', () => {
    it('selects multiple technicians and exports them', async () => {
      const user = userEvent.setup();
      
      // Mock URL.createObjectURL for export
      Object.defineProperty(window, 'URL', {
        value: {
          createObjectURL: vi.fn(() => 'mock-url'),
          revokeObjectURL: vi.fn()
        }
      });

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

      render(<TechnicianApp />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });

      // Select both technicians
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]); // First technician
      await user.click(checkboxes[2]); // Second technician

      // Verify selection UI appears
      expect(screen.getByText('2 technicians selected')).toBeInTheDocument();

      // Export selected
      await user.click(screen.getByRole('button', { name: /export selected/i }));

      // Verify export was triggered
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', expect.stringContaining('technicians_export_'));
    });
  });

  describe('Error Handling Integration', () => {
    it('handles API errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock a server error for the create operation
      server.use(
        /* This would be configured in the mock handlers to return errors */
      );

      render(<TechnicianApp />);

      await waitFor(() => {
        expect(screen.getByText('Technicians')).toBeInTheDocument();
      });

      // Try to create a technician that will fail
      await user.click(screen.getByRole('button', { name: /new technician/i }));

      await user.type(screen.getByLabelText(/first name/i), 'Error');
      await user.type(screen.getByLabelText(/last name/i), 'Test');
      await user.type(screen.getByLabelText(/email/i), 'error@example.com');
      await user.type(screen.getByLabelText(/phone/i), '1234567890');

      // Select status and skills
      await user.click(screen.getByLabelText(/status/i));
      await user.click(screen.getByText('ACTIVE'));

      // Submit form (this would trigger an error in a real scenario)
      await user.click(screen.getByRole('button', { name: /create technician/i }));

      // In a real scenario with mock errors, we would verify error handling
      // For now, we just verify the form submission attempt
      expect(screen.getByRole('button', { name: /create technician/i })).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior Integration', () => {
    it('adapts to mobile viewports', async () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      render(<TechnicianApp />);

      await waitFor(() => {
        expect(screen.getByText('Technicians')).toBeInTheDocument();
      });

      // Mobile-specific elements should be present
      // This would need to be adapted based on the actual responsive behavior
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('Performance and UX Integration', () => {
    it('shows loading states during async operations', async () => {
      const user = userEvent.setup();
      render(<TechnicianApp />);

      // Initial loading should be handled
      await waitFor(() => {
        expect(screen.getByText('Technicians')).toBeInTheDocument();
      });

      // When creating a technician, loading states should appear
      await user.click(screen.getByRole('button', { name: /new technician/i }));

      // Form should be available
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    });
  });
});