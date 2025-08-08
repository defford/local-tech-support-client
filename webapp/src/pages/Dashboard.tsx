/**
 * Dashboard page component
 * Main landing page with system overview using ShadCN UI components
 */

import { 
  IconUsers, 
  IconTool, 
  IconTicket, 
  IconCalendarEvent,
  IconRefresh
} from '@tabler/icons-react';
import { useTicketStatistics, useTechnicianStatistics, useClients } from '../hooks';
import { useAppointmentSearch } from '@/hooks/useAppointments';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm uppercase font-bold tracking-wider text-muted-foreground">
              {title}
            </CardTitle>
            <div className="text-2xl font-bold mt-1 text-foreground">
              {value}
            </div>
            {description && (
              <CardDescription className="mt-1">
                {description}
              </CardDescription>
            )}
          </div>
          <CardAction>
            <div className={`w-10 h-10 rounded-md flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
              {icon}
            </div>
          </CardAction>
        </div>
      </CardHeader>
      
      {trend && (
        <CardFooter className="pt-0">
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-muted-foreground">
              vs last month
            </span>
            <Badge variant={trend.positive ? "default" : "destructive"}>
              {trend.positive ? '+' : ''}{trend.value}%
            </Badge>
          </div>
        </CardFooter>
      )}
    </Card>  
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

  // Fetch a single page to obtain total number of clients
  const { data: clientsPage } = useClients({ page: 0, size: 1 });

  // Compute today's start/end in ISO for date filtering
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const { data: todaysAppointments } = useAppointmentSearch({
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString(),
    page: 0,
    size: 1
  });

  const isLoading = ticketStatsLoading || techStatsLoading;
  const hasError = ticketStatsError || techStatsError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Dashboard Error</CardTitle>
          <CardDescription className="text-destructive/80">
            {String(ticketStatsError || techStatsError || 'Failed to load dashboard data')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => {
              refetchTicketStats();
              refetchTechStats();
            }}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-lg mt-1">
            System overview and key metrics
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  refetchTicketStats();
                  refetchTechStats();
                }}
                aria-label="Refresh"
              >
                <IconRefresh size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Clients"
          value={clientsPage?.totalElements ?? 0}
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
          value={todaysAppointments?.totalElements ?? 0}
          icon={<IconCalendarEvent size={24} />}
          color="purple"
          description="Scheduled"
        />
      </div>

      {/* Quick Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Ticket Status</CardTitle>
              <Badge variant="secondary">
                {ticketStats?.totalTickets || 0} Total
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
          
          {ticketStats && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Open Tickets</span>
                  <span className="text-sm font-medium">
                    {ticketStats.openTickets} ({(() => {
                      const total = ticketStats.totalTickets || 0;
                      return total ? Math.round((ticketStats.openTickets / total) * 100) : 0;
                    })()}%)
                  </span>
                </div>
                {(() => {
                  const total = ticketStats.totalTickets || 0;
                  const percent = total ? Math.round((ticketStats.openTickets / total) * 100) : 0;
                  return <Progress value={percent} indicatorClassName="bg-orange-500" />
                })()}
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Resolved Tickets</span>
                  <span className="text-sm font-medium">
                    {ticketStats.resolvedTickets} ({(() => {
                      const total = ticketStats.totalTickets || 0;
                      return total ? Math.round((ticketStats.resolvedTickets / total) * 100) : 0;
                    })()}%)
                  </span>
                </div>
                {(() => {
                  const total = ticketStats.totalTickets || 0;
                  const percent = total ? Math.round((ticketStats.resolvedTickets / total) * 100) : 0;
                  return <Progress value={percent} indicatorClassName="bg-green-500" />
                })()}
              </div>
            </div>
          )}
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>System Health</CardTitle>
              <Badge variant="default" className="bg-green-100 text-green-800">
                Healthy
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Average Resolution Time</span>
              <span className="text-sm font-medium">
                {ticketStats?.averageResolutionTimeHours?.toFixed(1) || 0}h
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Tickets Resolved Today</span>
              <span className="text-sm font-medium">
                {ticketStats?.ticketsResolvedToday || 0}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Average Tickets per Technician</span>
              <span className="text-sm font-medium">
                {techStats?.averageTicketsPerTechnician?.toFixed(1) || 0}
              </span>
            </div>
          </div>
          </CardContent>
        </Card>
      </div>

      {/* Removed placeholder Quick Actions and migration note for a cleaner UI */}
    </div>
  );
}

export default DashboardPage;