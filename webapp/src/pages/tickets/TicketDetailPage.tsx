/**
 * Ticket Detail Page - Advanced view with comprehensive ticket information
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  User,
  Calendar, 
  Clock, 
  AlertTriangle,
  Edit,
  UserCheck,
  CheckCircle,
  RotateCcw,
  Trash2,
  Tag,
  FileText
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { 
  useTicket,
  useDeleteTicket,
  useCloseTicket,
  useReopenTicket
} from '@/hooks/useTickets';
import { useClients } from '@/hooks/useClients';
import { useTechnicians } from '@/hooks/useTechnicians';
import { TicketForm } from '@/components/forms/TicketForm';
import { TechnicianAssignmentModal } from '@/components/forms/TechnicianAssignmentModal';
import { TicketUtils } from '@/types/Ticket';
import { TicketPriority } from '@/types';

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const ticketId = parseInt(id || '0', 10);
  
  // Fetch ticket data
  const { data: ticket, isLoading: ticketLoading, error: ticketError, refetch } = useTicket(ticketId);
  const { data: clientsData, isLoading: clientsLoading } = useClients();
  const { data: techniciansData, isLoading: techniciansLoading } = useTechnicians();
  
  // Mutations
  const deleteTicketMutation = useDeleteTicket();
  const closeTicketMutation = useCloseTicket();
  const reopenTicketMutation = useReopenTicket();

  // Find related client and technician
  // First try the embedded client object, then lookup by clientId
  const client = ticket?.client || clientsData?.content?.find(c => c.id === ticket?.clientId);
  const assignedTechnician = ticket?.assignedTechnician || techniciansData?.content?.find(t => t.id === ticket?.assignedTechnicianId);

  if (ticketLoading) {
    return <TicketDetailSkeleton />;
  }

  if (ticketError || !ticket) {
    return (
      <div className="container mx-auto p-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/tickets')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tickets
        </Button>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {ticketError?.message || 'Ticket not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getPriorityIcon = (priority: TicketPriority | undefined) => {
    switch (priority) {
      case TicketPriority.URGENT:
        return '🔴';
      case TicketPriority.HIGH:
        return '🟠';
      case TicketPriority.MEDIUM:
        return '🟡';
      case TicketPriority.LOW:
        return '🟢';
      default:
        return '⚪';
    }
  };

  const getPriorityBadgeVariant = (priority: TicketPriority | undefined) => {
    switch (priority) {
      case TicketPriority.URGENT:
        return 'destructive' as const;
      case TicketPriority.HIGH:
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const getStatusIcon = () => {
    if (TicketUtils.isOverdue(ticket)) return <AlertTriangle className="h-4 w-4 text-red-600" />;
    if (TicketUtils.isOpen(ticket)) return <Clock className="h-4 w-4 text-blue-600" />;
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  const getStatusColor = () => {
    if (TicketUtils.isOverdue(ticket)) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    if (TicketUtils.isOpen(ticket)) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDueDate = (dueAt: string | undefined) => {
    if (!dueAt) return 'No due date';
    const date = new Date(dueAt);
    const now = new Date();
    const isOverdue = date < now;
    
    return (
      <span className={isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
        {formatDate(dueAt)}
        {isOverdue && ' (Overdue)'}
      </span>
    );
  };

  const handleDeleteTicket = async () => {
    try {
      await deleteTicketMutation.mutateAsync(ticket.id);
      setIsDeleteModalOpen(false);
      navigate('/tickets');
    } catch (error) {
      console.error('Failed to delete ticket:', error);
      // Error is handled by the mutation hook and displayed in UI
      // Keep modal open so user can see error and try again
    }
  };

  const handleCloseTicket = async () => {
    try {
      await closeTicketMutation.mutateAsync({ id: ticket.id });
      refetch();
    } catch (error) {
      console.error('Failed to close ticket:', error);
      // Error state is managed by the mutation hook
    }
  };

  const handleReopenTicket = async () => {
    try {
      await reopenTicketMutation.mutateAsync({ id: ticket.id });
      refetch();
    } catch (error) {
      console.error('Failed to reopen ticket:', error);
      // Error state is managed by the mutation hook
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/tickets')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tickets
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              #{ticket.id} - {ticket.title}
            </h1>
            <p className="text-muted-foreground">Ticket Details</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {TicketUtils.isOpen(ticket) && (
            <Button 
              variant="outline"
              onClick={handleCloseTicket}
              disabled={closeTicketMutation.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {closeTicketMutation.isPending ? 'Closing...' : 'Close Ticket'}
            </Button>
          )}
          
          {TicketUtils.isClosed(ticket) && (
            <Button 
              variant="outline"
              onClick={handleReopenTicket}
              disabled={reopenTicketMutation.isPending}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {reopenTicketMutation.isPending ? 'Reopening...' : 'Reopen'}
            </Button>
          )}
          
          <Button onClick={() => setIsEditModalOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Ticket
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Information Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor()}>
                      {getStatusIcon()}
                      <span className="ml-1">
                        {TicketUtils.isOverdue(ticket) ? 'Overdue' :
                         TicketUtils.isOpen(ticket) ? 'Open' : 'Closed'}
                      </span>
                    </Badge>
                    <Badge variant={getPriorityBadgeVariant(ticket.priority)} className="gap-1">
                      <span>{getPriorityIcon(ticket.priority)}</span>
                      {ticket.priority?.toLowerCase() || 'Unknown'}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Tag className="h-3 w-3" />
                      {ticket.serviceType ? (ticket.serviceType.charAt(0) + ticket.serviceType.slice(1).toLowerCase()) : 'Unknown'}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{ticket.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Description
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {ticket.description || 'No description provided'}
                  </p>
                </div>
                
                <hr className="border-t border-gray-200" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-sm font-medium">Created:</span>
                      <p className="text-sm text-muted-foreground">{formatDate(ticket.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-sm font-medium">Due Date:</span>
                      <p className="text-sm">{formatDueDate(ticket.dueAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Client Information
              </CardTitle>
              <CardDescription>
                Contact details and information for this ticket
              </CardDescription>
            </CardHeader>
            <CardContent>
              {clientsLoading ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                </div>
              ) : client ? (
                <div className="space-y-3">
                  <div>
                    <button 
                      className="font-medium text-lg hover:text-primary transition-colors cursor-pointer"
                      onClick={() => navigate(`/clients/${client.id}`)}
                      title="View client details"
                    >
                      {client.firstName} {client.lastName}
                    </button>
                    <p className="text-sm text-muted-foreground">Client ID: {ticket.clientId} • Click name to view details</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{client.phone}</span>
                      </div>
                    )}
                  </div>
                  {client.address && (
                    <div className="pt-2">
                      <p className="text-sm font-medium">Address:</p>
                      <p className="text-sm text-muted-foreground">{client.address}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <User className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {ticket.clientName || ticket.clientEmail ? (
                      <span>
                        Client: {ticket.clientName || 'Unknown'}<br />
                        {ticket.clientEmail && <span className="text-xs">Email: {ticket.clientEmail}</span>}
                        <br />
                        <span className="text-xs text-yellow-600">Full client details loading... (ID: {ticket.clientId})</span>
                      </span>
                    ) : (
                      <span>
                        Client information not available<br />
                        <span className="text-xs text-red-600">Client ID: {ticket.clientId} - Check if client exists</span>
                      </span>
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Assignment & Actions */}
        <div className="space-y-6">
          {/* Assignment Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="h-5 w-5 mr-2" />
                Assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignedTechnician ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                      {assignedTechnician.firstName?.[0]}{assignedTechnician.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-medium">
                        {assignedTechnician.firstName} {assignedTechnician.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{assignedTechnician.email}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setIsAssignModalOpen(true)}
                  >
                    Reassign Technician
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <p className="text-sm text-muted-foreground">No technician assigned</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setIsAssignModalOpen(true)}
                  >
                    Assign Technician
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => setIsAssignModalOpen(true)}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                {assignedTechnician ? 'Reassign' : 'Assign'} Technician
              </Button>
              
              {TicketUtils.isOpen(ticket) ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={handleCloseTicket}
                  disabled={closeTicketMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Close Ticket
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={handleReopenTicket}
                  disabled={reopenTicketMutation.isPending}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reopen Ticket
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Ticket
              </Button>
            </CardContent>
          </Card>

          {/* Ticket Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Ticket ID</span>
                  <span className="font-mono text-sm">#{ticket.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Priority Level</span>
                  <span className="font-medium">{ticket.priority || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Service Type</span>
                  <span className="font-medium">
                    {ticket.serviceType ? (ticket.serviceType.charAt(0) + ticket.serviceType.slice(1).toLowerCase()) : 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Status</span>
                  <span className="font-medium">
                    {TicketUtils.isOverdue(ticket) ? 'Overdue' :
                     TicketUtils.isOpen(ticket) ? 'Open' : 'Closed'}
                  </span>
                </div>
                {ticket.updatedAt && (
                  <div className="flex justify-between">
                    <span className="text-sm">Last Updated</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(ticket.updatedAt)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Ticket</DialogTitle>
            <DialogDescription>
              Update ticket information and details.
            </DialogDescription>
          </DialogHeader>
          <TicketForm
            ticket={ticket}
            onSuccess={() => {
              setIsEditModalOpen(false);
              refetch();
            }}
            onCancel={() => setIsEditModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Ticket</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete ticket "#{ticket.id} - {ticket.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteTicket}
              disabled={deleteTicketMutation.isPending}
            >
              {deleteTicketMutation.isPending ? 'Deleting...' : 'Delete Ticket'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assignment Modal */}
      <TechnicianAssignmentModal
        open={isAssignModalOpen}
        onOpenChange={setIsAssignModalOpen}
        ticketId={ticket.id}
        currentTechnicianId={ticket.assignedTechnicianId}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
}

// Loading skeleton component
function TicketDetailSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-9 w-32" />
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <Skeleton className="h-6 w-96" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-px w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
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
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default TicketDetailPage;