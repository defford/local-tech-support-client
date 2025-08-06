/**
 * Technician Assignment Modal - Simple interface for assigning technicians to tickets
 */

import { useState } from 'react';
import { UserCheck, User, Mail, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { useTechnicians } from '@/hooks/useTechnicians';
import { useAssignTicket } from '@/hooks/useTickets';
import { Technician, TechnicianStatus } from '@/types';

interface TechnicianAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: number;
  currentTechnicianId?: number;
  onSuccess?: () => void;
}

export function TechnicianAssignmentModal({
  open,
  onOpenChange,
  ticketId,
  currentTechnicianId,
  onSuccess
}: TechnicianAssignmentModalProps) {
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<number | null>(
    currentTechnicianId || null
  );

  // Fetch available technicians
  const { data: techniciansData, isLoading: techniciansLoading, error: techniciansError } = useTechnicians();
  const assignTicketMutation = useAssignTicket();

  // Filter active technicians
  const availableTechnicians = techniciansData?.content?.filter(
    tech => tech.status === TechnicianStatus.ACTIVE
  ) || [];

  const handleAssign = async () => {
    if (!selectedTechnicianId) return;

    // Find the selected technician to validate
    const selectedTechnician = availableTechnicians.find(t => t.id === selectedTechnicianId);
    if (!selectedTechnician) {
      console.error('Selected technician not found in available list');
      return;
    }

    try {
      console.log('Assigning ticket:', {
        ticketId,
        selectedTechnicianId,
        selectedTechnician: {
          id: selectedTechnician.id,
          name: `${selectedTechnician.firstName} ${selectedTechnician.lastName}`,
          email: selectedTechnician.email,
          status: selectedTechnician.status
        },
        assignmentData: { technicianId: selectedTechnicianId }
      });
      
      // Double-check that the technician is active
      if (selectedTechnician.status !== 'ACTIVE') {
        throw new Error(`Technician ${selectedTechnician.firstName} ${selectedTechnician.lastName} is not active (Status: ${selectedTechnician.status})`);
      }
      
      await assignTicketMutation.mutateAsync({
        id: ticketId,
        assignment: { technicianId: selectedTechnicianId }
      });
      
      onSuccess?.();
      onOpenChange(false);
      setSelectedTechnicianId(null);
    } catch (error) {
      console.error('Failed to assign technician:', error);
      console.error('Full error object:', error);
      console.error('Error details:', {
        ticketId,
        selectedTechnicianId,
        selectedTechnician: selectedTechnician ? {
          id: selectedTechnician.id,
          name: `${selectedTechnician.firstName} ${selectedTechnician.lastName}`,
          status: selectedTechnician.status,
          skills: selectedTechnician.skills
        } : 'NOT_FOUND',
        assignmentPayload: { technicianId: selectedTechnicianId },
        endpoint: `/api/tickets/${ticketId}/assign`,
        errorResponse: (error as any)?.response?.data,
        errorStatus: (error as any)?.response?.status,
        errorMessage: (error as any)?.message || error
      });
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedTechnicianId(currentTechnicianId || null);
  };

  const getInitials = (technician: Technician) => {
    return `${technician.firstName?.[0] || ''}${technician.lastName?.[0] || ''}`.toUpperCase();
  };

  const getFullName = (technician: Technician) => {
    return `${technician.firstName || ''} ${technician.lastName || ''}`.trim();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            {currentTechnicianId ? 'Reassign Technician' : 'Assign Technician'}
          </DialogTitle>
          <DialogDescription>
            {currentTechnicianId 
              ? 'Select a different technician for this ticket.' 
              : 'Choose a technician to assign to this ticket.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {techniciansError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load technicians: {techniciansError.message}
              </AlertDescription>
            </Alert>
          )}

          {assignTicketMutation.error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div>Failed to assign technician: {assignTicketMutation.error.message}</div>
                  {(assignTicketMutation.error as any)?.response?.data && (
                    <div className="text-xs text-red-700 dark:text-red-300">
                      Server Error: {JSON.stringify((assignTicketMutation.error as any).response.data)}
                    </div>
                  )}
                  {(assignTicketMutation.error as any)?.response?.status && (
                    <div className="text-xs text-red-700 dark:text-red-300">
                      Status: {(assignTicketMutation.error as any).response.status}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3 overflow-y-auto max-h-[400px]">
            {techniciansLoading ? (
              // Loading state
              [...Array(3)].map((_, index) => (
                <Card key={index} className="cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : availableTechnicians.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No active technicians available</p>
              </div>
            ) : (
              availableTechnicians.map((technician) => {
                const isSelected = selectedTechnicianId === technician.id;
                const isCurrent = currentTechnicianId === technician.id;
                
                return (
                  <Card
                    key={technician.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedTechnicianId(technician.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                            {getInitials(technician)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{getFullName(technician)}</p>
                              {isCurrent && (
                                <Badge variant="secondary" className="text-xs">
                                  Current
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <Mail className="h-3 w-3" />
                              {technician.email}
                            </div>
                            {technician.phone && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {technician.phone}
                              </p>
                            )}
                            {technician.skills && technician.skills.length > 0 && (
                              <div className="flex gap-1 mt-2">
                                {technician.skills.slice(0, 3).map((skill) => (
                                  <Badge key={skill} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {technician.skills.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{technician.skills.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {isSelected && (
                          <div className="text-primary">
                            <UserCheck className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign}
            disabled={!selectedTechnicianId || assignTicketMutation.isPending || techniciansLoading}
          >
            {assignTicketMutation.isPending ? 'Assigning...' : 'Assign Technician'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TechnicianAssignmentModal;