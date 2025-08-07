/**
 * Available Technicians report
 * Mirrors CLI available-technicians functionality with service type filter
 */

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAvailableTechnicians } from '@/hooks/useTechnicians';
import { ServiceType, Technician } from '@/types';

export function AvailableTechniciansReport() {
  const [serviceType, setServiceType] = useState<ServiceType | 'ALL'>('ALL');
  const { data, isLoading, error, refetch } = useAvailableTechnicians(
    serviceType === 'ALL' ? undefined : serviceType,
    true
  );

  const technicians: Technician[] = (data as unknown as Technician[]) || [];

  const skillsSummary = (() => {
    const counts: Record<string, number> = {};
    if (!technicians) return counts;
    technicians.forEach(t => {
      (t.skills || []).forEach(s => {
        counts[s] = (counts[s] || 0) + 1;
      });
    });
    return counts;
  })();

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Available Technicians</h1>
          <p className="text-muted-foreground">Filter by service type to find specialists</p>
        </div>
        <div className="min-w-[180px]">
          <Select value={serviceType} onValueChange={(v) => setServiceType(v as typeof serviceType)}>
            <SelectTrigger className="bg-background/50 border-border/50">
              <SelectValue placeholder="All Service Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Service Types</SelectItem>
              {Object.values(ServiceType).map(st => (
                <SelectItem key={st} value={st}>{st}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Results {technicians ? <span className="text-muted-foreground font-normal">({technicians.length})</span> : null}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-sm text-destructive">Failed to load: {(error as any).message} <button onClick={() => refetch()} className="underline">Try again</button></div>
          ) : isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ))}
            </div>
          ) : technicians && technicians.length > 0 ? (
            <div className="rounded-md border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/50 border-b border-border/50">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Skills</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {technicians.map(t => (
                    <TableRow key={t.id} className="border-b border-border/30">
                      <TableCell className="font-medium">{t.fullName || `${t.firstName} ${t.lastName}`}</TableCell>
                      <TableCell>
                        <Badge variant={t.status === 'ACTIVE' ? 'default' : 'secondary'}>{t.status.replace('_',' ')}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{t.email || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(t.skills || []).slice(0, 3).map((s, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                          ))}
                          {t.skills && t.skills.length > 3 && (
                            <Badge variant="secondary" className="text-xs">+{t.skills.length - 3} more</Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No technicians found.</div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Skill Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(skillsSummary).length === 0 ? (
            <div className="text-sm text-muted-foreground">No skills to summarize.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {Object.entries(skillsSummary).sort((a,b) => b[1]-a[1]).map(([skill, count]) => (
                <Badge key={skill} variant="outline" className="text-xs">{skill}: {count}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AvailableTechniciansReport;

