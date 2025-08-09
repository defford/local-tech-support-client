/**
 * Reports hub page
 * Provides quick navigation to individual reports that mirror CLI commands
 */

import { Badge } from '@/components/ui/badge';
import { useClients } from '@/hooks/useClients';
import { useTechnicians } from '@/hooks/useTechnicians';
import { useAppointments } from '@/hooks/useAppointments';
import { useOverdueTickets, useTicketStatistics, useUnassignedTickets } from '@/hooks/useTickets';
import { ReportsFiltersProvider } from '@/components/reports/FiltersContext';
import { FiltersBar } from '@/components/reports/FiltersBar';
import { Kpi } from '@/components/reports/Kpi';
import { RiskList } from '@/components/reports/RiskList';
import TopClientsBar from '@/components/reports/clients/TopClientsBar';
import RiskMatrix from '@/components/reports/clients/RiskMatrix';
import SegmentBreakdown from '@/components/reports/clients/SegmentBreakdown';
import { useClientRiskData } from '@/components/reports/hooks/useClientRiskData';

export function ReportsPageBody() {
  // Lightweight data fetches for quick metrics and lists
  const { data: clientsData } = useClients({ page: 0, size: 200 });
  const { data: techniciansData } = useTechnicians({ page: 0, size: 200 });
  const { data: appointmentsData } = useAppointments({ page: 0, size: 200 });
  const { data: ticketStats } = useTicketStatistics();
  const { data: overdueTickets } = useOverdueTickets({ page: 0, size: 200 }, true);
  const { data: unassignedTickets } = useUnassignedTickets({ page: 0, size: 200 }, true);

  // client status stats are not directly shown in the redesigned page; compute only if needed later

  const technicianStats = techniciansData ? {
    total: techniciansData.totalElements,
    active: techniciansData.content.filter(t => t && t.status === 'ACTIVE').length,
    onVacation: techniciansData.content.filter(t => t && t.status === 'ON_VACATION').length,
    sickLeave: techniciansData.content.filter(t => t && t.status === 'SICK_LEAVE').length,
  } : null;

  const appointmentStats = appointmentsData ? {
    total: appointmentsData.content.length,
    pending: appointmentsData.content.filter(a => a && a.status === 'PENDING').length,
    confirmed: appointmentsData.content.filter(a => a && a.status === 'CONFIRMED').length,
    inProgress: appointmentsData.content.filter(a => a && a.status === 'IN_PROGRESS').length,
    completed: appointmentsData.content.filter(a => a && a.status === 'COMPLETED').length,
    overdue: appointmentsData.content.filter(a => a && new Date() > new Date(a.scheduledStartTime) && a.status === 'PENDING').length,
  } : {
    total: 0,
    pending: 0,
    confirmed: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0
  };

  const { kpis, clientRiskItems, topClientsData, matrixPoints, segmentBreakdown } = useClientRiskData();
  const clientsAtRisk = clientRiskItems;
  const overdueCount = kpis.overdueTickets;
  const openUrgentTickets = kpis.openUrgentTickets;
  const repeatRate = kpis.repeatRate;

  // Technician health approximations from overdue assignment and open tickets per active tech
  const overdueAssignedByTech = (overdueTickets?.content || []).reduce((acc: Record<string, number>, t: any) => {
    const tech = t.assignedTechnicianName || 'Unassigned';
    acc[tech] = (acc[tech] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const overdueAssignedCount = Object.entries(overdueAssignedByTech).filter(([tech]) => tech !== 'Unassigned').reduce((sum, [, c]) => sum + (c as number), 0);
  const activeTechs = techniciansData ? techniciansData.content.filter(t => t && t.status === 'ACTIVE').length : 0;
  const avgAssignedPerTech = activeTechs > 0 ? (ticketStats?.openTickets ?? 0) / activeTechs : 0;
  const highLoadTechs = Object.entries(overdueAssignedByTech).filter(([tech, c]) => tech !== 'Unassigned' && (c as number) >= 3);
  const techRiskItems = highLoadTechs.map(([tech, c]) => ({ id: tech, title: tech, score: Math.min(100, 50 + (c as number) * 10), reasons: [`${c} overdue assigned`] }));

  // Ticket risk list from overdue and unassigned urgent
  const ticketRiskItems = [
    ...(overdueTickets?.content || []).slice(0, 50).map((t: any) => ({
      id: t.ticketId,
      title: `#${t.ticketId} ${t.title}`,
      subtitle: `${t.clientName} • ${t.assignedTechnicianName || 'Unassigned'}`,
      score: Math.min(100, 60 + Math.min(40, (t.daysPastDue || 0) * 5)),
      reasons: ['Overdue']
    })),
    ...(unassignedTickets?.content || []).filter((t: any) => t.priority === 'URGENT').slice(0, 50).map((t: any) => ({
      id: t.id,
      title: `#${t.id} ${t.title}`,
      subtitle: `${t.clientName || 'Unknown'} • Unassigned`,
      score: 70,
      reasons: ['Urgent, unassigned']
    }))
  ].slice(0, 20);

  // Appointment risks
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const appointmentRiskItems = (appointmentsData?.content || [])
    .filter((a: any) => a && (a.status === 'PENDING' || a.status === 'CONFIRMED'))
    .map((a: any) => {
      const startMs = new Date(a.scheduledStartTime).getTime();
      const reasons: string[] = [];
      let score = 0;
      if (a.status === 'PENDING' && startMs < now) {
        reasons.push('Overdue start');
        score += 60;
      }
      if (a.status === 'PENDING' && startMs - now <= oneDayMs && startMs >= now) {
        reasons.push('Unconfirmed, starts <24h');
        score += 40;
      }
      return {
        id: a.id,
        title: `Appt #${a.id}`,
        subtitle: `${new Date(a.scheduledStartTime).toLocaleString()} • ${a.status}`,
        score: Math.min(100, score || 20),
        reasons
      };
    })
    .filter((i) => i.reasons.length > 0)
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          Reports
        </h1>
        <p className="text-muted-foreground text-lg">Clients in need, technician health, ticket story, and appointment flow</p>
      </div>
      <FiltersBar />

      {/* Section: Clients in Need */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Clients in Need</h2>
          <Badge variant="outline">Priority</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Kpi label="Clients at Risk" value={clientsAtRisk.length} accent="red" />
          <Kpi label="Unassigned Tickets" value={ticketStats?.unassignedTickets ?? (unassignedTickets?.totalElements ?? 0)} accent="yellow" />
          <Kpi label="Overdue Tickets" value={ticketStats?.overdueTickets ?? overdueCount} accent="red" />
          <Kpi label="Repeat Ticket Rate" value={`${repeatRate}%`} accent="yellow" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-md border border-border/50 p-3">
            <div className="text-sm font-medium mb-2">Top Clients by Need</div>
            <TopClientsBar data={topClientsData} />
          </div>
          <div className="rounded-md border border-border/50 p-3">
            <div className="text-sm font-medium mb-2">Risk Matrix</div>
            <RiskMatrix data={matrixPoints} />
          </div>
        </div>
        <div className="rounded-md border border-border/50 p-3">
          <div className="text-sm font-medium mb-2">Segment Breakdown</div>
          <SegmentBreakdown data={segmentBreakdown} />
        </div>
        <RiskList title="Top Clients to Help Now" items={clientRiskItems.slice(0, 8).map((r) => ({ id: r.clientName, title: r.clientName, score: r.score, reasons: r.reasons }))} />
      </div>

      {/* Section: Technician Health */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Technician Health</h2>
          <Badge variant="secondary">Capacity</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Kpi label="Active Technicians" value={technicianStats?.active ?? 0} accent="emerald" />
          <Kpi label="High Load Techs" value={highLoadTechs.length} accent="orange" />
          <Kpi label="Overdue Assigned" value={overdueAssignedCount} accent="red" />
          <Kpi label="Avg Assigned/Tec" value={avgAssignedPerTech.toFixed(1)} accent="blue" />
        </div>
        <RiskList title="Technicians at Risk" items={techRiskItems.slice(0, 8)} />
      </div>

      {/* Section: Ticket Story */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Ticket Story</h2>
          <Badge variant="outline">Flow</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Kpi label="Total Tickets" value={ticketStats?.totalTickets ?? 0} accent="blue" />
          <Kpi label="Open" value={ticketStats?.openTickets ?? 0} accent="green" />
          <Kpi label="Unassigned" value={ticketStats?.unassignedTickets ?? (unassignedTickets?.totalElements ?? 0)} accent="yellow" />
          <Kpi label="Overdue" value={ticketStats?.overdueTickets ?? overdueCount} accent="red" />
        </div>
        <RiskList title="Stuck or At-Risk Tickets" items={ticketRiskItems.slice(0, 10)} />
      </div>

      {/* Section: Appointment Flow */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Appointment Flow</h2>
          <Badge variant="outline">Scheduling</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Kpi label="Total" value={appointmentStats.total} accent="blue" />
          <Kpi label="Pending" value={appointmentStats.pending} accent="yellow" />
          <Kpi label="Confirmed" value={appointmentStats.confirmed} accent="green" />
          <Kpi label="In Progress" value={appointmentStats.inProgress} accent="orange" />
          <Kpi label="Completed" value={appointmentStats.completed} accent="emerald" />
          <Kpi label="Overdue" value={appointmentStats.overdue} accent="red" />
        </div>
        <RiskList title="Appointments Requiring Action" items={appointmentRiskItems.slice(0, 10)} />
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <ReportsFiltersProvider>
      <ReportsPageBody />
    </ReportsFiltersProvider>
  );
}

