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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/50 backdrop-blur-sm border-b border-border/50 px-4 py-3 sticky top-0 z-50">
        <Header opened={opened} toggle={toggle} />
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside 
          className={`bg-card/30 backdrop-blur-sm border-r border-border/50 w-64 min-h-[calc(100vh-73px)] transition-all duration-300 ease-out ${
            opened ? 'translate-x-0 shadow-xl' : '-translate-x-full md:translate-x-0 md:shadow-sm'
          }`}
        >
          <Navigation onLinkClick={() => setOpened(false)} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-gradient-to-br from-background to-muted/20 min-h-[calc(100vh-73px)]">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {opened && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm md:hidden z-40 transition-opacity duration-300"
          onClick={() => setOpened(false)}
        />
      )}
    </div>
  );
}

export default AppShellLayout;