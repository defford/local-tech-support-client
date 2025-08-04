/**
 * Client Modal Component
 * Modal wrapper for ClientForm with better UX
 */

import { Modal } from '@mantine/core';
import { Client } from '../../types';
import { ClientForm } from './ClientForm';

interface ClientModalProps {
  opened: boolean;
  onClose: () => void;
  client?: Client;
  onSuccess?: (client: Client) => void;
}

export function ClientModal({ opened, onClose, client, onSuccess }: ClientModalProps) {
  const isEditing = !!client;

  const handleSuccess = (savedClient: Client) => {
    onSuccess?.(savedClient);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? 'Edit Client' : 'Create New Client'}
      size="lg"
      centered
    >
      <ClientForm
        client={client}
        onSuccess={handleSuccess}
        onCancel={onClose}
      />
    </Modal>
  );
}

export default ClientModal;