/**
 * Statistics types for the Tech Support System
 * Converted from Java statistics models
 */

/**
 * Ticket statistics from the API
 * Response from GET /api/tickets/statistics
 */
export interface TicketStatistics {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  averageResolutionTimeHours: number;
  ticketsResolvedToday: number;
  ticketsByPriority: Record<string, number>;
  ticketsByStatus: Record<string, number>;
  ticketsByServiceType: Record<string, number>;
}

/**
 * Technician statistics from the API
 */
export interface TechnicianStatistics {
  totalTechnicians: number;
  activeTechnicians: number;
  totalAssignedTickets: number;
  averageTicketsPerTechnician: number;
  techniciansByStatus: Record<string, number>;
  skillCoverage: SkillCoverage;
}

/**
 * Skill coverage information
 */
export interface SkillCoverage {
  skillsInfo: SkillInfo[];
  totalSkills: number;
  averageSkillsPerTechnician: number;
}

/**
 * Individual skill information
 */
export interface SkillInfo {
  skill: string;
  technicianCount: number;
  coverage: number; // Percentage
}

/**
 * Feedback statistics from the API
 */
export interface FeedbackStatistics {
  totalFeedback: number;
  averageRating: number;
  ratingDistribution: Record<string, number>;
  recentFeedback: FeedbackSummary[];
}

/**
 * Feedback summary item
 */
export interface FeedbackSummary {
  id: number;
  rating: number;
  comment?: string;
  ticketId: number;
  clientName: string;
  technicianName: string;
  createdAt: string;
}

/**
 * System overview statistics
 */
export interface SystemStatistics {
  tickets: TicketStatistics;
  technicians: TechnicianStatistics;
  feedback: FeedbackStatistics;
  systemHealth: SystemHealth;
}

/**
 * System health metrics
 */
export interface SystemHealth {
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  uptime: number; // In seconds
  activeConnections: number;
  memoryUsage: number; // Percentage
  cpuUsage: number; // Percentage
  lastUpdated: string; // ISO date string
}

/**
 * Utility functions for Statistics operations
 */
export const StatisticsUtils = {
  /**
   * Calculate system load level based on open vs total tickets
   */
  getSystemLoadLevel: (stats: TicketStatistics): 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' => {
    if (stats.totalTickets === 0) {
      return 'NONE';
    }
    
    const loadRatio = stats.openTickets / stats.totalTickets;
    
    if (loadRatio < 0.3) return 'LOW';
    if (loadRatio < 0.6) return 'MEDIUM';
    return 'HIGH';
  },

  /**
   * Get percentage of tickets that are open
   */
  getOpenTicketPercentage: (stats: TicketStatistics): number => {
    if (stats.totalTickets === 0) return 0;
    return (stats.openTickets / stats.totalTickets) * 100;
  },

  /**
   * Get percentage of tickets that are resolved
   */
  getResolvedTicketPercentage: (stats: TicketStatistics): number => {
    if (stats.totalTickets === 0) return 0;
    return (stats.resolvedTickets / stats.totalTickets) * 100;
  },

  /**
   * Get system health color for UI
   */
  getSystemHealthColor: (health: SystemHealth): string => {
    switch (health.status) {
      case 'HEALTHY':
        return 'green';
      case 'WARNING':
        return 'yellow';
      case 'CRITICAL':
        return 'red';
      default:
        return 'gray';
    }
  },

  /**
   * Format uptime in human readable format
   */
  formatUptime: (uptimeSeconds: number): string => {
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  },

  /**
   * Get workload distribution for technicians
   */
  getWorkloadDistribution: (stats: TechnicianStatistics): { low: number; medium: number; high: number } => {
    const avgTickets = stats.averageTicketsPerTechnician;
    
    return {
      low: Math.round(avgTickets * 0.3),
      medium: Math.round(avgTickets * 0.6),
      high: Math.round(avgTickets * 1.0)
    };
  }
};