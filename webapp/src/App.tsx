/**
 * Main App component with routing and providers
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
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
  TicketDetailPage,
  AppointmentsPage,
  AppointmentDetailPage,
  ClientDetailPage,
  NotFoundPage,
  ReportsPage 
} from './pages';

// Simple lazy wrapper that returns an element for Routes
const lazyLoad = (loader: Parameters<typeof lazy>[0]) => {
  const C = lazy(loader);
  return (
    <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading…</div>}>
      <C />
    </Suspense>
  );
};

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
              <Route path="/clients/:id" element={<ClientDetailPage />} />
              <Route path="/technicians" element={<TechniciansPage />} />
              <Route path="/technicians/:id" element={<TechnicianDetailPage />} />
              <Route path="/tickets" element={<TicketsPage />} />
              <Route path="/tickets/:id" element={<TicketDetailPage />} />
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/appointments/:id" element={<AppointmentDetailPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/reports/available-technicians" element={lazyLoad(() => import('./pages/reports/AvailableTechniciansReport'))} />
              <Route path="/reports/overdue-tickets" element={lazyLoad(() => import('./pages/reports/OverdueTicketsReport'))} />
              <Route path="/reports/technician-workload" element={lazyLoad(() => import('./pages/reports/TechnicianWorkloadReport'))} />
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
