import { TechnicianStatus } from './enums';

/**
 * Technician entity type definition
 * Converted from Java Technician model
 */
export interface Technician {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: TechnicianStatus;
  skills: string[];
  fullName?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  currentWorkload?: number;
  available?: boolean;
}

/**
 * Technician creation/update request type
 */
export interface TechnicianRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: TechnicianStatus;
  skills: string[];
}

/**
 * Technician with computed properties for display
 */
export interface TechnicianDisplay extends Technician {
  shortName: string;
  isActive: boolean;
  workloadLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * Utility functions for Technician operations
 */
export const TechnicianUtils = {
  /**
   * Get full name from first and last name
   */
  getFullName: (technician: Pick<Technician, 'firstName' | 'lastName' | 'fullName'>): string => {
    if (technician.fullName?.trim()) {
      return technician.fullName.trim();
    }
    
    const first = technician.firstName?.trim() || '';
    const last = technician.lastName?.trim() || '';
    
    if (!first && !last) return '';
    if (!first) return last;
    if (!last) return first;
    return `${first} ${last}`;
  },

  /**
   * Get short name for table display (e.g., "John Smith" -> "John S.")
   */
  getShortName: (technician: Technician): string => {
    const fullName = TechnicianUtils.getFullName(technician);
    if (!fullName.trim()) return 'Unknown';
    
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0];
    } else if (parts.length >= 2) {
      return `${parts[0]} ${parts[1].charAt(0)}.`;
    }
    return fullName;
  },

  /**
   * Check if technician is active
   */
  isActive: (technician: Technician): boolean => {
    return technician.status === TechnicianStatus.ACTIVE;
  },

  /**
   * Check if technician has a specific skill
   */
  hasSkill: (technician: Technician, serviceType: string): boolean => {
    if (!technician.skills || !serviceType?.trim()) {
      return false;
    }
    const trimmedServiceType = serviceType.trim();
    return technician.skills.some(skill => 
      skill?.trim().toLowerCase() === trimmedServiceType.toLowerCase()
    );
  },

  /**
   * Check if technician is available for a service type
   */
  isAvailableForServiceType: (technician: Technician, serviceType: string): boolean => {
    return TechnicianUtils.isActive(technician) && TechnicianUtils.hasSkill(technician, serviceType);
  },

  /**
   * Get workload level based on current workload
   */
  getWorkloadLevel: (technician: Technician): 'LOW' | 'MEDIUM' | 'HIGH' => {
    const workload = technician.currentWorkload || 0;
    if (workload < 3) return 'LOW';
    if (workload < 6) return 'MEDIUM';
    return 'HIGH';
  }
};