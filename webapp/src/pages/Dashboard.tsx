/**
 * Dashboard page component
 * Main landing page with system overview
 * Basic HTML implementation - TODO: Replace with ShadCN UI components
 */

import { 
  IconUsers, 
  IconTool, 
  IconTicket, 
  IconCalendarEvent,
  IconTrendingUp,
  IconAlertTriangle,
  IconRefresh
} from '@tabler/icons-react';
import { useTicketStatistics, useTechnicianStatistics } from '../hooks';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  description?: string;
  trend?: {
    value: number;
    positive: boolean;
  };
}

function StatCard({ title, value, icon, color, description, trend }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600'
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm uppercase font-bold tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold mt-1">
            {value}
          </p>
          {description && (
            <p className="text-gray-500 text-sm mt-1">
              {description}
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-md flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
          {icon}
        </div>
      </div>
      
      {trend && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500">
            vs last month
          </span>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            trend.positive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {trend.positive ? '+' : ''}{trend.value}%
          </span>
        </div>
      )}
    </div>
  );
}

export function DashboardPage() {
  const { 
    data: ticketStats, 
    isLoading: ticketStatsLoading, 
    error: ticketStatsError,
    refetch: refetchTicketStats
  } = useTicketStatistics();
  
  const { 
    data: techStats, 
    isLoading: techStatsLoading, 
    error: techStatsError,
    refetch: refetchTechStats
  } = useTechnicianStatistics();

  const isLoading = ticketStatsLoading || techStatsLoading;
  const hasError = ticketStatsError || techStatsError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <h3 className="text-lg font-medium text-red-800">Dashboard Error</h3>
        <p className="text-red-700 mt-1">
          {String(ticketStatsError || techStatsError || 'Failed to load dashboard data')}
        </p>
        <button
          onClick={() => {
            refetchTicketStats();
            refetchTechStats();
          }}
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 text-lg mt-1">
            System overview and key metrics
          </p>
        </div>
        <button
          onClick={() => {
            refetchTicketStats();
            refetchTechStats();
          }}
          className="p-2 rounded-md hover:bg-gray-100"
          title="Refresh data"
        >
          <IconRefresh size={20} />
        </button>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Clients"
          value="124" // TODO: Get from API
          icon={<IconUsers size={24} />}
          color="blue"
          description="Active users"
          trend={{ value: 12, positive: true }}
        />
        
        <StatCard
          title="Active Technicians"
          value={techStats?.activeTechnicians || 0}
          icon={<IconTool size={24} />}
          color="green"
          description="Available now"
        />
        
        <StatCard
          title="Open Tickets"
          value={ticketStats?.openTickets || 0}
          icon={<IconTicket size={24} />}
          color="orange"
          description="Pending resolution"
        />
        
        <StatCard
          title="Today's Appointments"
          value="8" // TODO: Get from API
          icon={<IconCalendarEvent size={24} />}
          color="purple"
          description="Scheduled"
        />
      </div>

      {/* Quick Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Ticket Status
            </h3>
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              {ticketStats?.totalTickets || 0} Total
            </span>
          </div>
          
          {ticketStats && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-700">Open Tickets</span>
                  <span className="text-sm font-medium">
                    {ticketStats.openTickets} ({Math.round((ticketStats.openTickets / ticketStats.totalTickets) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ width: `${(ticketStats.openTickets / ticketStats.totalTickets) * 100}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-700">Resolved Tickets</span>
                  <span className="text-sm font-medium">
                    {ticketStats.resolvedTickets} ({Math.round((ticketStats.resolvedTickets / ticketStats.totalTickets) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(ticketStats.resolvedTickets / ticketStats.totalTickets) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* System Health */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              System Health
            </h3>
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
              Healthy
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">Average Resolution Time</span>
              <span className="text-sm font-medium">
                {ticketStats?.averageResolutionTimeHours?.toFixed(1) || 0}h
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">Tickets Resolved Today</span>
              <span className="text-sm font-medium">
                {ticketStats?.ticketsResolvedToday || 0}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">Average Tickets per Technician</span>
              <span className="text-sm font-medium">
                {techStats?.averageTicketsPerTechnician?.toFixed(1) || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          Quick Actions
        </h3>
        <p className="text-gray-600">
          This section will contain quick action buttons for common tasks like creating tickets, 
          scheduling appointments, and viewing overdue items.
        </p>
      </div>

      {/* Note about ShadCN UI */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <p className="text-blue-800 text-sm">
          <strong>Note:</strong> This dashboard is using basic HTML/CSS components. 
          ShadCN UI integration is planned to replace these with professional components.
        </p>
      </div>
    </div>
  );
}

export default DashboardPage;