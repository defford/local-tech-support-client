/**
 * Technician Workload report
 * Fetch technicians and each workload, render sortable table with CSV export
 */

import { useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTechnicians } from '@/hooks/useTechnicians';
import { TechnicianService } from '@/services/technicians';
import { TECHNICIAN_QUERY_KEYS } from '@/hooks/useTechnicians';
import type { Technician } from '@/types';
import type { TechnicianWorkload } from '@/services/technicians';

type WorkloadRow = {
  technician: Technician;
  workload?: {
    assignedTickets: number;
    completedTickets: number;
    averageResolutionTime: number;
    currentLoad: 'LOW' | 'MEDIUM' | 'HIGH';
    skills: string[];
    available: boolean;
  };
};

function useTechnicianWorkloadsPage(page = 0, size = 20) {
  const { data, isLoading, error, refetch } = useTechnicians({ page, size });
  const techs = data?.content || [];

  // Use a single hook with dynamic query list to respect Rules of Hooks
  const workloadQueries = useQueries({
    queries: techs.map((t) => ({
      queryKey: TECHNICIAN_QUERY_KEYS.workload(t.id),
      queryFn: () => TechnicianService.getTechnicianWorkload(t.id),
      enabled: !!t.id
    }))
  });

  const rows: WorkloadRow[] = techs.map((t, idx) => {
    const q = workloadQueries[idx];
    return {
      technician: t,
      workload: q?.data as TechnicianWorkload | undefined
    };
  });

  const anyLoading = isLoading || workloadQueries.some((q) => q.isLoading);
  const anyError = error || workloadQueries.find((q) => q.error)?.error;

  return { rows, total: data?.totalElements || 0, anyLoading, anyError, refetchPage: refetch };
}

export function TechnicianWorkloadReport() {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;
  const { rows, total, anyLoading, anyError, refetchPage } = useTechnicianWorkloadsPage(currentPage, pageSize);
  const [sortKey, setSortKey] = useState<'name' | 'workload' | 'status'>('workload');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sortedRows = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      if (sortKey === 'name') {
        const an = (a.technician.fullName || `${a.technician.firstName} ${a.technician.lastName}`).toLowerCase();
        const bn = (b.technician.fullName || `${b.technician.firstName} ${b.technician.lastName}`).toLowerCase();
        return sortDir === 'asc' ? an.localeCompare(bn) : bn.localeCompare(an);
      }
      if (sortKey === 'status') {
        const as = a.technician.status || '';
        const bs = b.technician.status || '';
        return sortDir === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as);
      }
      const aw = a.workload?.assignedTickets ?? -1;
      const bw = b.workload?.assignedTickets ?? -1;
      return sortDir === 'asc' ? aw - bw : bw - aw;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const handleSort = (key: 'name' | 'workload' | 'status') => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const exportCsv = () => {
    const headers = ['ID', 'Name', 'Status', 'Assigned', 'Completed', 'Avg Resolution (h)', 'Current Load', 'Skills'];
    const rowsCsv = sortedRows.map((r) => [
      r.technician.id,
      `${r.technician.fullName || `${r.technician.firstName} ${r.technician.lastName}`}`,
      r.technician.status,
      r.workload?.assignedTickets ?? '',
      r.workload?.completedTickets ?? '',
      r.workload?.averageResolutionTime ?? '',
      r.workload?.currentLoad ?? '',
      (r.workload?.skills || r.technician.skills || []).join(' ')
    ].join(','));
    const csv = [headers.join(','), ...rowsCsv].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `technician_workload_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Technician Workload</h1>
          <p className="text-muted-foreground">Active tickets, overdue counts, and load levels</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv} size="sm">Export CSV</Button>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Technicians {total ? <span className="text-muted-foreground font-normal">(total {total})</span> : null}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {anyError ? (
            <div className="text-sm text-destructive">Failed to load. <button onClick={() => refetchPage()} className="underline">Try again</button></div>
          ) : anyLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/50 border-b border-border/50">
                    <TableHead className="font-semibold cursor-pointer" onClick={() => handleSort('name')}>Name</TableHead>
                    <TableHead className="font-semibold cursor-pointer" onClick={() => handleSort('status')}>Status</TableHead>
                    <TableHead className="font-semibold cursor-pointer" onClick={() => handleSort('workload')}>Assigned</TableHead>
                    <TableHead className="font-semibold">Completed</TableHead>
                    <TableHead className="font-semibold">Avg Resolution (h)</TableHead>
                    <TableHead className="font-semibold">Current Load</TableHead>
                    <TableHead className="font-semibold">Skills</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRows.map((r) => (
                    <TableRow key={r.technician.id} className="border-b border-border/30">
                      <TableCell className="font-medium">{r.technician.fullName || `${r.technician.firstName} ${r.technician.lastName}`}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.technician.status}</TableCell>
                      <TableCell className="text-sm">{r.workload?.assignedTickets ?? '—'}</TableCell>
                      <TableCell className="text-sm">{r.workload?.completedTickets ?? '—'}</TableCell>
                      <TableCell className="text-sm">{r.workload?.averageResolutionTime ?? '—'}</TableCell>
                      <TableCell className="text-sm">{r.workload?.currentLoad ?? '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{(r.workload?.skills || r.technician.skills || []).join(', ')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {total > pageSize && (
            <div className="mt-4 flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(0, p - 1))} disabled={currentPage === 0}>Previous</Button>
              <span className="text-sm text-muted-foreground">Page {currentPage + 1} of {Math.ceil(total / pageSize)}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => p + 1)} disabled={(currentPage + 1) >= Math.ceil(total / pageSize)}>Next</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default TechnicianWorkloadReport;

