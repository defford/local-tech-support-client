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
  Stack,
  ActionIcon,
  Menu
} from '@mantine/core';
import { 
  IconPlus, 
  IconSearch, 
  IconFilter,
  IconEdit,
  IconEye,
  IconDots,
  IconUserCheck,
  IconUserX,
  IconTrash
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClients, useClientSearch, useActivateClient, useSuspendClient, useDeleteClient } from '../../hooks';
import { DataTable, ErrorAlert, ClientStatusBadge } from '../../components/ui';
import { ClientModal } from '../../components/forms';
import { TestModal } from '../../components/forms/TestModal';
import { SimpleTestModal } from '../../components/forms/SimpleTestModal';
import { Client, ClientStatus, PaginationParams } from '../../types';
import type { DataTableColumn } from '../../components/ui';

export function ClientsPage() {
  const navigate = useNavigate();
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 0,
    size: 20,
    sort: 'lastName,asc'
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [modalOpened, setModalOpened] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset pagination when search/filter changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 0 }));
  }, [debouncedSearch, statusFilter]);

  // Construct search params when filters are applied
  const searchParams = debouncedSearch.trim() || statusFilter ? {
    query: debouncedSearch.trim(),
    status: statusFilter || undefined,
    ...pagination
  } : undefined;

  const { 
    data: clientsData, 
    isLoading, 
    error,
    refetch
  } = searchParams ? 
    useClientSearch(searchParams) : 
    useClients(pagination);

  const activateClientMutation = useActivateClient();
  const suspendClientMutation = useSuspendClient();
  const deleteClientMutation = useDeleteClient();

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handlePageSizeChange = (size: number) => {
    setPagination(prev => ({ ...prev, size, page: 0 }));
  };

  const handleCreateClient = () => {
    console.log('🚀 handleCreateClient called');
    console.log('📝 modalOpened before:', modalOpened);
    setEditingClient(undefined);
    setModalOpened(true);
    console.log('📝 modalOpened should now be true');
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setModalOpened(true);
  };

  const handleViewClient = (client: Client) => {
    navigate(`/clients/${client.id}`);
  };

  const handleActivateClient = async (client: Client) => {
    try {
      await activateClientMutation.mutateAsync(client.id);
    } catch (error) {
      console.error('Failed to activate client:', error);
    }
  };

  const handleSuspendClient = async (client: Client) => {
    try {
      await suspendClientMutation.mutateAsync(client.id);
    } catch (error) {
      console.error('Failed to suspend client:', error);
    }
  };

  const handleDeleteClient = async (client: Client) => {
    if (window.confirm(`Are you sure you want to delete ${client.firstName} ${client.lastName}?`)) {
      try {
        await deleteClientMutation.mutateAsync(client.id);
      } catch (error) {
        console.error('Failed to delete client:', error);
      }
    }
  };

  const handleModalSuccess = () => {
    setModalOpened(false);
    setEditingClient(undefined);
    refetch();
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
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (client) => (
        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            color="blue"
            onClick={() => handleViewClient(client)}
            size="sm"
          >
            <IconEye size="1rem" />
          </ActionIcon>
          
          <Menu shadow="md" width={180}>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" size="sm">
                <IconDots size="1rem" />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconEdit size="0.875rem" />}
                onClick={() => handleEditClient(client)}
              >
                Edit Client
              </Menu.Item>
              
              {client.status !== ClientStatus.ACTIVE ? (
                <Menu.Item
                  leftSection={<IconUserCheck size="0.875rem" />}
                  onClick={() => handleActivateClient(client)}
                  disabled={activateClientMutation.isPending}
                >
                  Activate
                </Menu.Item>
              ) : (
                <Menu.Item
                  leftSection={<IconUserX size="0.875rem" />}
                  onClick={() => handleSuspendClient(client)}
                  disabled={suspendClientMutation.isPending}
                >
                  Suspend
                </Menu.Item>
              )}
              
              <Menu.Divider />
              
              <Menu.Item
                color="red"
                leftSection={<IconTrash size="0.875rem" />}
                onClick={() => handleDeleteClient(client)}
                disabled={deleteClientMutation.isPending}
              >
                Delete Client
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      ),
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
          onClick={handleCreateClient}
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

      {/* Test Modal - for debugging */}
      <TestModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
      />
      
      {/* Client Modal */}
      {/* <ClientModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        client={editingClient}
        onSuccess={handleModalSuccess}
      /> */}
    </Stack>
  );
}

export default ClientsPage;