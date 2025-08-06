/**
 * Main App component with routing and providers
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from './components/theme-provider';
import { AppShellLayout } from './components/layout';
import { 
  DashboardPage, 
  ClientsPage, 
  TechniciansPage,
  TechnicianDetailPage,
  TicketsPage,
  // ClientDetailPage, // TODO: Uncomment when basic version is created
  NotFoundPage 
} from './pages';

// Create a client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
      retry: (failureCount, error: unknown) => {
        // Don't retry on 4xx errors except 429 (rate limit)
        if ((error as any)?.status >= 400 && (error as any)?.status < 500 && (error as any)?.status !== 429) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: (failureCount, error: unknown) => {
        // Don't retry mutations on client errors
        if ((error as any)?.status >= 400 && (error as any)?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

// Placeholder components for pages not yet implemented
// TODO: Replace with ShadCN UI components later

const AppointmentsPage = () => (
  <div className="container mx-auto p-4">
    <h1 className="text-2xl font-bold mb-4">Appointments</h1>
    <p>Appointment management coming soon...</p>
  </div>
);

const ReportsPage = () => (
  <div className="container mx-auto p-4">
    <h1 className="text-2xl font-bold mb-4">Reports & Analytics</h1>
    <p>Reports and analytics coming soon...</p>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Router>
          <AppShellLayout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/clients" element={<ClientsPage />} />
              {/* TODO: Uncomment when basic ClientDetailPage is created */}
              {/* <Route path="/clients/:id" element={<ClientDetailPage />} /> */}
              <Route path="/technicians" element={<TechniciansPage />} />
              <Route path="/technicians/:id" element={<TechnicianDetailPage />} />
              <Route path="/tickets" element={<TicketsPage />} />
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AppShellLayout>
        </Router>
        {/* React Query DevTools - only in development */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
