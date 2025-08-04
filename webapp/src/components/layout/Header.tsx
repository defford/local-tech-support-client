/**
 * Application header component
 */

import { 
  Group, 
  Burger, 
  Title, 
  ActionIcon, 
  Menu, 
  Avatar, 
  Text,
  useMantineColorScheme,
  rem
} from '@mantine/core';
import { 
  IconSun, 
  IconMoon, 
  IconSettings, 
  IconLogout, 
  IconUser,
  IconBell
} from '@tabler/icons-react';

export interface HeaderProps {
  opened: boolean;
  toggle: () => void;
}

export function Header({ opened, toggle }: HeaderProps) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <Group h="100%" px="md" justify="space-between">
      <Group>
        <Burger 
          opened={opened} 
          onClick={toggle} 
          hiddenFrom="sm" 
          size="sm" 
        />
        <Title size={rem(24)} c="blue.6">
          Tech Support System
        </Title>
      </Group>

      <Group>
        {/* Color scheme toggle */}
        <ActionIcon
          variant="subtle"
          size="lg"
          onClick={() => toggleColorScheme()}
          title={`Switch to ${colorScheme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {colorScheme === 'dark' ? (
            <IconSun size="1.2rem" />
          ) : (
            <IconMoon size="1.2rem" />
          )}
        </ActionIcon>

        {/* Notifications */}
        <ActionIcon
          variant="subtle"
          size="lg"
          title="Notifications"
        >
          <IconBell size="1.2rem" />
        </ActionIcon>

        {/* User menu */}
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <ActionIcon variant="subtle" size="lg">
              <Avatar size="sm" radius="xl">
                <IconUser size="1rem" />
              </Avatar>
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Account</Menu.Label>
            <Menu.Item leftSection={<IconUser size="0.9rem" />}>
              Profile
            </Menu.Item>
            <Menu.Item leftSection={<IconSettings size="0.9rem" />}>
              Settings
            </Menu.Item>
            
            <Menu.Divider />
            
            <Menu.Item 
              leftSection={<IconLogout size="0.9rem" />}
              color="red"
            >
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
}

export default Header;