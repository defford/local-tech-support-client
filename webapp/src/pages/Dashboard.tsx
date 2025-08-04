/**
 * Dashboard page component
 * Main landing page with system overview
 */

import { 
  Title, 
  Text, 
  SimpleGrid, 
  Card, 
  Group,
  ThemeIcon,
  Stack,
  Progress,
  Badge,
  ActionIcon
} from '@mantine/core';
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
import { LoadingSpinner, ErrorAlert } from '../components/ui';

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
  return (
    <Card withBorder padding="lg" radius="md">
      <Group justify="apart">
        <div>
          <Text c="dimmed" size="sm" tt="uppercase" fw={700}>
            {title}
          </Text>
          <Text fw={700} size="xl">
            {value}
          </Text>
          {description && (
            <Text c="dimmed" size="sm">
              {description}
            </Text>
          )}
        </div>
        <ThemeIcon color={color} size={38} radius="md" variant="light">
          {icon}
        </ThemeIcon>
      </Group>
      
      {trend && (
        <Group justify="apart" mt="md">
          <Text size="sm" c="dimmed">
            vs last month
          </Text>
          <Badge 
            color={trend.positive ? 'green' : 'red'} 
            variant="light"
            size="sm"
          >
            {trend.positive ? '+' : ''}{trend.value}%
          </Badge>
        </Group>
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

  const isLoading = ticketStatsLoading || techStatsLoading;
  const hasError = ticketStatsError || techStatsError;

  if (isLoading) {
    return <LoadingSpinner message="Loading dashboard..." centered />;
  }

  if (hasError) {
    return (
      <ErrorAlert
        error={ticketStatsError || techStatsError || 'Failed to load dashboard data'}
        title="Dashboard Error"
        showRetry
        onRetry={() => {
          refetchTicketStats();
          refetchTechStats();
        }}
      />
    );
  }

  return (
    <Stack gap="xl">
      {/* Page Header */}
      <Group justify="space-between">
        <div>
          <Title order={1}>Dashboard</Title>
          <Text c="dimmed" size="lg">
            System overview and key metrics
          </Text>
        </div>
        <ActionIcon
          variant="light"
          size="lg"
          onClick={() => {
            refetchTicketStats();
            refetchTechStats();
          }}
          title="Refresh data"
        >
          <IconRefresh size="1.2rem" />
        </ActionIcon>
      </Group>

      {/* Key Statistics */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
        <StatCard
          title="Total Clients"
          value="124" // TODO: Get from API
          icon={<IconUsers size="1.5rem" />}
          color="blue"
          description="Active users"
          trend={{ value: 12, positive: true }}
        />
        
        <StatCard
          title="Active Technicians"
          value={techStats?.activeTechnicians || 0}
          icon={<IconTool size="1.5rem" />}
          color="green"
          description="Available now"
        />
        
        <StatCard
          title="Open Tickets"
          value={ticketStats?.openTickets || 0}
          icon={<IconTicket size="1.5rem" />}
          color="orange"
          description="Pending resolution"
        />
        
        <StatCard
          title="Today's Appointments"
          value="8" // TODO: Get from API
          icon={<IconCalendarEvent size="1.5rem" />}
          color="purple"
          description="Scheduled"
        />
      </SimpleGrid>

      {/* Quick Status Overview */}
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        {/* Ticket Status */}
        <Card withBorder padding="lg" radius="md">
          <Group justify="space-between" mb="md">
            <Text size="lg" fw={600}>
              Ticket Status
            </Text>
            <Badge variant="light" color="blue">
              {ticketStats?.totalTickets || 0} Total
            </Badge>
          </Group>
          
          {ticketStats && (
            <Stack gap="sm">
              <div>
                <Group justify="space-between" mb={5}>
                  <Text size="sm">Open Tickets</Text>
                  <Text size="sm" fw={500}>
                    {ticketStats.openTickets} ({Math.round((ticketStats.openTickets / ticketStats.totalTickets) * 100)}%)
                  </Text>
                </Group>
                <Progress 
                  value={(ticketStats.openTickets / ticketStats.totalTickets) * 100} 
                  color="orange"
                  size="sm"
                />
              </div>
              
              <div>
                <Group justify="space-between" mb={5}>
                  <Text size="sm">Resolved Tickets</Text>
                  <Text size="sm" fw={500}>
                    {ticketStats.resolvedTickets} ({Math.round((ticketStats.resolvedTickets / ticketStats.totalTickets) * 100)}%)
                  </Text>
                </Group>
                <Progress 
                  value={(ticketStats.resolvedTickets / ticketStats.totalTickets) * 100} 
                  color="green"
                  size="sm"
                />
              </div>
            </Stack>
          )}
        </Card>

        {/* System Health */}
        <Card withBorder padding="lg" radius="md">
          <Group justify="space-between" mb="md">
            <Text size="lg" fw={600}>
              System Health
            </Text>
            <Badge variant="light" color="green">
              Healthy
            </Badge>
          </Group>
          
          <Stack gap="sm">
            <Group justify="apart">
              <Text size="sm">Average Resolution Time</Text>
              <Text size="sm" fw={500}>
                {ticketStats?.averageResolutionTimeHours?.toFixed(1) || 0}h
              </Text>
            </Group>
            
            <Group justify="apart">
              <Text size="sm">Tickets Resolved Today</Text>
              <Text size="sm" fw={500}>
                {ticketStats?.ticketsResolvedToday || 0}
              </Text>
            </Group>
            
            <Group justify="apart">
              <Text size="sm">Average Tickets per Technician</Text>
              <Text size="sm" fw={500}>
                {techStats?.averageTicketsPerTechnician?.toFixed(1) || 0}
              </Text>
            </Group>
          </Stack>
        </Card>
      </SimpleGrid>

      {/* Quick Actions */}
      <Card withBorder padding="lg" radius="md">
        <Text size="lg" fw={600} mb="md">
          Quick Actions
        </Text>
        <Text c="dimmed">
          This section will contain quick action buttons for common tasks like creating tickets, 
          scheduling appointments, and viewing overdue items.
        </Text>
      </Card>
    </Stack>
  );
}

export default DashboardPage;