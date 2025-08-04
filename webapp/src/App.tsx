/**
 * Main App component with routing and providers
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MantineProvider, ColorSchemeScript, Container, Text, Title } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AppShellLayout } from './components/layout';

// Create a client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors except 429 (rate limit)
        if (error?.status >= 400 && error?.status < 500 && error?.status !== 429) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry mutations on client errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

// Placeholder components for pages
const DashboardPage = () => (
  <Container>
    <Title order={1} mb="md">Dashboard</Title>
    <Text>Welcome to the Tech Support System</Text>
  </Container>
);

const ClientsPage = () => (
  <Container>
    <Title order={1} mb="md">Clients</Title>
    <Text>Client management coming soon...</Text>
  </Container>
);

const TechniciansPage = () => (
  <Container>
    <Title order={1} mb="md">Technicians</Title>
    <Text>Technician management coming soon...</Text>
  </Container>
);

const TicketsPage = () => (
  <Container>
    <Title order={1} mb="md">Tickets</Title>
    <Text>Ticket management coming soon...</Text>
  </Container>
);

const AppointmentsPage = () => (
  <Container>
    <Title order={1} mb="md">Appointments</Title>
    <Text>Appointment management coming soon...</Text>
  </Container>
);

const ReportsPage = () => (
  <Container>
    <Title order={1} mb="md">Reports & Analytics</Title>
    <Text>Reports and analytics coming soon...</Text>
  </Container>
);

const NotFoundPage = () => (
  <Container>
    <Title order={1} mb="md">404 - Page Not Found</Title>
    <Text>The page you're looking for doesn't exist.</Text>
  </Container>
);

function App() {
  return (
    <>
      <ColorSchemeScript defaultColorScheme="light" />
      <QueryClientProvider client={queryClient}>
        <MantineProvider defaultColorScheme="light">
          <Router>
            <AppShellLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/clients" element={<ClientsPage />} />
                <Route path="/technicians" element={<TechniciansPage />} />
                <Route path="/tickets" element={<TicketsPage />} />
                <Route path="/appointments" element={<AppointmentsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </AppShellLayout>
          </Router>
        </MantineProvider>
        {/* React Query DevTools - only in development */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </>
  );
}

export default App;
