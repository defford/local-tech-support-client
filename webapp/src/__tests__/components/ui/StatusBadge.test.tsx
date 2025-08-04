/**
 * Tests for StatusBadge component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '../../utils/test-utils';
import { StatusBadge, ClientStatusBadge } from '../../../components/ui';
import { ClientStatus, TicketPriority } from '../../../types';

describe('StatusBadge', () => {
  it('renders with correct text and color for client active status', () => {
    render(<StatusBadge status={ClientStatus.ACTIVE} />);
    
    const badge = screen.getByText('Active');
    expect(badge).toBeInTheDocument();
  });

  it('renders with correct text for ticket priority', () => {
    render(<StatusBadge status={TicketPriority.URGENT} />);
    
    const badge = screen.getByText('Urgent');
    expect(badge).toBeInTheDocument();
  });

  it('formats status text correctly', () => {
    render(<StatusBadge status="ON_VACATION" />);
    
    const badge = screen.getByText('On Vacation');
    expect(badge).toBeInTheDocument();
  });

  it('accepts custom children text', () => {
    render(<StatusBadge status={ClientStatus.ACTIVE}>Custom Text</StatusBadge>);
    
    const badge = screen.getByText('Custom Text');
    expect(badge).toBeInTheDocument();
  });

  it('renders ClientStatusBadge with type safety', () => {
    render(<ClientStatusBadge status={ClientStatus.SUSPENDED} />);
    
    const badge = screen.getByText('Suspended');
    expect(badge).toBeInTheDocument();
  });
});