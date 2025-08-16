/**
 * Technician Detail Page - Advanced view with comprehensive technician information
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Badge as BadgeIcon,
  Calendar, 
  Clock, 
  TrendingUp, 
  Activity,
  Settings,
  Edit,
  AlertCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Avatar, AvatarFallback } from '@/components/ui/avatar';
// import { Separator } from '@/components/ui/separator';
// import { Progress } from '@/components/ui/progress';

import { 
  useTechnician, 
  useTechnicianWorkload,
  useTechnicianTickets,
  useTechnicianAppointments 
} from '@/hooks/useTechnicians';
import { TechnicianForm } from '@/components/forms/TechnicianForm';
import { TechnicianUtils } from '@/types/Technician';
import { TechnicianStatus } from '@/types';
import { TechnicianErrorBoundary } from '@/components/ErrorBoundary';
import { TicketUtils } from '@/types/Ticket';

export function TechnicianDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const technicianId = parseInt(id || '0', 10);
  
  // Fetch technician data
  const { data: technician, isLoading: technicianLoading, error: technicianError } = useTechnician(technicianId);
  const { data: workload, isLoading: statsLoading } = useTechnicianWorkload(technicianId);
  const { data: tickets, isLoading: ticketsLoading } = useTechnicianTickets(technicianId);
  const { data: appointments, isLoading: appointmentsLoading } = useTechnicianAppointments(technicianId);

  if (technicianLoading) {
    return <TechnicianDetailSkeleton />;
  }

  if (technicianError || !technician) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {technicianError?.message || 'Technician not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Convert workload level to percentage for display
  const getWorkloadPercentage = (level: string) => {
    switch (level) {
      case 'HIGH': return 85;
      case 'MEDIUM': return 55;
      case 'LOW': return 25;
      default: return 0;
    }
  };
  
  const workloadPercentage = workload ? getWorkloadPercentage(workload.currentLoad) : 0;
  const getWorkloadColor = (workload: number) => {
    if (workload >= 90) return 'text-red-600';
    if (workload >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusColor = (status: TechnicianStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'TERMINATED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <TechnicianErrorBoundary>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/technicians')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Technicians
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {TechnicianUtils.getFullName(technician)}
            </h1>
            <p className="text-muted-foreground">Technician Details</p>
          </div>
        </div>
        
        <Button onClick={() => setIsEditModalOpen(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Technician
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Technician Information Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-medium">
                  {TechnicianUtils.getInitials(technician)}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">
                    {TechnicianUtils.getFullName(technician)}
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={getStatusColor(technician.status)}>
                      {technician.status}
                    </Badge>
                    {TechnicianUtils.isAvailable(technician) && (
                      <Badge variant="outline" className="text-green-600">
                        Available
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{technician.email}</span>
                </div>
                {technician.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{technician.phone}</span>
                  </div>
                )}
              </div>
              
              <hr className="border-t border-gray-200" />
              
              {/* Skills */}
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <BadgeIcon className="h-4 w-4 mr-2" />
                  Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {technician.skills?.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                  {(!technician.skills || technician.skills.length === 0) && (
                    <span className="text-sm text-muted-foreground">No skills assigned</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Tickets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Current Tickets
              </CardTitle>
              <CardDescription>
                Active tickets assigned to this technician
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ticketsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : !tickets?.content || tickets.content.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active tickets assigned</p>
              ) : (
                <div className="space-y-3">
                  {tickets.content.slice(0, 5).map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">{TicketUtils.getDisplayTitle(ticket)}</p>
                        <p className="text-sm text-muted-foreground">{ticket.description}</p>
                      </div>
                      <Badge variant={ticket.status === 'OPEN' ? 'destructive' : 'secondary'}>
                        {ticket.status}
                      </Badge>
                    </div>
                  ))}
                  {tickets.content.length > 5 && (
                    <Button variant="outline" size="sm" className="w-full">
                      View All {tickets.content.length} Tickets
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Upcoming Appointments
              </CardTitle>
              <CardDescription>
                Scheduled appointments for this technician
              </CardDescription>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : !appointments?.content || appointments.content.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming appointments</p>
              ) : (
                <div className="space-y-3">
                  {appointments.content.slice(0, 3).map((appointment) => (
                    <div key={appointment.id} className="flex items-center space-x-3 py-2 border-b last:border-b-0">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{appointment.scheduledDateTime}</p>
                        <p className="text-sm text-muted-foreground">{appointment.description}</p>
                      </div>
                    </div>
                  ))}
                  {appointments.content.length > 3 && (
                    <Button variant="outline" size="sm" className="w-full">
                      View All {appointments.content.length} Appointments
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Statistics */}
        <div className="space-y-6">
          {/* Workload Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Current Workload
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Workload</span>
                    <span className={`text-sm font-medium ${getWorkloadColor(workloadPercentage)}`}>
                      {workloadPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        workloadPercentage >= 90 ? 'bg-red-600' : 
                        workloadPercentage >= 70 ? 'bg-yellow-600' : 'bg-green-600'
                      }`}
                      style={{ width: `${workloadPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {workloadPercentage >= 90 
                      ? 'High workload - consider redistributing tasks' 
                      : workloadPercentage >= 70 
                      ? 'Moderate workload' 
                      : 'Low workload - available for new assignments'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics Cards */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-18" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Assigned Tickets</span>
                    <span className="font-medium">{workload?.assignedTickets || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Completed Tickets</span>
                    <span className="font-medium text-green-600">{workload?.completedTickets || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Current Load</span>
                    <span className={`font-medium ${
                      workload?.currentLoad === 'HIGH' ? 'text-red-600' : 
                      workload?.currentLoad === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {workload?.currentLoad || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Resolution Time</span>
                    <span className="font-medium">
                      {workload?.averageResolutionTime ? `${workload.averageResolutionTime}h` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Available</span>
                    <span className={`font-medium ${workload?.available ? 'text-green-600' : 'text-red-600'}`}>
                      {workload?.available ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Activity className="h-4 w-4 mr-2" />
                Assign New Ticket
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Full Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Technician</DialogTitle>
            <DialogDescription>
              Update technician information and skills
            </DialogDescription>
          </DialogHeader>
          <TechnicianForm
            technician={technician}
            onSuccess={() => {
              setIsEditModalOpen(false);
              // Optionally refresh data here
            }}
            onCancel={() => setIsEditModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
      </div>
    </TechnicianErrorBoundary>
  );
}

// Loading skeleton component
function TechnicianDetailSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-9 w-32" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="flex-1">
                  <Skeleton className="h-6 w-48" />
                  <div className="flex space-x-2 mt-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-px w-full" />
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-14" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-3 w-full mt-2" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}