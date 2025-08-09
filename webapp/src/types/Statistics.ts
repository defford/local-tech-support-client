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
  closedTickets: number;
  overdueTickets?: number;
  unassignedTickets?: number;
  assignmentRate?: number;
  closureRate?: number;
  overdueRate?: number;
  // optional legacy fields
  inProgressTickets?: number;
  resolvedTickets?: number;
  averageResolutionTimeHours?: number;
  ticketsResolvedToday?: number;
  ticketsByPriority?: Record<string, number>;
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
 * Response from GET /api/feedback/statistics
 */
export interface FeedbackStatistics {
  totalFeedback: number;
  averageRating: number;
  ratingDistribution: Record<number, number>; // Rating (1-5) to count
  satisfactionLevel: string;
  feedbackTrends: Record<string, number>;
  highRatingsCount: number;
  lowRatingsCount: number;
  improvementScore: number;
  responseRate: number;
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
  },

  /**
   * Get percentage of high ratings (4-5 stars) from feedback statistics
   */
  getHighSatisfactionPercentage: (stats: FeedbackStatistics): number => {
    if (stats.totalFeedback === 0) return 0;
    return (stats.highRatingsCount / stats.totalFeedback) * 100;
  },

  /**
   * Get percentage of low ratings (1-2 stars) from feedback statistics
   */
  getLowSatisfactionPercentage: (stats: FeedbackStatistics): number => {
    if (stats.totalFeedback === 0) return 0;
    return (stats.lowRatingsCount / stats.totalFeedback) * 100;
  },

  /**
   * Get satisfaction level emoji based on average rating
   */
  getSatisfactionEmoji: (averageRating: number): string => {
    if (averageRating >= 4.5) return '😊';
    if (averageRating >= 4.0) return '🙂';
    if (averageRating >= 3.0) return '😐';
    if (averageRating >= 2.0) return '😞';
    return '😠';
  },

  /**
   * Get detailed satisfaction level description
   */
  getDetailedSatisfactionLevel: (averageRating: number): string => {
    if (averageRating >= 4.5) return 'EXCELLENT';
    if (averageRating >= 4.0) return 'VERY_GOOD';
    if (averageRating >= 3.5) return 'GOOD';
    if (averageRating >= 3.0) return 'AVERAGE';
    if (averageRating >= 2.0) return 'POOR';
    return 'VERY_POOR';
  }
};