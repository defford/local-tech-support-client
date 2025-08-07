/**
 * Reports hub page
 * Provides quick navigation to individual reports that mirror CLI commands
 */

import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function ReportsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground text-lg">
            Operational and analytics reports matching the CLI capabilities
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Available Technicians
              <Badge variant="outline">Assignments</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Browse technicians available by service type and status.
            </p>
            <Button asChild size="sm">
              <Link to="/reports/available-technicians">Open Report</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Overdue Tickets
              <Badge variant="destructive">SLA</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Tickets past their due date with priority and client info.
            </p>
            <Button asChild size="sm">
              <Link to="/reports/overdue-tickets">Open Report</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Technician Workload
              <Badge variant="secondary">Capacity</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Current workload and distributions per technician.
            </p>
            <Button asChild size="sm">
              <Link to="/reports/technician-workload">Open Report</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Technician Schedule (Weekly)
              <Badge variant="outline">Planning</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Weekly view of technician appointments and statuses.
            </p>
            <Button asChild size="sm">
              <Link to="/reports/technician-schedule">Open Report</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Client Tickets
              <Badge variant="outline">Accounts</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Tickets grouped by client with quick status insights.
            </p>
            <Button asChild size="sm">
              <Link to="/reports/client-tickets">Open Report</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Client Appointments
              <Badge variant="outline">Scheduling</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Appointments grouped by client with date filters.
            </p>
            <Button asChild size="sm">
              <Link to="/reports/client-appointments">Open Report</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ReportsPage;

