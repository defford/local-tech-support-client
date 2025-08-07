/**
 * Comprehensive appointment reports and analytics component
 * Matches the CLI reports functionality with enhanced web visualizations
 */

import { useState, useMemo } from 'react';
import { Calendar, TrendingUp, Users, Clock, Target, BarChart3, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppointments, useUpcomingAppointments } from '@/hooks/useAppointments';
import { useTechnicians } from '@/hooks/useTechnicians';
import { AppointmentStatus } from '@/types';
import { AppointmentUtils } from '@/types/Appointment';
import { TechnicianUtils } from '@/types/Technician';

interface AppointmentReportData {
  totalCount: number;
  statusBreakdown: Record<string, number>;
  upcomingCount: number;
  pastCount: number;
  technicianWorkload: Record<number, { name: string; count: number; percentage: number }>;
  completionRate: number;
  avgDurationMinutes: number;
  busyHours: Record<string, number>;
  nextWeekStats: {
    scheduled: number;
    confirmed: number;
    pending: number;
  };
}

export function AppointmentReports() {
  const [timeRange, setTimeRange] = useState<'7_days' | '30_days' | '90_days' | 'all_time'>('30_days');
  
  // Data queries
  const { data: appointmentsData, isLoading, error } = useAppointments({ page: 0, size: 1000 });
  const { data: upcomingData } = useUpcomingAppointments({ page: 0, size: 100 });
  const { data: techniciansData } = useTechnicians();

  // Calculate comprehensive report data
  const reportData: AppointmentReportData | null = useMemo(() => {
    if (!appointmentsData?.content) return null;

    const appointments = appointmentsData.content;
    const now = new Date();
    
    // Filter by time range
    const cutoffDate = new Date();
    switch (timeRange) {
      case '7_days':
        cutoffDate.setDate(cutoffDate.getDate() - 7);
        break;
      case '30_days':
        cutoffDate.setDate(cutoffDate.getDate() - 30);
        break;
      case '90_days':
        cutoffDate.setDate(cutoffDate.getDate() - 90);
        break;
      case 'all_time':
        cutoffDate.setFullYear(2000); // Very old date to include all
        break;
    }

    const filteredAppointments = appointments.filter(apt => 
      apt && new Date(apt.createdAt) >= cutoffDate
    );

    // Basic counts
    const totalCount = filteredAppointments.length;
    const upcomingCount = filteredAppointments.filter(apt => 
      AppointmentUtils.isUpcoming(apt)
    ).length;
    const pastCount = totalCount - upcomingCount;

    // Status breakdown
    const statusBreakdown: Record<string, number> = {};
    Object.values(AppointmentStatus).forEach(status => {
      statusBreakdown[status] = filteredAppointments.filter(apt => 
        apt.status === status
      ).length;
    });

    // Technician workload
    const technicianWorkload: Record<number, { name: string; count: number; percentage: number }> = {};
    const technicians = techniciansData?.content || [];
    
    filteredAppointments.forEach(apt => {
      if (apt.technicianId) {
        if (!technicianWorkload[apt.technicianId]) {
          const tech = technicians.find(t => t.id === apt.technicianId);
          technicianWorkload[apt.technicianId] = {
            name: tech ? TechnicianUtils.getFullName(tech) : `Technician ${apt.technicianId}`,
            count: 0,
            percentage: 0
          };
        }
        technicianWorkload[apt.technicianId].count++;
      }
    });

    // Calculate percentages for technician workload
    Object.keys(technicianWorkload).forEach(techId => {
      technicianWorkload[parseInt(techId)].percentage = 
        (technicianWorkload[parseInt(techId)].count / totalCount) * 100;
    });

    // Completion rate
    const completedCount = statusBreakdown[AppointmentStatus.COMPLETED] || 0;
    const totalPastAppointments = filteredAppointments.filter(apt => 
      new Date(apt.scheduledStartTime) < now
    ).length;
    const completionRate = totalPastAppointments > 0 ? 
      (completedCount / totalPastAppointments) * 100 : 0;

    // Average duration
    const appointmentsWithDuration = filteredAppointments.filter(apt => 
      apt.scheduledStartTime && apt.scheduledEndTime
    );
    const totalDurationMinutes = appointmentsWithDuration.reduce((sum, apt) => 
      sum + AppointmentUtils.getDuration(apt), 0
    );
    const avgDurationMinutes = appointmentsWithDuration.length > 0 ? 
      totalDurationMinutes / appointmentsWithDuration.length : 0;

    // Busy hours analysis
    const busyHours: Record<string, number> = {};
    filteredAppointments.forEach(apt => {
      if (apt.scheduledStartTime) {
        const hour = new Date(apt.scheduledStartTime).getHours();
        const hourKey = `${hour}:00`;
        busyHours[hourKey] = (busyHours[hourKey] || 0) + 1;
      }
    });

    // Next week stats
    const nextWeekAppointments = upcomingData?.content?.filter(apt => {
      const appointmentDate = new Date(apt.scheduledStartTime);
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
      return appointmentDate <= oneWeekFromNow;
    }) || [];

    const nextWeekStats = {
      scheduled: nextWeekAppointments.length,
      confirmed: nextWeekAppointments.filter(apt => apt.status === AppointmentStatus.CONFIRMED).length,
      pending: nextWeekAppointments.filter(apt => apt.status === AppointmentStatus.PENDING).length,
    };

    return {
      totalCount,
      statusBreakdown,
      upcomingCount,
      pastCount,
      technicianWorkload,
      completionRate,
      avgDurationMinutes,
      busyHours,
      nextWeekStats,
    };
  }, [appointmentsData, upcomingData, techniciansData, timeRange]);

  const exportToCSV = () => {
    if (!reportData || !appointmentsData?.content) return;

    const appointments = appointmentsData.content;
    const headers = [
      'ID', 'Status', 'Technician', 'Client', 'Start Time', 'End Time', 
      'Duration (min)', 'Created At', 'Notes'
    ];
    
    const csvContent = [
      headers.join(','),
      ...appointments.map(apt => [
        apt.id,
        apt.status,
        apt.technician ? TechnicianUtils.getFullName(apt.technician) : `ID: ${apt.technicianId}`,
        apt.ticket?.clientName || 'N/A',
        apt.scheduledStartTime,
        apt.scheduledEndTime,
        AppointmentUtils.getDuration(apt),
        apt.createdAt,
        apt.notes ? `"${apt.notes.replace(/"/g, '""')}"` : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `appointment_reports_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load appointment data for reports: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading || !reportData) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Appointment Reports & Analytics</h2>
          <p className="text-muted-foreground">Comprehensive insights and performance metrics</p>
        </div>
        
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as typeof timeRange)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7_days">Last 7 Days</SelectItem>
              <SelectItem value="30_days">Last 30 Days</SelectItem>
              <SelectItem value="90_days">Last 90 Days</SelectItem>
              <SelectItem value="all_time">All Time</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-background dark:from-blue-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Total Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{reportData.totalCount}</span>
              <Calendar className="h-6 w-6 text-blue-500" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {reportData.upcomingCount} upcoming • {reportData.pastCount} past
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50/50 to-background dark:from-green-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{Math.round(reportData.completionRate)}%</span>
              <Target className="h-6 w-6 text-green-500" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {reportData.statusBreakdown[AppointmentStatus.COMPLETED] || 0} completed
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50/50 to-background dark:from-orange-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600 dark:text-orange-400">
              Avg Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{Math.round(reportData.avgDurationMinutes)}</span>
              <Clock className="h-6 w-6 text-orange-500" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              minutes per appointment
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50/50 to-background dark:from-purple-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-400">
              Active Technicians
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{Object.keys(reportData.technicianWorkload).length}</span>
              <Users className="h-6 w-6 text-purple-500" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              with scheduled work
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Status Breakdown
            </CardTitle>
            <CardDescription>Distribution of appointment statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(reportData.statusBreakdown).map(([status, count]) => {
                const percentage = reportData.totalCount > 0 ? (count / reportData.totalCount) * 100 : 0;
                const getStatusColor = (status: string) => {
                  switch (status) {
                    case AppointmentStatus.COMPLETED: return 'bg-green-500';
                    case AppointmentStatus.IN_PROGRESS: return 'bg-blue-500';
                    case AppointmentStatus.CONFIRMED: return 'bg-emerald-500';
                    case AppointmentStatus.PENDING: return 'bg-yellow-500';
                    case AppointmentStatus.CANCELLED: return 'bg-red-500';
                    case AppointmentStatus.NO_SHOW: return 'bg-gray-500';
                    default: return 'bg-gray-400';
                  }
                };
                
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{status.replace('_', ' ')}</span>
                      <span>{count} ({Math.round(percentage)}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full">
                      <div 
                        className={`h-2 rounded-full ${getStatusColor(status)}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Technician Workload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Technician Workload
            </CardTitle>
            <CardDescription>Appointments per technician</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(reportData.technicianWorkload)
                .sort(([,a], [,b]) => b.count - a.count)
                .slice(0, 8)
                .map(([techId, data]) => (
                  <div key={techId} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium truncate">{data.name}</span>
                      <span>{data.count} ({Math.round(data.percentage)}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full">
                      <div 
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${data.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next 7 Days Outlook */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Next 7 Days Outlook
          </CardTitle>
          <CardDescription>Upcoming appointment schedule and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{reportData.nextWeekStats.scheduled}</div>
              <div className="text-sm text-muted-foreground">Total Scheduled</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{reportData.nextWeekStats.confirmed}</div>
              <div className="text-sm text-muted-foreground">Confirmed</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{reportData.nextWeekStats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending Confirmation</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Peak Hours Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Peak Hours Analysis
          </CardTitle>
          <CardDescription>Busiest appointment times</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Object.entries(reportData.busyHours)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 12)
              .map(([hour, count]) => (
                <div key={hour} className="text-center p-3 border rounded-lg">
                  <div className="font-semibold">{hour}</div>
                  <div className="text-sm text-muted-foreground">{count} apt{count !== 1 ? 's' : ''}</div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AppointmentReports;