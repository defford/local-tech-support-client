/**
 * Loading spinner component with various display options
 * Built with Mantine Loader component
 */

import { Loader, Center, Stack, Text, LoaderProps } from '@mantine/core';

export interface LoadingSpinnerProps extends LoaderProps {
  message?: string;
  centered?: boolean;
  fullPage?: boolean;
  overlay?: boolean;
}

/**
 * Basic loading spinner
 */
export function LoadingSpinner({
  message,
  centered = false,
  fullPage = false,
  overlay = false,
  size = 'md',
  color = 'blue',
  ...props
}: LoadingSpinnerProps) {
  const spinner = (
    <Stack align="center" gap="md">
      <Loader size={size} color={color} {...props} />
      {message && (
        <Text size="sm" c="dimmed">
          {message}
        </Text>
      )}
    </Stack>
  );

  if (fullPage) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: overlay ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
          zIndex: overlay ? 1000 : 'auto'
        }}
      >
        {spinner}
      </div>
    );
  }

  if (centered) {
    return (
      <Center style={{ minHeight: '200px' }}>
        {spinner}
      </Center>
    );
  }

  return spinner;
}

/**
 * Inline loading spinner for buttons or small spaces
 */
export function InlineSpinner({ size = 'xs', ...props }: LoaderProps) {
  return <Loader size={size} {...props} />;
}

/**
 * Table loading spinner
 */
export function TableLoadingSpinner({ message = 'Loading data...' }: { message?: string }) {
  return (
    <Center style={{ padding: '2rem' }}>
      <LoadingSpinner message={message} size="lg" />
    </Center>
  );
}

/**
 * Page loading spinner
 */
export function PageLoadingSpinner({ message = 'Loading page...' }: { message?: string }) {
  return (
    <LoadingSpinner
      message={message}
      size="xl"
      fullPage
      overlay
    />
  );
}

/**
 * Card loading spinner
 */
export function CardLoadingSpinner({ message }: { message?: string }) {
  return (
    <Center style={{ minHeight: '150px' }}>
      <LoadingSpinner message={message} />
    </Center>
  );
}

export default LoadingSpinner;