/**
 * Client Detail Page - Comprehensive view with client information and related data
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  Activity,
  Settings,
  Edit,
  AlertCircle,
  User,
  FileText,
  UserCheck,
  UserX,
  UserMinus,
  ExternalLink,
  Info
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { 
  useClient, 
  useClientTickets,
  useClientAppointments 
} from '@/hooks/useClients';
import { ClientForm } from '@/components/forms/ClientForm';
import { TicketForm } from '@/components/forms/TicketForm';
import { AppointmentForm } from '@/components/forms/AppointmentForm';
import { ClientUtils } from '@/types/Client';
import { ClientStatus, TicketStatus, AppointmentStatus } from '@/types';

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Modal state management
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const clientId = parseInt(id || '0', 10);
  
  // Fetch client data
  const { data: client, isLoading: clientLoading, error: clientError } = useClient(clientId);
  const { data: tickets, isLoading: ticketsLoading, refetch: refetchTickets } = useClientTickets(clientId, { page: 0, size: 1000 });
  const { data: appointments, isLoading: appointmentsLoading, refetch: refetchAppointments } = useClientAppointments(clientId, { page: 0, size: 1000 });
  
  // Helper functions for quick actions
  const handleCreateTicket = () => {
    setIsTicketModalOpen(true);
  };
  
  const handleScheduleAppointment = () => {
    // Check if client has open tickets
    const openTickets = tickets?.content?.filter(ticket => ticket.status === TicketStatus.OPEN) || [];
    if (openTickets.length === 0) {
      // Show a more user-friendly message
      const shouldCreateTicket = window.confirm(
        'No open tickets found for this client. Would you like to create a ticket first?'
      );
      if (shouldCreateTicket) {
        setIsTicketModalOpen(true);
      }
      return;
    }
    setIsAppointmentModalOpen(true);
  };
  
  const handleSendEmail = () => {
    setIsEmailModalOpen(true);
  };
  
  const onTicketSuccess = () => {
    setIsTicketModalOpen(false);
    refetchTickets();
  };
  
  const onAppointmentSuccess = () => {
    setIsAppointmentModalOpen(false);
    refetchAppointments();
  };
  

  if (clientLoading) {
    return <ClientDetailSkeleton />;
  }

  if (clientError || !client) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {clientError?.message || 'Client not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getStatusColor = (status: ClientStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'SUSPENDED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'TERMINATED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: ClientStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <UserCheck className="h-3 w-3" />;
      case 'SUSPENDED':
        return <UserMinus className="h-3 w-3" />;
      case 'TERMINATED':
        return <UserX className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPhone = (phone: string) => {
    // Format phone number as (XXX) XXX-XXXX
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/clients')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clients
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {ClientUtils.getFullName(client)}
            </h1>
            <p className="text-muted-foreground">Client Details</p>
          </div>
        </div>
        
        <Button onClick={() => setIsEditModalOpen(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Client
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Information Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-medium">
                  {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">
                    {ClientUtils.getFullName(client)}
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={getStatusColor(client.status)}>
                      {getStatusIcon(client.status)}
                      {client.status}
                    </Badge>
                    <Badge variant="outline" className="text-muted-foreground">
                      ID #{client.id}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{client.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formatPhone(client.phone)}</span>
                </div>
              </div>
              
              {client.address && (
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{client.address}</span>
                </div>
              )}

              {client.notes && (
                <>
                  <hr className="border-t border-gray-200" />
                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Notes
                    </h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {client.notes}
                    </p>
                  </div>
                </>
              )}

              <hr className="border-t border-gray-200" />
              
              {/* Account Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Created:</span>
                  <p className="text-muted-foreground">{formatDate(client.createdAt)}</p>
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>
                  <p className="text-muted-foreground">{formatDate(client.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Tickets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Support Tickets
              </CardTitle>
              <CardDescription>
                Support tickets for this client
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ticketsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : !tickets?.content || tickets.content.length === 0 ? (
                <p className="text-sm text-muted-foreground">No support tickets found</p>
              ) : (
                <div className="space-y-3">
                  {tickets.content.slice(0, 5).map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between py-2 border-b last:border-b-0 cursor-pointer hover:bg-muted/10 rounded-md px-2"
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                      role="button"
                      aria-label={`View ticket #${ticket.id}`}
                    >
                      <div>
                        <p className="font-medium">#{ticket.id} - {ticket.title}</p>
                        <p className="text-sm text-muted-foreground">{ticket.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Created: {formatDate(ticket.createdAt)}
                        </p>
                      </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={
                      ticket.status === TicketStatus.OPEN ? 'destructive' :
                      ticket.status === TicketStatus.CLOSED ? 'secondary' :
                      'secondary'
                    }>
                      {ticket.status}
                    </Badge>
                    {ticket.priority && (
                      <Badge variant="outline" className="text-xs">
                        {ticket.priority}
                      </Badge>
                    )}
                  </div>
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

          {/* Client Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Appointments
              </CardTitle>
              <CardDescription>
                Scheduled appointments for this client
              </CardDescription>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : !appointments?.content || appointments.content.length === 0 ? (
                <p className="text-sm text-muted-foreground">No appointments scheduled</p>
              ) : (
                <div className="space-y-3">
                  {appointments.content.slice(0, 3).map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center space-x-3 py-2 border-b last:border-b-0 cursor-pointer hover:bg-muted/10 rounded-md px-2"
                      onClick={() => navigate(`/appointments/${appointment.id}`)}
                      role="button"
                      aria-label={`View appointment #${appointment.id}`}
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{formatDate(appointment.scheduledStartTime)}</p>
                        <p className="text-sm text-muted-foreground">{appointment.notes ?? appointment.ticket?.description ?? 'No notes'}</p>
                      </div>
                      <Badge variant={
                        appointment.status === AppointmentStatus.CONFIRMED ? 'default' :
                        appointment.status === AppointmentStatus.COMPLETED ? 'secondary' :
                        'destructive'
                      }>
                        {appointment.status}
                      </Badge>
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

        {/* Right Column - Statistics & Quick Actions */}
        <div className="space-y-6">
          {/* Client Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Client Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Tickets</span>
                  <span className="font-medium">{tickets?.totalElements || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Open Tickets</span>
                  <span className="font-medium text-red-600">
                    {tickets?.content?.filter(t => t.status === 'OPEN').length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Appointments</span>
                  <span className="font-medium">{appointments?.totalElements || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Account Status</span>
                  <span className={`font-medium ${
                    client.status === 'ACTIVE' ? 'text-green-600' : 
                    client.status === 'SUSPENDED' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {client.status}
                  </span>
                </div>
              </div>
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
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={handleScheduleAppointment}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={handleCreateTicket}
              >
                <Activity className="h-4 w-4 mr-2" />
                Create New Ticket
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={handleSendEmail}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>
              Update client information
            </DialogDescription>
          </DialogHeader>
          <ClientForm
            client={client}
            onSuccess={() => {
              setIsEditModalOpen(false);
              // Data will be automatically refetched by React Query
            }}
            onCancel={() => setIsEditModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Create Ticket Modal */}
      <Dialog open={isTicketModalOpen} onOpenChange={setIsTicketModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create New Ticket</DialogTitle>
            <DialogDescription>
              Create a new support ticket for {ClientUtils.getFullName(client)}
            </DialogDescription>
          </DialogHeader>
          {client && (
            <TicketForm
              ticket={undefined}
              defaultClientId={client.id}
              onSuccess={onTicketSuccess}
              onCancel={() => setIsTicketModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Schedule Appointment Modal */}
      <Dialog open={isAppointmentModalOpen} onOpenChange={setIsAppointmentModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Schedule Appointment</DialogTitle>
            <DialogDescription>
              Schedule an appointment for {ClientUtils.getFullName(client)}
            </DialogDescription>
          </DialogHeader>
          <AppointmentForm
            appointment={undefined}
            clientIdFilter={client.id}
            onSuccess={onAppointmentSuccess}
            onCancel={() => setIsAppointmentModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Send Email Modal */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact {ClientUtils.getFullName(client)}
            </DialogTitle>
            <DialogDescription>
              Client contact information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{client?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{formatPhone(client?.phone || '')}</p>
                  </div>
                </div>
                {client?.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">{client.address}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => {
                  window.open(`mailto:${client?.email}`, '_blank');
                }}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Email Client
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEmailModalOpen(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Loading skeleton component
function ClientDetailSkeleton() {
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
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
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
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ClientDetailPage;