/**
 * Technician Workload report (initial scaffold)
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TechnicianWorkloadReport() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Technician Workload</h1>
        <p className="text-muted-foreground">Per-technician workload and distributions</p>
      </div>
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
        </CardHeader>
        <CardContent>
          This report will show active tickets, overdue counts, and distributions per technician.
        </CardContent>
      </Card>
    </div>
  );
}

export default TechnicianWorkloadReport;

