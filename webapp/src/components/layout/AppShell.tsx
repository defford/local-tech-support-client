/**
 * Main application shell layout
 * Basic HTML layout - TODO: Replace with ShadCN UI components
 */

import { useState } from 'react';
import { Navigation } from './Navigation';
import { Header } from './Header';

export interface AppShellLayoutProps {
  children: React.ReactNode;
}

export function AppShellLayout({ children }: AppShellLayoutProps) {
  const [opened, setOpened] = useState(false);
  const toggle = () => setOpened(!opened);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <Header opened={opened} toggle={toggle} />
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside 
          className={`bg-white border-r border-gray-200 w-64 min-h-screen transition-transform duration-200 ${
            opened ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <Navigation onLinkClick={() => setOpened(false)} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {opened && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40"
          onClick={() => setOpened(false)}
        />
      )}
    </div>
  );
}

export default AppShellLayout;