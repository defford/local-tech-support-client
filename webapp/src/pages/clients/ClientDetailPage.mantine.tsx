// /**
//  * Client Detail Page Component
//  * Shows comprehensive client information with ticket and appointment history
//  */

// import {
//   Stack,
//   Group,
//   Title,
//   Text,
//   Card,
//   Badge,
//   Tabs,
//   Button,
//   ActionIcon,
//   Divider,
//   Grid,
//   Alert,
//   LoadingOverlay
// } from '@mantine/core';
// import {
//   IconEdit,
//   IconArrowLeft,
//   IconMail,
//   IconPhone,
//   IconMapPin,
//   IconNotes,
//   IconCalendar,
//   IconTicket,
//   IconUser,
//   IconInfoCircle
// } from '@tabler/icons-react';
// import { useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { 
//   useClient, 
//   useClientTickets, 
//   useClientAppointments 
// } from '../../hooks';
// import { 
//   DataTable, 
//   ErrorAlert, 
//   LoadingSpinner, 
//   ClientStatusBadge,
//   TicketStatusBadge,
//   AppointmentStatusBadge
// } from '../../components/ui';
// import { ClientModal } from '../../components/forms';
// import { Client, PaginationParams } from '../../types';
// import type { DataTableColumn } from '../../components/ui';

// export function ClientDetailPage() {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const clientId = parseInt(id || '0', 10);

//   const [editModalOpened, setEditModalOpened] = useState(false);
//   const [activeTab, setActiveTab] = useState<string | null>('overview');

//   const { 
//     data: client, 
//     isLoading: clientLoading, 
//     error: clientError,
//     refetch: refetchClient
//   } = useClient(clientId, !!clientId);

//   const { 
//     data: ticketsData, 
//     isLoading: ticketsLoading, 
//     error: ticketsError 
//   } = useClientTickets(clientId, { page: 0, size: 50 }, !!clientId);

//   const { 
//     data: appointmentsData, 
//     isLoading: appointmentsLoading, 
//     error: appointmentsError 
//   } = useClientAppointments(clientId, { page: 0, size: 50 }, !!clientId);

//   const handleEditSuccess = () => {
//     setEditModalOpened(false);
//     refetchClient();
//   };

//   const ticketColumns: DataTableColumn<any>[] = [
//     {
//       key: 'id',
//       header: 'ID',
//       width: 80
//     },
//     {
//       key: 'title',
//       header: 'Title'
//     },
//     {
//       key: 'status',
//       header: 'Status',
//       render: (ticket) => (
//         <TicketStatusBadge status={ticket.status} />
//       ),
//       width: 120
//     },
//     {
//       key: 'priority',
//       header: 'Priority',
//       render: (ticket) => (
//         <Badge color={ticket.priority === 'HIGH' ? 'red' : ticket.priority === 'MEDIUM' ? 'yellow' : 'blue'}>
//           {ticket.priority}
//         </Badge>
//       ),
//       width: 100
//     },
//     {
//       key: 'createdAt',
//       header: 'Created',
//       render: (ticket) => new Date(ticket.createdAt).toLocaleDateString(),
//       width: 120
//     }
//   ];

//   const appointmentColumns: DataTableColumn<any>[] = [
//     {
//       key: 'id',
//       header: 'ID',
//       width: 80
//     },
//     {
//       key: 'title',
//       header: 'Title'
//     },
//     {
//       key: 'status',
//       header: 'Status',
//       render: (appointment) => (
//         <AppointmentStatusBadge status={appointment.status} />
//       ),
//       width: 120
//     },
//     {
//       key: 'scheduledDate',
//       header: 'Scheduled Date',
//       render: (appointment) => new Date(appointment.scheduledDate).toLocaleString(),
//       width: 160
//     },
//     {
//       key: 'technician',
//       header: 'Technician',
//       render: (appointment) => appointment.technician?.firstName && appointment.technician?.lastName
//         ? `${appointment.technician.firstName} ${appointment.technician.lastName}`
//         : 'Unassigned'
//     }
//   ];

