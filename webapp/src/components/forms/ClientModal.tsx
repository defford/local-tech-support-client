/**
 * Client Modal Component (ShadCN UI)
 * Modal wrapper for ClientForm with better UX
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Client } from '../../types';
import { ClientForm } from './ClientForm';

interface ClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client;
  onSuccess?: (client: Client) => void;
}

export function ClientModal({ open, onOpenChange, client, onSuccess }: ClientModalProps) {
  const isEditing = !!client;

  const handleSuccess = (savedClient: Client) => {
    onSuccess?.(savedClient);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Client' : 'Create New Client'}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <ClientForm
            client={client}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ClientModal;