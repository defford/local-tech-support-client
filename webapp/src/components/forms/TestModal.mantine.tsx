/**
 * Simple test modal to debug modal issues
 */

import { Modal, Button, Text } from '@mantine/core';

interface TestModalProps {
  opened: boolean;
  onClose: () => void;
}

export function TestModal({ opened, onClose }: TestModalProps) {
  console.log('🔧 TestModal render - opened:', opened);
  
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Test Modal"
      size="sm"
      centered
      zIndex={10000}
      styles={{
        root: { 
          backgroundColor: 'rgba(255, 0, 0, 0.5)', // Red overlay for debugging
        },
        content: {
          backgroundColor: 'white',
          border: '5px solid red', // Red border for visibility
          zIndex: 10001
        }
      }}
    >
      <Text>This is a test modal to check if modals are working.</Text>
      <Button onClick={onClose} mt="md">
        Close
      </Button>
    </Modal>
  );
}