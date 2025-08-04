/**
 * Main App component with routing and providers
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';

function App() {
  return (
    <>
      <ColorSchemeScript defaultColorScheme="light" />
      <MantineProvider defaultColorScheme="light">
        <Router>
          <div style={{ padding: '2rem' }}>
            <h1>Tech Support System</h1>
            <Routes>
              {/* Simple routes for testing */}
              <Route path="/" element={<div>Dashboard - Coming Soon</div>} />
              <Route path="/clients" element={<div>Clients - Coming Soon</div>} />
              <Route path="/technicians" element={<div>Technicians - Coming Soon</div>} />
              <Route path="/tickets" element={<div>Tickets - Coming Soon</div>} />
              <Route path="/appointments" element={<div>Appointments - Coming Soon</div>} />
              <Route path="/reports" element={<div>Reports - Coming Soon</div>} />
              <Route path="*" element={<div>404 - Page Not Found</div>} />
            </Routes>
          </div>
        </Router>
      </MantineProvider>
    </>
  );
}

export default App;
