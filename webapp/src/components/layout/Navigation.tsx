/**
 * Navigation sidebar component with live ticket statistics badges
 */

import { 
  IconDashboard,
  IconUsers,
  IconTool,
  IconTicket,
  IconCalendar,
  IconChartBar,
  IconSettings,
  IconQuestionMark
} from '@tabler/icons-react';
import { Link, useLocation } from 'react-router-dom';
import { useTicketStatistics, useOverdueTickets } from '../../hooks/useTickets';

export interface NavigationProps {
  onLinkClick?: () => void;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: string | number;
  badgeColor?: 'urgent' | 'overdue' | 'primary';
}

// Create base navigation items (without dynamic badges)
const createMainNavItems = (ticketBadges: { count: number; color?: 'urgent' | 'overdue' | 'primary' } = { count: 0 }): NavItem[] => [
  {
    label: 'Dashboard',
    icon: <IconDashboard size={16} />,
    href: '/'
  },
  {
    label: 'Clients',
    icon: <IconUsers size={16} />,
    href: '/clients'
  },
  {
    label: 'Technicians',
    icon: <IconTool size={16} />,
    href: '/technicians'
  },
  {
    label: 'Tickets',
    icon: <IconTicket size={16} />,
    href: '/tickets',
    badge: ticketBadges.count > 0 ? ticketBadges.count : undefined,
    badgeColor: ticketBadges.color
  },
  {
    label: 'Appointments',
    icon: <IconCalendar size={16} />,
    href: '/appointments'
  },
  {
    label: 'Reports',
    icon: <IconChartBar size={16} />,
    href: '/reports'
  }
];

const bottomNavItems: NavItem[] = [
  {
    label: 'Settings',
    icon: <IconSettings size={16} />,
    href: '/settings'
  },
  {
    label: 'Help',
    icon: <IconQuestionMark size={16} />,
    href: '/help'
  }
];

export function Navigation({ onLinkClick }: NavigationProps) {
  const location = useLocation();
  
  // Fetch ticket statistics for badges
  const { data: ticketStats } = useTicketStatistics(true);
  const { data: overdueTickets } = useOverdueTickets(undefined, true);

  // Calculate ticket badge data
  const getTicketBadgeData = () => {
    if (!ticketStats && !overdueTickets?.content) {
      return { count: 0 };
    }

    // Priority: Show urgent tickets first, then overdue, then open
    const urgentCount = ticketStats?.ticketsByPriority?.['URGENT'] || 0;
    const overdueCount = overdueTickets?.content?.length || 0;
    const openCount = ticketStats?.openTickets || 0;

    if (urgentCount > 0) {
      return { count: urgentCount, color: 'urgent' as const };
    } else if (overdueCount > 0) {
      return { count: overdueCount, color: 'overdue' as const };
    } else if (openCount > 0) {
      return { count: openCount, color: 'primary' as const };
    }
    
    return { count: 0 };
  };

  const ticketBadgeData = getTicketBadgeData();
  const mainNavItems = createMainNavItems(ticketBadgeData);

  const renderNavItem = (item: NavItem) => {
    const isActive = location.pathname === item.href;

    const getBadgeClasses = (badgeColor?: 'urgent' | 'overdue' | 'primary') => {
      switch (badgeColor) {
        case 'urgent':
          return 'bg-red-500 text-white animate-pulse';
        case 'overdue':
          return 'bg-orange-500 text-white';
        case 'primary':
        default:
          return 'bg-blue-500 text-white';
      }
    };

    return (
      <Link
        key={item.href}
        to={item.href}
        onClick={onLinkClick}
        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
          isActive 
            ? 'bg-blue-100 text-blue-700 font-medium' 
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        {item.icon}
        <span>{item.label}</span>
        {item.badge && (
          <span 
            className={`ml-auto text-xs px-2 py-1 rounded-full font-medium ${getBadgeClasses(item.badgeColor)}`}
            title={
              item.badgeColor === 'urgent' 
                ? `${item.badge} urgent tickets` 
                : item.badgeColor === 'overdue' 
                ? `${item.badge} overdue tickets` 
                : `${item.badge} open tickets`
            }
          >
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        {/* Main Navigation */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Main Menu
          </h3>
          <nav className="space-y-1">
            {mainNavItems.map(renderNavItem)}
          </nav>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* System Navigation */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            System
          </h3>
          <nav className="space-y-1">
            {bottomNavItems.map(renderNavItem)}
          </nav>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* App Info */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            Tech Support System
            <br />
            v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}

export default Navigation;