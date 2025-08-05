/**
 * Application header component
 * Basic HTML implementation - TODO: Replace with ShadCN UI components
 */

import { IconUser, IconBell } from '@tabler/icons-react';

export interface HeaderProps {
  opened: boolean;
  toggle: () => void;
}

export function Header({ opened, toggle }: HeaderProps) {
  return (
    <div className="flex items-center justify-between h-full">
      <div className="flex items-center gap-3">
        {/* Burger Menu for Mobile */}
        <button
          onClick={toggle}
          className="p-2 rounded-md hover:bg-gray-100 md:hidden"
          aria-label="Toggle navigation"
        >
          <div className="w-5 h-5 flex flex-col justify-center">
            <span className={`block h-0.5 w-5 bg-gray-600 transition-transform ${opened ? 'rotate-45 translate-y-1' : ''}`} />
            <span className={`block h-0.5 w-5 bg-gray-600 mt-1 transition-opacity ${opened ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-5 bg-gray-600 mt-1 transition-transform ${opened ? '-rotate-45 -translate-y-1' : ''}`} />
          </div>
        </button>
        
        <h1 className="text-xl font-semibold text-blue-600">
          Tech Support System
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications - TODO: Add dropdown with ShadCN UI */}
        <button 
          className="p-2 rounded-md hover:bg-gray-100"
          title="Notifications"
        >
          <IconBell size={20} />
        </button>

        {/* User Menu - TODO: Add dropdown with ShadCN UI */}
        <button 
          className="p-2 rounded-md hover:bg-gray-100"
          title="User menu"
        >
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <IconUser size={16} />
          </div>
        </button>
      </div>
    </div>
  );
}

export default Header;