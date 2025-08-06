/**
 * Appointment detail page with complete status workflow management
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, User, Ticket as TicketIcon, ArrowLeft, Edit, 
  CheckCircle, Play, CheckCheck, X, XCircle, AlertTriangle,
  MapPin, Phone, Mail, FileText, History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  useAppointment,
  useConfirmAppointment,
  useStartAppointment,
  useCompleteAppointment,
  useCancelAppointment,
  useDeleteAppointment,
  useRescheduleAppointment
} from '@/hooks/useAppointments';
import { AppointmentForm } from '@/components/forms/AppointmentForm';
import { AppointmentStatus } from '@/types';
import { AppointmentUtils } from '@/types/Appointment';

export function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const appointmentId = id ? parseInt(id) : 0;
  
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  
  // Data query
  const { data: appointment, isLoading, error, refetch } = useAppointment(appointmentId);
  
  // Mutations
  const confirmAppointmentMutation = useConfirmAppointment();
  const startAppointmentMutation = useStartAppointment();
  const completeAppointmentMutation = useCompleteAppointment();
  const cancelAppointmentMutation = useCancelAppointment();
  const deleteAppointmentMutation = useDeleteAppointment();
  
  if (!id || appointmentId === 0) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertDescription>Invalid appointment ID</AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleStatusChange = async (action: 'confirm' | 'start' | 'complete' | 'cancel') => {
    if (!appointment) return;
    
    try {
      switch (action) {
        case 'confirm':
          await confirmAppointmentMutation.mutateAsync(appointment.id);
          break;
        case 'start':
          await startAppointmentMutation.mutateAsync(appointment.id);
          break;
        case 'complete':
          await completeAppointmentMutation.mutateAsync({
            id: appointment.id,
            notes: completionNotes
          });
          setIsCompleteModalOpen(false);
          setCompletionNotes('');
          break;
        case 'cancel':
          await cancelAppointmentMutation.mutateAsync({
            id: appointment.id,
            reason: cancellationReason
          });
          setIsCancelModalOpen(false);
          setCancellationReason('');
          break;
      }
      refetch();
    } catch (error) {
      console.error('Failed to update appointment status:', error);
    }
  };

  const handleDelete = async () => {
    if (!appointment) return;
    
    try {
      await deleteAppointmentMutation.mutateAsync(appointment.id);
      navigate('/appointments');
    } catch (error) {
      console.error('Failed to delete appointment:', error);
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.PENDING:
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case AppointmentStatus.CONFIRMED:
        return <Badge variant="secondary" className="gap-1"><CheckCircle className="h-3 w-3" />Confirmed</Badge>;
      case AppointmentStatus.IN_PROGRESS:
        return <Badge variant="default" className="gap-1"><Play className="h-3 w-3" />In Progress</Badge>;
      case AppointmentStatus.COMPLETED:
        return <Badge variant="default" className="gap-1 bg-green-500 hover:bg-green-600"><CheckCheck className="h-3 w-3" />Completed</Badge>;
      case AppointmentStatus.CANCELLED:
        return <Badge variant="destructive" className="gap-1"><X className="h-3 w-3" />Cancelled</Badge>;
      case AppointmentStatus.NO_SHOW:
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />No Show</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusWorkflowActions = () => {
    if (!appointment) return [];
    
    const actions = [];
    
    switch (appointment.status) {
      case AppointmentStatus.PENDING:
        actions.push(
          <Button key="confirm" onClick={() => handleStatusChange('confirm')}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Confirm Appointment
          </Button>
        );
        break;
        
      case AppointmentStatus.CONFIRMED:
        actions.push(
          <Button key="start" onClick={() => handleStatusChange('start')}>
            <Play className="mr-2 h-4 w-4" />
            Start Appointment
          </Button>
        );
        break;
        
      case AppointmentStatus.IN_PROGRESS:
        actions.push(
          <Dialog key="complete" open={isCompleteModalOpen} onOpenChange={setIsCompleteModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <CheckCheck className="mr-2 h-4 w-4" />
                Complete Appointment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Complete Appointment</DialogTitle>
                <DialogDescription>
                  Mark this appointment as completed. Add any final notes about the work performed.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="completionNotes">Completion Notes</Label>
                  <Textarea
                    id="completionNotes"
                    placeholder="Describe the work completed, any issues resolved, or follow-up needed..."
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCompleteModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleStatusChange('complete')}>
                    Complete Appointment
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );
        break;
    }
    
    // Cancel option for non-completed appointments
    if (AppointmentUtils.canCancel(appointment)) {
      actions.push(
        <Dialog key="cancel" open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Appointment</DialogTitle>
              <DialogDescription>
                Cancel this appointment. Please provide a reason for the cancellation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cancellationReason">Reason for Cancellation</Label>
                <Textarea
                  id="cancellationReason"
                  placeholder="Please explain why this appointment is being cancelled..."
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>
                  Keep Appointment
                </Button>
                <Button variant="destructive" onClick={() => handleStatusChange('cancel')}>
                  Cancel Appointment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      );
    }
    
    return actions;
  };

  if (error) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/appointments')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Appointments
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load appointment: {error.message}. Please check your server connection.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading || !appointment) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/appointments')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Appointments
          </Button>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isUpcoming = AppointmentUtils.isUpcoming(appointment);
  const isOverdue = new Date() > new Date(appointment.scheduledStartTime) && 
                   appointment.status === AppointmentStatus.PENDING;
  const duration = AppointmentUtils.getDuration(appointment);

  return (
    <div className="container mx-auto p-4 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/appointments')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Appointments
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Appointment #{appointment.id}
            </h1>
            <p className="text-muted-foreground">
              {appointment.ticket?.title || 'No ticket information'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {getStatusBadge(appointment.status)}
          {isOverdue && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Overdue
            </Badge>
          )}
        </div>
      </div>

      {/* Overdue Warning */}
      {isOverdue && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This appointment is overdue. The scheduled start time has passed and the appointment is still pending confirmation.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Schedule Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Start Time</Label>
                  <p className="text-lg font-semibold">{formatDateTime(appointment.scheduledStartTime)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">End Time</Label>
                  <p className="text-lg font-semibold">{formatDateTime(appointment.scheduledEndTime)}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                <p className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {duration} minutes ({Math.floor(duration / 60)}h {duration % 60}m)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Technician Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Assigned Technician
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appointment.technician ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{appointment.technician.name}</h3>
                      <p className="text-muted-foreground">{appointment.technician.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {appointment.technician.phone || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                      <Badge variant="outline">
                        {appointment.technician.status?.toLowerCase().replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  {appointment.technician.skills && appointment.technician.skills.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Skills</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {appointment.technician.skills.map(skill => (
                          <Badge key={skill} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No technician assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Ticket Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TicketIcon className="h-5 w-5" />
                Related Ticket
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appointment.ticket ? (
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        #{appointment.ticket.id} - {appointment.ticket.title}
                      </h3>
                      <p className="text-muted-foreground mt-1">
                        {appointment.ticket.description}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/tickets/${appointment.ticket?.id}`)}
                    >
                      View Ticket
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                      <Badge variant={appointment.ticket.priority === 'URGENT' ? 'destructive' : 'outline'}>
                        {appointment.ticket.priority?.toLowerCase()}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                      <Badge variant={appointment.ticket.status === 'OPEN' ? 'default' : 'outline'}>
                        {appointment.ticket.status?.toLowerCase()}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Service Type</Label>
                      <Badge variant="secondary">
                        {appointment.ticket.serviceType?.toLowerCase().replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  {appointment.ticket.clientName && (
                    <div className="pt-3 border-t">
                      <Label className="text-sm font-medium text-muted-foreground">Client</Label>
                      <p className="font-medium">{appointment.ticket.clientName}</p>
                      {appointment.ticket.clientEmail && (
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {appointment.ticket.clientEmail}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No ticket information available</p>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {appointment.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{appointment.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Status Workflow */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Status Workflow
              </CardTitle>
              <CardDescription>
                Current status: {appointment.status}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {getStatusWorkflowActions()}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              
              {AppointmentUtils.canReschedule(appointment) && (
                <Dialog open={isRescheduleModalOpen} onOpenChange={setIsRescheduleModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Edit className="mr-2 h-4 w-4" />
                      Reschedule
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                      <DialogTitle>Reschedule Appointment</DialogTitle>
                      <DialogDescription>
                        Change the appointment timing and details.
                      </DialogDescription>
                    </DialogHeader>
                    <AppointmentForm 
                      appointment={appointment}
                      onSuccess={() => {
                        setIsRescheduleModalOpen(false);
                        refetch();
                      }}
                      onCancel={() => setIsRescheduleModalOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              )}
              
              <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <X className="mr-2 h-4 w-4" />
                    Delete Appointment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Appointment</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this appointment? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDelete}
                      disabled={deleteAppointmentMutation.isPending}
                    >
                      {deleteAppointmentMutation.isPending ? 'Deleting...' : 'Delete Appointment'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Appointment Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(appointment.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-muted"></div>
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(appointment.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              {isUpcoming && (
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <div>
                    <p className="text-sm font-medium">Upcoming</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.ceil((new Date(appointment.scheduledStartTime).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days to go
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AppointmentDetailPage;