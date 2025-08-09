/**
 * Application header component
 * Basic HTML implementation - TODO: Replace with ShadCN UI components
 */

// Removed unused notification and avatar icons per design update
import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export interface HeaderProps {
  opened: boolean;
  toggle: () => void;
}

export function Header({ opened, toggle }: HeaderProps) {
  const { setTheme, resolvedTheme } = useTheme();
  // Theme toggle: Coast light/dark

  const applyTheme = (themeKey: string) => {
    const root = document.documentElement;
    // Always ensure coast theme variables are active
    root.classList.add('theme-coast');
    // Enable smooth transition for this toggle only
    root.classList.add('theme-animating');
    // Toggle dark class via next-themes convention
    if (themeKey === 'coast-dark') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
    sessionStorage.setItem('active-theme', themeKey);
    // Remove animating class after transition
    window.setTimeout(() => {
      root.classList.remove('theme-animating');
    }, 240);
  };

  // Restore on mount
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem('active-theme') : null;
    const root = document.documentElement;
    root.classList.add('theme-coast');
    if (saved === 'coast-dark') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []);

  return (
    <div className="flex items-center justify-between h-full">
      <div className="flex items-center gap-3">
        {/* Burger Menu - now visible on all breakpoints */}
        <button
          onClick={toggle}
          className="p-2 rounded-md hover:bg-gray-100"
          aria-label="Toggle navigation"
        >
          <div className="w-5 h-5 flex flex-col justify-center">
            <span className={`block h-0.5 w-5 bg-foreground/70 transition-transform ${opened ? 'rotate-45 translate-y-1' : ''}`} />
            <span className={`block h-0.5 w-5 bg-foreground/70 mt-1 transition-opacity ${opened ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-5 bg-foreground/70 mt-1 transition-transform ${opened ? '-rotate-45 -translate-y-1' : ''}`} />
          </div>
        </button>

        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Tech Support System
        </h1>
      </div>

      {/* Sun/Moon theme toggle */}
      <button
        type="button"
        aria-label="Toggle theme"
        onClick={() => applyTheme(resolvedTheme === 'dark' ? 'coast-light' : 'coast-dark')}
        className="relative h-6 w-12 rounded-full bg-muted border border-border flex items-center px-1 transition-colors"
     >
        {/* Icons */}
        <Sun className="h-3.5 w-3.5 text-foreground/80" />
        <Moon className="h-3.5 w-3.5 text-foreground/80 ml-auto" />
        {/* Thumb */}
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform ${
            resolvedTheme === 'dark' ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export default Header;