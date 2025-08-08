/**
 * Ticket Form Component (ShadCN UI)
 * Handles both creation and editing of tickets with validation
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { Check, X, Calendar, User, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { Ticket, TicketCreateRequest, TicketUpdateRequest, TicketPriority, ServiceType } from '../../types';
import { DEFAULT_API_CONFIG } from '../../types/api';
import { useCreateTicket, useUpdateTicket, useClients } from '../../hooks';

// Base schema for shared fields
const baseTicketFormSchema = z.object({
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description must be 1000 characters or less'),
  serviceType: z.nativeEnum(ServiceType, { message: 'Service type is required' }),
  clientId: z
    .number({ message: 'Client selection is required' })
    .min(1, 'Please select a client'),
});

// Schema for creating tickets (priority optional, backend will default if missing)
const createTicketFormSchema = baseTicketFormSchema.extend({
  title: z.string().optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
});

// Schema for editing tickets (title/priority required)
const editTicketFormSchema = baseTicketFormSchema.extend({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less'),
  priority: z.nativeEnum(TicketPriority, { message: 'Priority is required' }),
});

type TicketFormValues = z.infer<typeof createTicketFormSchema>;

interface TicketFormProps {
  ticket?: Ticket;
  defaultClientId?: number;
  onSuccess?: (ticket: Ticket) => void;
  onCancel?: () => void;
}

export function TicketForm({ ticket, defaultClientId, onSuccess, onCancel }: TicketFormProps) {
  const isEditing = !!ticket;
  const createTicketMutation = useCreateTicket();
  const updateTicketMutation = useUpdateTicket();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Fetch clients for the dropdown
  const { data: clientsResponse } = useClients({ page: 0, size: 100 });
  const clients = clientsResponse?.content || [];

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(isEditing ? editTicketFormSchema : createTicketFormSchema),
    defaultValues: {
      title: ticket?.title || '',
      description: ticket?.description || '',
      serviceType: ticket?.serviceType || ServiceType.HARDWARE,
      priority: ticket?.priority || TicketPriority.MEDIUM,
      clientId: ticket?.clientId || defaultClientId || 0,
      // No dueAt input in create/edit as backend manages SLA due date
    },
  });

  // Update form when ticket prop changes
  useEffect(() => {
    if (ticket) {
      form.reset({
        title: ticket.title || '',
        description: ticket.description || '',
        serviceType: ticket.serviceType,
        priority: ticket.priority,
        clientId: ticket.clientId,
        dueAt: ticket.dueAt ? new Date(ticket.dueAt).toISOString().slice(0, 16) : '',
      });
    }
  }, [ticket, form]);

  const handleSubmit = async (values: TicketFormValues) => {
    try {
      let result: Ticket;
      const ensureSeconds = (value: string): string => {
        if (!value) return value;
        // Accept formats like YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss
        const parts = value.split(':');
        return parts.length === 2 ? `${value}:00` : value;
      };

      if (isEditing && ticket) {
        const updateData: TicketUpdateRequest = {
          title: values.title.trim(),
          description: values.description.trim(),
          serviceType: values.serviceType,
          priority: values.priority,
          // Backend controls dueAt; editing dueAt not supported per current server contract
        };

        result = await updateTicketMutation.mutateAsync({
          id: ticket.id,
          data: updateData,
        });
      } else {
        const createData: TicketCreateRequest = {
          description: values.description.trim(),
          serviceType: values.serviceType,
          clientId: values.clientId,
          priority: values.priority,
        };

        console.log('📤 Sending ticket creation request:', createData);
        result = await createTicketMutation.mutateAsync(createData);
        // No follow-up dueAt update; backend manages due date by SLA
        form.reset();
      }

      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      onSuccess?.(result);
    } catch (error) {
      console.error('Ticket form error:', error);
    }
  };

  const isLoading = createTicketMutation.isPending || updateTicketMutation.isPending;
  const error = createTicketMutation.error || updateTicketMutation.error;

  const getPriorityColor = (priority: TicketPriority): string => {
    switch (priority) {
      case TicketPriority.URGENT:
        return 'text-red-600';
      case TicketPriority.HIGH:
        return 'text-orange-600';
      case TicketPriority.MEDIUM:
        return 'text-yellow-600';
      case TicketPriority.LOW:
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPriorityIcon = (priority: TicketPriority): string => {
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

  const getServiceTypeDescription = (serviceType: ServiceType): string => {
    switch (serviceType) {
      case ServiceType.HARDWARE:
        return 'Computer, server, or physical equipment issues';
      case ServiceType.SOFTWARE:
        return 'Application, OS, or software-related problems';
      case ServiceType.NETWORK:
        return 'Internet, WiFi, or connectivity issues';
      case ServiceType.PRINTER:
        return 'Printer, scanner, or printing problems';
      case ServiceType.EMAIL:
        return 'Email setup, configuration, or delivery issues';
      case ServiceType.SECURITY:
        return 'Security, antivirus, or malware concerns';
      case ServiceType.BACKUP:
        return 'Data backup, recovery, or storage issues';
      case ServiceType.CONSULTATION:
        return 'Technical advice or consultation services';
      default:
        return '';
    }
  };

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Success Message */}
        {showSuccessMessage && (
          <Alert className="border-green-200 bg-green-50">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Ticket {isEditing ? 'updated' : 'created'} successfully
            </AlertDescription>
          </Alert>
        )}

        {/* Title and Priority - Only shown for editing */}
        {isEditing && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Brief description of the issue"
                {...form.register('title')}
                disabled={isLoading}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={form.watch('priority')}
                onValueChange={(value) => form.setValue('priority', value as TicketPriority)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TicketPriority).map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      <div className="flex items-center gap-2">
                        <span>{getPriorityIcon(priority)}</span>
                        <span className={getPriorityColor(priority)}>
                          {priority.charAt(0) + priority.slice(1).toLowerCase()}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.priority && (
                <p className="text-sm text-red-600">{form.formState.errors.priority.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Notice for ticket creation */}
        {!isEditing && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Title and priority will be automatically generated by the system based on your description and service type.
            </p>
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            placeholder="Detailed description of the issue, including symptoms, error messages, and steps to reproduce..."
            rows={4}
            {...form.register('description')}
            disabled={isLoading}
          />
          {form.formState.errors.description && (
            <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Provide as much detail as possible to help technicians understand and resolve the issue.
          </p>
        </div>

        {/* Service Type and Client */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="serviceType">Service Type *</Label>
            <Select
              value={form.watch('serviceType')}
              onValueChange={(value) => form.setValue('serviceType', value as ServiceType)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ServiceType).map((serviceType) => (
                  <SelectItem key={serviceType} value={serviceType}>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {serviceType.charAt(0) + serviceType.slice(1).toLowerCase()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getServiceTypeDescription(serviceType)}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.serviceType && (
              <p className="text-sm text-red-600">{form.formState.errors.serviceType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientId">Client *</Label>
            <Select
              value={form.watch('clientId')?.toString() || ''}
              onValueChange={(value) => form.setValue('clientId', parseInt(value))}
              disabled={isLoading || !!defaultClientId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{client.firstName} {client.lastName}</div>
                        <div className="text-xs text-muted-foreground">{client.email}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.clientId && (
              <p className="text-sm text-red-600">{form.formState.errors.clientId.message}</p>
            )}
          </div>
        </div>

        {/* Priority (optional on create; required on edit) */}
        <div className="space-y-2">
          <Label htmlFor="priority">Priority{isEditing ? ' *' : ''}</Label>
          <Select
            value={form.watch('priority')}
            onValueChange={(value) => form.setValue('priority', value as TicketPriority)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(TicketPriority).map((priority) => (
                <SelectItem key={priority} value={priority}>
                  <div className="flex items-center gap-2">
                    <span>{getPriorityIcon(priority)}</span>
                    <span className={getPriorityColor(priority)}>
                      {priority.charAt(0) + priority.slice(1).toLowerCase()}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.priority && (
            <p className="text-sm text-red-600">{form.formState.errors.priority.message}</p>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <X className="h-4 w-4" />
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
            {isEditing ? 'Update Ticket' : 'Create Ticket'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default TicketForm;