//   if (clientLoading) {
//     return <LoadingSpinner />;
//   }

//   if (clientError || !client) {
//     return (
//       <ErrorAlert
//         error={clientError}
//         title="Failed to load client"
//         showRetry
//         onRetry={() => refetchClient()}
//       />
//     );
//   }

//   return (
//     <Stack gap="xl">
//       {/* Header */}
//       <Group justify="space-between">
//         <Group>
//           <ActionIcon
//             variant="subtle"
//             color="gray"
//             onClick={() => navigate('/clients')}
//           >
//             <IconArrowLeft size="1.2rem" />
//           </ActionIcon>
//           <div>
//             <Title order={1}>
//               {client.firstName} {client.lastName}
//             </Title>
//             <Text c="dimmed" size="lg">
//               Client Details
//             </Text>
//           </div>
//         </Group>
        
//         <Button
//           leftSection={<IconEdit size="1rem" />}
//           onClick={() => setEditModalOpened(true)}
//         >
//           Edit Client
//         </Button>
//       </Group>

//       {/* Client Information Cards */}
//       <Grid>
//         <Grid.Col span={{ base: 12, md: 8 }}>
//           <Card withBorder>
//             <Stack gap="md">
//               <Group justify="space-between">
//                 <Title order={3}>Client Information</Title>
//                 <ClientStatusBadge status={client.status} />
//               </Group>
              
//               <Divider />
              
//               <Grid>
//                 <Grid.Col span={6}>
//                   <Group gap="xs">
//                     <IconUser size="1rem" />
//                     <div>
//                       <Text size="sm" c="dimmed">Full Name</Text>
//                       <Text>{client.firstName} {client.lastName}</Text>
//                     </div>
//                   </Group>
//                 </Grid.Col>
                
//                 <Grid.Col span={6}>
//                   <Group gap="xs">
//                     <IconMail size="1rem" />
//                     <div>
//                       <Text size="sm" c="dimmed">Email</Text>
//                       <Text>{client.email}</Text>
//                     </div>
//                   </Group>
//                 </Grid.Col>
                
//                 <Grid.Col span={6}>
//                   <Group gap="xs">
//                     <IconPhone size="1rem" />
//                     <div>
//                       <Text size="sm" c="dimmed">Phone</Text>
//                       <Text>{client.phone}</Text>
//                     </div>
//                   </Group>
//                 </Grid.Col>
                
//                 <Grid.Col span={6}>
//                   <Group gap="xs">
//                     <IconCalendar size="1rem" />
//                     <div>
//                       <Text size="sm" c="dimmed">Member Since</Text>
//                       <Text>{new Date(client.createdAt).toLocaleDateString()}</Text>
//                     </div>
//                   </Group>
//                 </Grid.Col>
                
//                 {client.address && (
//                   <Grid.Col span={12}>
//                     <Group gap="xs">
//                       <IconMapPin size="1rem" />
//                       <div>
//                         <Text size="sm" c="dimmed">Address</Text>
//                         <Text>{client.address}</Text>
//                       </div>
//                     </Group>
//                   </Grid.Col>
//                 )}
                
//                 {client.notes && (
//                   <Grid.Col span={12}>
//                     <Group gap="xs" align="flex-start">
//                       <IconNotes size="1rem" />
//                       <div>
//                         <Text size="sm" c="dimmed">Notes</Text>
//                         <Text>{client.notes}</Text>
//                       </div>
//                     </Group>
//                   </Grid.Col>
//                 )}
//               </Grid>
//             </Stack>
//           </Card>
//         </Grid.Col>
        
//         <Grid.Col span={{ base: 12, md: 4 }}>
//           <Card withBorder>
//             <Stack gap="md">
//               <Title order={3}>Quick Stats</Title>
//               <Divider />
              
//               <Group justify="space-between">
//                 <Text size="sm" c="dimmed">Total Tickets</Text>
//                 <Badge color="blue" variant="light">
//                   {ticketsData?.totalElements || 0}
//                 </Badge>
//               </Group>
              
