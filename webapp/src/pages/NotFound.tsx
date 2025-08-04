/**
 * 404 Not Found page component
 */

import { 
  Container,
  Title,
  Text,
  Button,
  Group,
  Center,
  Stack
} from '@mantine/core';
import { IconHome, IconArrowLeft } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Container size="md">
      <Center style={{ minHeight: '70vh' }}>
        <Stack align="center" gap="xl">
          <div style={{ textAlign: 'center' }}>
            <Title
              order={1}
              size="8rem"
              fw={900}
              c="blue.6"
              style={{ lineHeight: 1 }}
            >
              404
            </Title>
            <Title order={2} size="2rem" fw={700} mt="sm">
              Page Not Found
            </Title>
            <Text c="dimmed" size="lg" mt="md" maw={500}>
              The page you are looking for might have been removed, 
              had its name changed, or is temporarily unavailable.
            </Text>
          </div>

          <Group>
            <Button
              component={Link}
              to="/"
              leftSection={<IconHome size="1rem" />}
              variant="filled"
              size="md"
            >
              Go to Dashboard
            </Button>
            <Button
              onClick={() => navigate(-1)}
              leftSection={<IconArrowLeft size="1rem" />}
              variant="light"
              size="md"
            >
              Go Back
            </Button>
          </Group>
        </Stack>
      </Center>
    </Container>
  );
}

export default NotFoundPage;