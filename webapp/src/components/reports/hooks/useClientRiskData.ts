import { useMemo } from 'react';
import { useClients } from '@/hooks/useClients';
import { useOverdueTickets, useUnassignedTickets } from '@/hooks/useTickets';
import type { Client } from '@/types';

export interface ClientRiskItem {
  clientName: string;
  clientId?: number;
  score: number;
  reasons: string[];
  trend7d?: Array<{ date: string; value: number }>; // mini trend datapoints
}

export function useClientRiskData() {
  const { data: clientsData } = useClients({ page: 0, size: 500 });
  const { data: overdueTickets } = useOverdueTickets({ page: 0, size: 500 }, true);
  const { data: unassignedTickets } = useUnassignedTickets({ page: 0, size: 500 }, true);

  return useMemo(() => {
    const nameToClient: Record<string, Client> = {};
    (clientsData?.content || []).forEach((c) => {
      const name = (c.fullName || `${c.firstName} ${c.lastName}`).trim();
      if (name) nameToClient[name] = c;
    });

    const items = (overdueTickets?.content || []) as Array<any>;
    const unassigned = (unassignedTickets?.content || []) as Array<any>;

    const riskMap = new Map<string, ClientRiskItem>();
    const trendBuckets: Record<string, Record<string, number>> = {};

    const addTrend = (client: string, iso: string) => {
      const day = new Date(iso).toISOString().split('T')[0];
      trendBuckets[client] = trendBuckets[client] || {};
      trendBuckets[client][day] = (trendBuckets[client][day] || 0) + 1;
    };

    const getClientName = (t: any): string => {
      return (
        t.clientName ||
        t.client?.fullName ||
        [t.client?.firstName, t.client?.lastName].filter(Boolean).join(' ') ||
        'Unknown Client'
      );
    };

    items.forEach((t) => {
      const client = getClientName(t);
      const dueAt = t.dueAt;
      const computedDaysPast = dueAt ? Math.max(0, Math.floor((Date.now() - new Date(dueAt).getTime()) / 86400000)) : 0;
      const days = typeof t.daysPastDue === 'number' ? t.daysPastDue : computedDaysPast;
      const hours = dueAt ? Math.max(1, Math.floor((Date.now() - new Date(dueAt).getTime()) / 36e5)) : 1;
      const base = 30 + Math.min(50, days * 5 + Math.floor(hours / 6));
      const existing = riskMap.get(client) || { clientName: client, clientId: nameToClient[client]?.id, score: 0, reasons: [] };
      existing.score += base;
      existing.reasons.push(`Overdue by ${days > 0 ? `${days}d` : `${hours}h`}`);
      riskMap.set(client, existing);
      if (dueAt) addTrend(client, dueAt);
    });

    unassigned.forEach((t) => {
      const prio = t.priority || t.priority?.name; // tolerate different shapes
      const client = getClientName(t);
      const existing = riskMap.get(client) || { clientName: client, clientId: nameToClient[client]?.id, score: 0, reasons: [] };
      // Base risk for all unassigned open tickets
      existing.score += 15;
      existing.reasons.push('Unassigned ticket');
      // Extra weight if urgent
      if (prio === 'URGENT') {
        existing.score += 10;
        existing.reasons.push('Urgent');
      }
      riskMap.set(client, existing);
      if (t.createdAt) addTrend(client, t.createdAt);
    });

    const clientRiskItems = Array.from(riskMap.values())
      .map((r) => ({
        ...r,
        score: Math.min(100, r.score),
        trend7d: build7dTrend(trendBuckets[r.clientName] || {})
      }))
      .sort((a, b) => b.score - a.score);

    // KPIs
    const kpis = {
      clientsAtRisk: clientRiskItems.length,
      openUrgentTickets: (unassigned.filter((t) => t.priority === 'URGENT').length) + 0,
      overdueTickets: items.length,
      repeatRate: computeRepeatRate(items)
    };

    // Matrix points
    const matrixVolume: Record<string, number> = {};
    const matrixSeverity: Record<string, number> = {};
    const matrixAge: Record<string, number> = {};
    items.forEach((t) => {
      const client = getClientName(t);
      matrixVolume[client] = (matrixVolume[client] || 0) + 1;
      const prio = t.priority || t.priority?.name;
      const computedDaysPast = t.dueAt ? Math.max(0, Math.floor((Date.now() - new Date(t.dueAt).getTime()) / 86400000)) : 0;
      const sev = (prio === 'URGENT' ? 40 : 20) + Math.min(40, ((t.daysPastDue || computedDaysPast)) * 3);
      matrixSeverity[client] = (matrixSeverity[client] || 0) + sev;
      const hours = t.dueAt ? Math.max(1, Math.floor((Date.now() - new Date(t.dueAt).getTime()) / 36e5)) : 1;
      matrixAge[client] = (matrixAge[client] || 0) + hours;
    });
    unassigned.forEach((t) => {
      const prio = t.priority || t.priority?.name;
      const client = getClientName(t);
      matrixVolume[client] = (matrixVolume[client] || 0) + 1;
      matrixSeverity[client] = (matrixSeverity[client] || 0) + (prio === 'URGENT' ? 25 : 15);
      matrixAge[client] = (matrixAge[client] || 0) + 6;
    });
    const matrixPoints = Object.keys(matrixVolume).map((client) => ({
      client,
      clientId: nameToClient[client]?.id,
      volume: matrixVolume[client] || 0,
      severity: Math.min(100, matrixSeverity[client] || 0),
      ageSum: matrixAge[client] || 1
    }));

    // Segment breakdown by client status as a proxy for segment
    const statusBuckets: Record<string, number> = {};
    clientRiskItems.forEach((r) => {
      const c = nameToClient[r.clientName];
      const key = c?.status || 'UNKNOWN';
      statusBuckets[key] = (statusBuckets[key] || 0) + r.score;
    });
    const segmentBreakdown = Object.entries(statusBuckets).map(([segment, score]) => ({ segment, score }));

    return {
      kpis,
      clientRiskItems,
      topClientsData: clientRiskItems.map((r) => ({ client: r.clientName, score: r.score })),
      matrixPoints,
      segmentBreakdown,
      resolveClient: (name: string) => nameToClient[name]
    };
  }, [clientsData, overdueTickets, unassignedTickets]);
}

function computeRepeatRate(items: Array<any>): number {
  const set = new Set<string>();
  const counts: Record<string, number> = {};
  items.forEach((t) => {
    const k = t.clientName || 'Unknown';
    set.add(k);
    counts[k] = (counts[k] || 0) + 1;
  });
  const repeatNumerator = Object.values(counts).filter((c) => c > 1).length;
  const base = set.size;
  return base > 0 ? Math.round((repeatNumerator / base) * 100) : 0;
}

function build7dTrend(dayCounts: Record<string, number>) {
  const result: Array<{ date: string; value: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    result.push({ date: key, value: dayCounts[key] || 0 });
  }
  return result;
}



