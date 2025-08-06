/**
 * Appointment form component for creating and editing appointments
 * Includes conflict detection, validation, and professional ShadCN UI
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarDays, Clock, User, Ticket as TicketIcon, AlertTriangle, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCreateAppointment, useUpdateAppointment, useCheckAppointmentConflicts } from '@/hooks/useAppointments';
import { useTickets } from '@/hooks/useTickets';
import { useTechnicians } from '@/hooks/useTechnicians';
import { Appointment, AppointmentCreateRequest, AppointmentUpdateRequest, AppointmentStatus, TechnicianStatus, TicketStatus } from '@/types';
import { AppointmentConflict } from '@/services/appointments';

/**
 * Appointment form validation schema
 */
const appointmentFormSchema = z.object({
  ticketId: z.number().min(1, 'Please select a ticket'),
  technicianId: z.number().min(1, 'Please select a technician'),
  scheduledStartTime: z.string().min(1, 'Start time is required'),
  scheduledEndTime: z.string().min(1, 'End time is required'),
  notes: z.string().optional(),
}).refine(
  (data) => {
    const start = new Date(data.scheduledStartTime);
    const end = new Date(data.scheduledEndTime);
    return end > start;
  },
  {
    message: 'End time must be after start time',
    path: ['scheduledEndTime'],
  }
).refine(
  (data) => {
    const start = new Date(data.scheduledStartTime);
    const end = new Date(data.scheduledEndTime);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60); // Duration in minutes
    return duration >= 30 && duration <= 480; // 30 minutes to 8 hours
  },
  {
    message: 'Appointment duration must be between 30 minutes and 8 hours',
    path: ['scheduledEndTime'],
  }
);

type AppointmentFormData = z.infer<typeof appointmentFormSchema>;

interface AppointmentFormProps {
  appointment?: Appointment;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AppointmentForm({ appointment, onSuccess, onCancel }: AppointmentFormProps) {
  const [conflicts, setConflicts] = useState<AppointmentConflict[]>([]);
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);
  
  const isEditing = !!appointment;
  
  // Mutations
  const createAppointmentMutation = useCreateAppointment();
  const updateAppointmentMutation = useUpdateAppointment();
  const checkConflictsMutation = useCheckAppointmentConflicts();
  
  // Data queries
  const { data: ticketsData, isLoading: ticketsLoading } = useTickets();
  const { data: techniciansData, isLoading: techniciansLoading } = useTechnicians();
  
  // Filter data for valid selections
  const availableTickets = ticketsData?.content?.filter(ticket => 
    ticket && ticket.status === TicketStatus.OPEN
  ) || [];
  
  const availableTechnicians = techniciansData?.content?.filter(technician => 
    technician && technician.status === TechnicianStatus.ACTIVE
  ) || [];
  
