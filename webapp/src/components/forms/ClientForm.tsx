/**
 * Client Form Component
 * Handles both creation and editing of clients with validation
 */

import {
  Stack,
  TextInput,
  Textarea,
  Select,
  Button,
  Group,
  Alert,
  LoadingOverlay
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { z } from 'zod';
import { useEffect } from 'react';
import { Client, ClientRequest, ClientStatus } from '../../types';
import { useCreateClient, useUpdateClient } from '../../hooks';

/**
 * Client form validation schema
 */
const clientFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Invalid email address').max(100, 'Email too long'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(20, 'Phone number too long'),
  address: z.string().max(200, 'Address too long').optional(),
  notes: z.string().max(500, 'Notes too long').optional(),
  status: z.nativeEnum(ClientStatus, { required_error: 'Status is required' })
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

  const form = useForm<ClientFormValues>({
    validate: zodResolver(clientFormSchema),
    initialValues: {
      firstName: client?.firstName || '',
      lastName: client?.lastName || '',
      email: client?.email || '',
      phone: client?.phone || '',
      address: client?.address || '',
      notes: client?.notes || '',
      status: client?.status || ClientStatus.ACTIVE
    }
  });

  // Update form when client prop changes
  useEffect(() => {
    if (client) {
      form.setValues({
        firstName: client.firstName || '',
        lastName: client.lastName || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        notes: client.notes || '',
        status: client.status
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  const handleSubmit = async (values: ClientFormValues) => {
    try {
      const clientData: ClientRequest = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone.trim(),
        address: values.address?.trim() || undefined,
        notes: values.notes?.trim() || undefined,
        status: values.status
      };

      let result: Client;

      if (isEditing && client) {
        result = await updateClientMutation.mutateAsync({
          id: client.id,
          data: clientData
        });
        
        notifications.show({
          title: 'Success',
          message: 'Client updated successfully',
          color: 'green',
          icon: <IconCheck size="1rem" />
        });
      } else {
        result = await createClientMutation.mutateAsync(clientData);
        
        notifications.show({
          title: 'Success',
          message: 'Client created successfully',
          color: 'green',
          icon: <IconCheck size="1rem" />
        });
        
        // Reset form for creation
        form.reset();
      }

      onSuccess?.(result);
    } catch (error) {
      console.error('Client form error:', error);
      
      notifications.show({
        title: 'Error',
        message: isEditing ? 'Failed to update client' : 'Failed to create client',
        color: 'red',
        icon: <IconX size="1rem" />
      });
    }
  };

  const isLoading = createClientMutation.isPending || updateClientMutation.isPending;

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <LoadingOverlay visible={isLoading} />
      
      <Stack gap="md">
        {/* Basic Information */}
        <Group grow>
          <TextInput
            label="First Name"
            placeholder="Enter first name"
            required
            {...form.getInputProps('firstName')}
          />
          <TextInput
            label="Last Name"
            placeholder="Enter last name"
            required
            {...form.getInputProps('lastName')}
          />
        </Group>

        <Group grow>
          <TextInput
            label="Email"
            placeholder="Enter email address"
            type="email"
            required
            {...form.getInputProps('email')}
          />
          <TextInput
            label="Phone"
            placeholder="Enter phone number"
            required
            {...form.getInputProps('phone')}
          />
        </Group>

        <TextInput
          label="Address"
          placeholder="Enter address (optional)"
          {...form.getInputProps('address')}
        />

        <Select
          label="Status"
          placeholder="Select client status"
          required
          data={[
            { value: ClientStatus.ACTIVE, label: 'Active' },
            { value: ClientStatus.SUSPENDED, label: 'Suspended' },
            { value: ClientStatus.TERMINATED, label: 'Terminated' }
          ]}
          {...form.getInputProps('status')}
        />

        <Textarea
          label="Notes"
          placeholder="Enter any additional notes (optional)"
          minRows={3}
          maxRows={6}
          {...form.getInputProps('notes')}
        />

        {/* Error Display */}
        {(createClientMutation.error || updateClientMutation.error) && (
          <Alert color="red" variant="light">
            {createClientMutation.error?.message || updateClientMutation.error?.message}
          </Alert>
        )}

        {/* Form Actions */}
        <Group justify="flex-end" mt="xl">
          {onCancel && (
            <Button
              variant="subtle"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            loading={isLoading}
            variant="filled"
          >
            {isEditing ? 'Update Client' : 'Create Client'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export default ClientForm;