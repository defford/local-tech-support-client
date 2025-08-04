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
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useEffect } from 'react';
import { Client, ClientRequest, ClientStatus } from '../../types';
import { useCreateClient, useUpdateClient } from '../../hooks';

interface ClientFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  status: ClientStatus;
}

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
    initialValues: {
      firstName: client?.firstName || '',
      lastName: client?.lastName || '',
      email: client?.email || '',
      phone: client?.phone || '',
      address: client?.address || '',
      notes: client?.notes || '',
      status: client?.status || ClientStatus.ACTIVE
    },
    validate: {
      firstName: (value) => {
        if (!value || value.trim().length === 0) return 'First name is required';
        if (value.length > 50) return 'First name too long';
        return null;
      },
      lastName: (value) => {
        if (!value || value.trim().length === 0) return 'Last name is required';
        if (value.length > 50) return 'Last name too long';
        return null;
      },
      email: (value) => {
        if (!value || value.trim().length === 0) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email address';
        if (value.length > 100) return 'Email too long';
        return null;
      },
      phone: (value) => {
        if (!value || value.trim().length === 0) return 'Phone number is required';
        if (value.length < 10) return 'Phone number must be at least 10 digits';
        if (value.length > 20) return 'Phone number too long';
        return null;
      },
      address: (value) => {
        if (value && value.length > 200) return 'Address too long';
        return null;
      },
      notes: (value) => {
        if (value && value.length > 500) return 'Notes too long';
        return null;
      },
      status: (value) => {
        if (!value) return 'Status is required';
        return null;
      }
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