  // Form setup
  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      ticketId: appointment?.ticketId || 0,
      technicianId: appointment?.technicianId || 0,
      scheduledStartTime: appointment?.scheduledStartTime ? 
        new Date(appointment.scheduledStartTime).toISOString().slice(0, 16) : '',
      scheduledEndTime: appointment?.scheduledEndTime ? 
        new Date(appointment.scheduledEndTime).toISOString().slice(0, 16) : '',
      notes: appointment?.notes || '',
    },
  });
  
  // Watch form values for conflict checking
  const watchedValues = form.watch();
  
  // Check conflicts when form values change
  useEffect(() => {
    const { ticketId, technicianId, scheduledStartTime, scheduledEndTime } = watchedValues;
    
    if (ticketId && technicianId && scheduledStartTime && scheduledEndTime && !isEditing) {
      const appointmentRequest: AppointmentCreateRequest = {
        ticketId,
        technicianId,
        scheduledStartTime: new Date(scheduledStartTime).toISOString(),
        scheduledEndTime: new Date(scheduledEndTime).toISOString(),
        notes: watchedValues.notes,
      };
      
      setIsCheckingConflicts(true);
      checkConflictsMutation.mutate(appointmentRequest, {
        onSuccess: (conflictData) => {
          setConflicts(conflictData);
          setIsCheckingConflicts(false);
        },
        onError: () => {
          setIsCheckingConflicts(false);
        },
      });
    }
  }, [watchedValues.ticketId, watchedValues.technicianId, watchedValues.scheduledStartTime, watchedValues.scheduledEndTime, isEditing]);
  
  // Form submission
  const onSubmit = async (data: AppointmentFormData) => {
    try {
      if (isEditing && appointment) {
        const updateData: AppointmentUpdateRequest = {
          scheduledStartTime: new Date(data.scheduledStartTime).toISOString(),
          scheduledEndTime: new Date(data.scheduledEndTime).toISOString(),
          notes: data.notes,
        };
        
        await updateAppointmentMutation.mutateAsync({
          id: appointment.id,
          appointment: updateData,
        });
      } else {
        const createData: AppointmentCreateRequest = {
          ticketId: data.ticketId,
          technicianId: data.technicianId,
          scheduledStartTime: new Date(data.scheduledStartTime).toISOString(),
          scheduledEndTime: new Date(data.scheduledEndTime).toISOString(),
          notes: data.notes,
        };
        
        await createAppointmentMutation.mutateAsync(createData);
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Failed to save appointment:', error);
    }
  };
  
  const isLoading = createAppointmentMutation.isPending || updateAppointmentMutation.isPending;
  const hasConflicts = conflicts.length > 0;
  
  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Ticket Selection */}
        {!isEditing && (
          <div className="space-y-2">
            <Label htmlFor="ticketId" className="text-sm font-medium">
              <TicketIcon className="inline h-4 w-4 mr-1" />
              Ticket
            </Label>
            <Select
              value={form.watch('ticketId').toString()}
              onValueChange={(value) => form.setValue('ticketId', parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={ticketsLoading ? 'Loading tickets...' : 'Select a ticket'} />
              </SelectTrigger>
              <SelectContent>
                {availableTickets.map((ticket) => (
                  <SelectItem key={ticket.id} value={ticket.id.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <span>#{ticket.id} - {ticket.title}</span>
                      <Badge variant="outline" className="ml-2">
                        {ticket.priority?.toLowerCase()}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.ticketId && (
              <p className="text-sm text-destructive">{form.formState.errors.ticketId.message}</p>
            )}
          </div>
        )}
        
        {/* Technician Selection */}
        {!isEditing && (
          <div className="space-y-2">
            <Label htmlFor="technicianId" className="text-sm font-medium">
              <User className="inline h-4 w-4 mr-1" />
              Technician
            </Label>
            <Select
              value={form.watch('technicianId').toString()}
              onValueChange={(value) => form.setValue('technicianId', parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={techniciansLoading ? 'Loading technicians...' : 'Select a technician'} />
              </SelectTrigger>
              <SelectContent>
                {availableTechnicians.map((technician) => (
                  <SelectItem key={technician.id} value={technician.id.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <span>{technician.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {technician.skills?.join(', ') || 'No skills listed'}
                        </Badge>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.technicianId && (
              <p className="text-sm text-destructive">{form.formState.errors.technicianId.message}</p>
            )}
          </div>
        )}
        
        {/* Date and Time Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="scheduledStartTime" className="text-sm font-medium">
              <CalendarDays className="inline h-4 w-4 mr-1" />
              Start Date & Time
            </Label>
            <Input
              id="scheduledStartTime"
              type="datetime-local"
              {...form.register('scheduledStartTime')}
              className="w-full"
            />
            {form.formState.errors.scheduledStartTime && (
              <p className="text-sm text-destructive">{form.formState.errors.scheduledStartTime.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="scheduledEndTime" className="text-sm font-medium">
              <Clock className="inline h-4 w-4 mr-1" />
              End Date & Time
            </Label>
            <Input
              id="scheduledEndTime"
              type="datetime-local"
              {...form.register('scheduledEndTime')}
              className="w-full"
            />
            {form.formState.errors.scheduledEndTime && (
              <p className="text-sm text-destructive">{form.formState.errors.scheduledEndTime.message}</p>
            )}
          </div>
        </div>
        
        {/* Duration Display */}
        {form.watch('scheduledStartTime') && form.watch('scheduledEndTime') && (
          <Card className="border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">
                  Duration: {
                    Math.round(
                      (new Date(form.watch('scheduledEndTime')).getTime() - 
                       new Date(form.watch('scheduledStartTime')).getTime()) / (1000 * 60)
                    )
                  } minutes
                </span>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Conflict Detection */}
        {isCheckingConflicts && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Checking for scheduling conflicts...
            </AlertDescription>
          </Alert>
        )}
        
        {hasConflicts && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Scheduling Conflicts Detected:</p>
                {conflicts.map((conflict, index) => (
                  <div key={index} className="text-sm">
                    • {conflict.message}
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium">
            Notes (Optional)
          </Label>
          <Textarea
            id="notes"
            placeholder="Additional notes or special instructions..."
            {...form.register('notes')}
            className="min-h-[100px]"
          />
        </div>
        
        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || (hasConflicts && !isEditing)}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                {isEditing ? 'Update' : 'Create'} Appointment
              </>
            )}
          </Button>
        </div>
      </form>
      
      {/* API Error Display */}
      {(createAppointmentMutation.error || updateAppointmentMutation.error) && (
        <Alert variant="destructive">
          <X className="h-4 w-4" />
          <AlertDescription>
            Failed to save appointment: {
              (createAppointmentMutation.error as any)?.message || 
              (updateAppointmentMutation.error as any)?.message || 
              'Unknown error occurred'
            }
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default AppointmentForm;