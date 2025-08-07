/**
 * Overdue Tickets report
 * Uses server endpoint to avoid client-side approximation
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useOverdueTickets } from '@/hooks/useTickets';
import { OverdueTicketInfo } from '@/services/tickets';

function formatOverdueBy(dueIso: string) {
  const due = new Date(dueIso);
  const diffMs = Date.now() - due.getTime();
  const hours = Math.max(1, Math.floor(diffMs / 36e5));
  const days = Math.floor(hours / 24);
  return days > 0 ? `${days}d ${hours % 24}h` : `${hours}h`;
}

export function OverdueTicketsReport() {
  const { data, isLoading, error, refetch } = useOverdueTickets({ page: 0, size: 200 }, true);
  const items = (data?.content || []) as unknown as OverdueTicketInfo[];

  const serviceBreakdown = items.reduce<Record<string, number>>((acc, t) => {
    acc[t.title ? t.title : 'UNKNOWN'] = acc[t.title ? t.title : 'UNKNOWN'] || 0; // placeholder not used in UI
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Overdue Tickets</h1>
        <p className="text-muted-foreground">Tickets past their due date from the server endpoint</p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Results {data ? <span className="text-muted-foreground font-normal">({items.length})</span> : null}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-sm text-destructive">Failed to load: {(error as any).message} <button onClick={() => refetch()} className="underline">Try again</button></div>
          ) : isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          ) : items.length > 0 ? (
            <div className="rounded-md border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/50 border-b border-border/50">
                    <TableHead className="font-semibold">ID</TableHead>
                    <TableHead className="font-semibold">Title</TableHead>
                    <TableHead className="font-semibold">Client</TableHead>
                    <TableHead className="font-semibold">Assigned</TableHead>
                    <TableHead className="font-semibold">Priority</TableHead>
                    <TableHead className="font-semibold">Due</TableHead>
                    <TableHead className="font-semibold">Overdue By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(t => (
                    <TableRow key={t.ticketId} className="border-b border-border/30">
                      <TableCell className="font-mono text-sm text-muted-foreground">#{t.ticketId}</TableCell>
                      <TableCell className="font-medium">{t.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{t.clientName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{t.assignedTechnicianName || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={t.priority === 'URGENT' ? 'destructive' : 'secondary'}>{t.priority}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(t.dueAt).toLocaleString()}</TableCell>
                      <TableCell className="text-red-600 font-medium">{formatOverdueBy(t.dueAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No overdue tickets 🎉</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default OverdueTicketsReport;

