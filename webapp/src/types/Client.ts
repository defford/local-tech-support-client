import { ClientStatus } from './enums';

/**
 * Client entity type definition
 * Converted from Java Client model
 */
export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
  status: ClientStatus;
  active: boolean;
  fullName?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Client creation/update request type
 */
export interface ClientRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
  status: ClientStatus;
}

/**
 * Client with computed properties for display
 */
export interface ClientDisplay extends Client {
  displayName: string;
  isActive: boolean;
}

/**
 * Utility functions for Client operations
 */
export const ClientUtils = {
  /**
   * Get full name from first and last name
   */
  getFullName: (client: Pick<Client, 'firstName' | 'lastName' | 'fullName'>): string => {
    if (client.fullName?.trim()) {
      return client.fullName.trim();
    }
    
    const first = client.firstName?.trim() || '';
    const last = client.lastName?.trim() || '';
    
    if (!first && !last) return '';
    if (!first) return last;
    if (!last) return first;
    return `${first} ${last}`;
  },

  /**
   * Get display name with status
   */
  getDisplayName: (client: Client): string => {
    const fullName = ClientUtils.getFullName(client);
    const statusText = client.status === ClientStatus.ACTIVE ? 'Active' : 'Inactive';
    return `${fullName} (${statusText})`;
  },

  /**
   * Check if client is active
   */
  isActive: (client: Client): boolean => {
    return client.status === ClientStatus.ACTIVE;
  }
};