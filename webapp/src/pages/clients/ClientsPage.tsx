/**
 * Clients page component
 * Main page for client management
 */

import { 
  Title, 
  Text, 
  Group, 
  Button, 
  TextInput,
  Select,
  Stack
} from '@mantine/core';
import { 
  IconPlus, 
  IconSearch, 
  IconFilter 
} from '@tabler/icons-react';
import { useState } from 'react';
import { useClients } from '../../hooks';
import { DataTable, LoadingSpinner, ErrorAlert, ClientStatusBadge } from '../../components/ui';
import { Client, ClientStatus, PaginationParams } from '../../types';
import type { DataTableColumn } from '../../components/ui';

export function ClientsPage() {
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 0,
    size: 20,
    sort: 'lastName,asc'
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { 
    data: clientsData, 
    isLoading, 
    error,
    refetch
  } = useClients(pagination);

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handlePageSizeChange = (size: number) => {
    setPagination(prev => ({ ...prev, size, page: 0 }));
  };

  const columns: DataTableColumn<Client>[] = [
    {
      key: 'id',
      header: 'ID',
      width: 80
    },
    {
      key: 'fullName',
      header: 'Name',
      render: (client) => client.firstName && client.lastName 
        ? `${client.firstName} ${client.lastName}`
        : client.fullName || 'N/A'
    },
    {
      key: 'email',
      header: 'Email'
    },
    {
      key: 'phone',
      header: 'Phone'
    },
    {
      key: 'status',
      header: 'Status',
      render: (client) => (
        <ClientStatusBadge status={client.status} />
      ),
      width: 120
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (client) => new Date(client.createdAt).toLocaleDateString(),
      width: 120
    }
  ];

  if (error) {
    return (
      <ErrorAlert
        error={error}
        title="Failed to load clients"
        showRetry
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <Stack gap="xl">
      {/* Page Header */}
      <Group justify="space-between">
        <div>
          <Title order={1}>Clients</Title>
          <Text c="dimmed" size="lg">
            Manage client accounts and information
          </Text>
        </div>
        <Button
          leftSection={<IconPlus size="1rem" />}
          variant="filled"
        >
          New Client
        </Button>
      </Group>

      {/* Filters and Search */}
      <Group>
        <TextInput
          placeholder="Search clients..."
          leftSection={<IconSearch size="1rem" />}
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.currentTarget.value)}
          style={{ flexGrow: 1 }}
        />
        
        <Select
          placeholder="Filter by status"
          leftSection={<IconFilter size="1rem" />}
          data={[
            { value: '', label: 'All Statuses' },
            { value: ClientStatus.ACTIVE, label: 'Active' },
            { value: ClientStatus.SUSPENDED, label: 'Suspended' },
            { value: ClientStatus.TERMINATED, label: 'Terminated' }
          ]}
          value={statusFilter}
          onChange={(value) => setStatusFilter(value || '')}
          clearable
        />
      </Group>

      {/* Data Table */}
      <DataTable
        data={clientsData}
        columns={columns}
        loading={isLoading}
        error={error}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        emptyMessage="No clients found"
      />
    </Stack>
  );
}

export default ClientsPage;