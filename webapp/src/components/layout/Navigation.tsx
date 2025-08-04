/**
 * Navigation sidebar component
 */

import { 
  NavLink, 
  ScrollArea, 
  Text, 
  Divider, 
  Group,
  Badge
} from '@mantine/core';
import { 
  IconDashboard,
  IconUsers,
  IconTool,
  IconTicket,
  IconCalendar,
  IconChartBar,
  IconHome,
  IconSettings,
  IconQuestionMark
} from '@tabler/icons-react';
import { Link, useLocation } from 'react-router-dom';

export interface NavigationProps {
  onLinkClick?: () => void;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: string | number;
  color?: string;
}

const mainNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: <IconDashboard size="1rem" />,
    href: '/',
    color: 'blue'
  },
  {
    label: 'Clients',
    icon: <IconUsers size="1rem" />,
    href: '/clients',
    color: 'green'
  },
  {
    label: 'Technicians',
    icon: <IconTool size="1rem" />,
    href: '/technicians',
    color: 'orange'
  },
  {
    label: 'Tickets',
    icon: <IconTicket size="1rem" />,
    href: '/tickets',
    color: 'red'
  },
  {
    label: 'Appointments',
    icon: <IconCalendar size="1rem" />,
    href: '/appointments',
    color: 'purple'
  },
  {
    label: 'Reports',
    icon: <IconChartBar size="1rem" />,
    href: '/reports',
    color: 'cyan'
  }
];

const bottomNavItems: NavItem[] = [
  {
    label: 'Settings',
    icon: <IconSettings size="1rem" />,
    href: '/settings',
    color: 'gray'
  },
  {
    label: 'Help',
    icon: <IconQuestionMark size="1rem" />,
    href: '/help',
    color: 'gray'
  }
];

export function Navigation({ onLinkClick }: NavigationProps) {
  const location = useLocation();

  const renderNavItem = (item: NavItem) => {
    const isActive = location.pathname === item.href;

    return (
      <NavLink
        key={item.href}
        component={Link}
        to={item.href}
        label={item.label}
        leftSection={item.icon}
        rightSection={
          item.badge ? (
            <Badge size="xs" variant="filled" color={item.color}>
              {item.badge}
            </Badge>
          ) : null
        }
        active={isActive}
        color={item.color}
        variant="filled"
        onClick={onLinkClick}
      />
    );
  };

  return (
    <ScrollArea style={{ height: '100%' }}>
      <div style={{ padding: '1rem' }}>
        {/* Main Navigation */}
        <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="sm">
          Main Menu
        </Text>
        
        {mainNavItems.map(renderNavItem)}

        <Divider my="md" />

        {/* System Navigation */}
        <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="sm">
          System
        </Text>
        
        {bottomNavItems.map(renderNavItem)}

        <Divider my="md" />

        {/* App Info */}
        <Group justify="center" mt="xl">
          <Text size="xs" c="dimmed" ta="center">
            Tech Support System
            <br />
            v1.0.0
          </Text>
        </Group>
      </div>
    </ScrollArea>
  );
}

export default Navigation;