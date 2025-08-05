/**
 * Client Form Component (ShadCN UI)
 * Handles both creation and editing of clients with validation
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';

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

import { Client, ClientRequest, ClientStatus } from '../../types';
import { useCreateClient, useUpdateClient } from '../../hooks';

const clientFormSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name too long'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name too long'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(100, 'Email too long'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number too long'),
  address: z.string().max(200, 'Address too long').optional(),
  notes: z.string().max(500, 'Notes too long').optional(),
  status: z.nativeEnum(ClientStatus, { message: 'Status is required' }),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

interface ClientFormProps {
  client?: Client;
  onSuccess?: (client: Client) => void;
  onCancel?: () => void;
}

export function ClientForm({ client, onSuccess, onCancel }: ClientFormProps) {
  const isEditing = !!client;
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      firstName: client?.firstName || '',
      lastName: client?.lastName || '',
      email: client?.email || '',
      phone: client?.phone || '',
      address: client?.address || '',
      notes: client?.notes || '',
      status: client?.status || ClientStatus.ACTIVE,
    },
  });

  // Update form when client prop changes
  useEffect(() => {
    if (client) {
      form.reset({
        firstName: client.firstName || '',
        lastName: client.lastName || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        notes: client.notes || '',
        status: client.status,
      });
    }
  }, [client, form]);

  const handleSubmit = async (values: ClientFormValues) => {
    try {
      const clientData: ClientRequest = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone.trim(),
        address: values.address?.trim() || undefined,
        notes: values.notes?.trim() || undefined,
        status: values.status,
      };

      let result: Client;

      if (isEditing && client) {
        result = await updateClientMutation.mutateAsync({
          id: client.id,
          data: clientData,
        });
      } else {
        result = await createClientMutation.mutateAsync(clientData);
        form.reset();
      }

      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      onSuccess?.(result);
    } catch (error) {
      console.error('Client form error:', error);
    }
  };

  const isLoading = createClientMutation.isPending || updateClientMutation.isPending;
  const error = createClientMutation.error || updateClientMutation.error;

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
              Client {isEditing ? 'updated' : 'created'} successfully
            </AlertDescription>
          </Alert>
        )}

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              placeholder="Enter first name"
              {...form.register('firstName')}
              disabled={isLoading}
            />
            {form.formState.errors.firstName && (
              <p className="text-sm text-red-600">{form.formState.errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              placeholder="Enter last name"
              {...form.register('lastName')}
              disabled={isLoading}
            />
            {form.formState.errors.lastName && (
              <p className="text-sm text-red-600">{form.formState.errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              {...form.register('email')}
              disabled={isLoading}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              placeholder="Enter phone number"
              {...form.register('phone')}
              disabled={isLoading}
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            placeholder="Enter address (optional)"
            {...form.register('address')}
            disabled={isLoading}
          />
          {form.formState.errors.address && (
            <p className="text-sm text-red-600">{form.formState.errors.address.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={form.watch('status')}
            onValueChange={(value) => form.setValue('status', value as ClientStatus)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select client status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ClientStatus.ACTIVE}>Active</SelectItem>
              <SelectItem value={ClientStatus.SUSPENDED}>Suspended</SelectItem>
              <SelectItem value={ClientStatus.TERMINATED}>Terminated</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.status && (
            <p className="text-sm text-red-600">{form.formState.errors.status.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Enter any additional notes (optional)"
            rows={4}
            {...form.register('notes')}
            disabled={isLoading}
          />
          {form.formState.errors.notes && (
            <p className="text-sm text-red-600">{form.formState.errors.notes.message}</p>
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
            {isEditing ? 'Update Client' : 'Create Client'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ClientForm;