//               <Group justify="space-between">
//                 <Text size="sm" c="dimmed">Total Appointments</Text>
//                 <Badge color="green" variant="light">
//                   {appointmentsData?.totalElements || 0}
//                 </Badge>
//               </Group>
              
//               <Group justify="space-between">
//                 <Text size="sm" c="dimmed">Account Status</Text>
//                 <ClientStatusBadge status={client.status} size="sm" />
//               </Group>
              
//               <Group justify="space-between">
//                 <Text size="sm" c="dimmed">Last Updated</Text>
//                 <Text size="sm">{new Date(client.updatedAt).toLocaleDateString()}</Text>
//               </Group>
//             </Stack>
//           </Card>
//         </Grid.Col>
//       </Grid>

//       {/* Tabs for History */}
//       <Tabs value={activeTab} onChange={setActiveTab}>
//         <Tabs.List>
//           <Tabs.Tab value="overview" leftSection={<IconInfoCircle size="0.8rem" />}>
//             Overview
//           </Tabs.Tab>
//           <Tabs.Tab value="tickets" leftSection={<IconTicket size="0.8rem" />}>
//             Tickets ({ticketsData?.totalElements || 0})
//           </Tabs.Tab>
//           <Tabs.Tab value="appointments" leftSection={<IconCalendar size="0.8rem" />}>
//             Appointments ({appointmentsData?.totalElements || 0})
//           </Tabs.Tab>
//         </Tabs.List>

//         <Tabs.Panel value="overview" pt="md">
//           <Card withBorder>
//             <Stack gap="md">
//               <Title order={4}>Account Overview</Title>
//               <Text c="dimmed">
//                 This client has been with us since {new Date(client.createdAt).toLocaleDateString()}.
//                 They have {ticketsData?.totalElements || 0} tickets and {appointmentsData?.totalElements || 0} appointments on record.
//               </Text>
              
//               {client.status !== 'ACTIVE' && (
//                 <Alert icon={<IconInfoCircle size="1rem" />} color="orange">
//                   This client account is currently {client.status.toLowerCase()}.
//                 </Alert>
//               )}
//             </Stack>
//           </Card>
//         </Tabs.Panel>

//         <Tabs.Panel value="tickets" pt="md">
//           <Card withBorder>
//             <Stack gap="md">
//               <Group justify="space-between">
//                 <Title order={4}>Ticket History</Title>
//                 <Button size="sm" variant="light">
//                   Create New Ticket
//                 </Button>
//               </Group>
              
//               {ticketsError ? (
//                 <ErrorAlert
//                   error={ticketsError}
//                   title="Failed to load tickets"
//                 />
//               ) : (
//                 <DataTable
//                   data={ticketsData}
//                   columns={ticketColumns}
//                   loading={ticketsLoading}
//                   emptyMessage="No tickets found for this client"
//                 />
//               )}
//             </Stack>
//           </Card>
//         </Tabs.Panel>

//         <Tabs.Panel value="appointments" pt="md">
//           <Card withBorder>
//             <Stack gap="md">
//               <Group justify="space-between">
//                 <Title order={4}>Appointment History</Title>
//                 <Button size="sm" variant="light">
//                   Schedule Appointment
//                 </Button>
//               </Group>
              
//               {appointmentsError ? (
//                 <ErrorAlert
//                   error={appointmentsError}
//                   title="Failed to load appointments"
//                 />
//               ) : (
//                 <DataTable
//                   data={appointmentsData}
//                   columns={appointmentColumns}
//                   loading={appointmentsLoading}
//                   emptyMessage="No appointments found for this client"
//                 />
//               )}
//             </Stack>
//           </Card>
//         </Tabs.Panel>
//       </Tabs>

//       {/* Edit Modal */}
//       <ClientModal
//         opened={editModalOpened}
//         onClose={() => setEditModalOpened(false)}
//         client={client}
//         onSuccess={handleEditSuccess}
//       />
//     </Stack>
//   );
// }

// export default ClientDetailPage;