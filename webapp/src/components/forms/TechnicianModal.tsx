/**
 * Technician Modal Component
 * Modal wrapper for technician creation and editing
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TechnicianForm } from './TechnicianForm';
import { Technician } from '@/types';

interface TechnicianModalProps {
  technician?: Technician;
  trigger: React.ReactNode;
  onSuccess?: (technician: Technician) => void;
  title?: string;
  description?: string;
}

export function TechnicianModal({ 
  technician, 
  trigger, 
  onSuccess, 
  title, 
  description 
}: TechnicianModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isEditing = !!technician;

  const defaultTitle = isEditing ? 'Edit Technician' : 'Create New Technician';
  const defaultDescription = isEditing 
    ? 'Update the technician information below.'
    : 'Add a new technician to the system. Fill in the required information below.';

  const handleSuccess = (updatedTechnician: Technician) => {
    setIsOpen(false);
    onSuccess?.(updatedTechnician);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title || defaultTitle}</DialogTitle>
          <DialogDescription>
            {description || defaultDescription}
          </DialogDescription>
        </DialogHeader>
        <TechnicianForm 
          technician={technician}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}

export default TechnicianModal;