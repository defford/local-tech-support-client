/**
 * Technician Form Component (ShadCN UI)
 * Handles both creation and editing of technicians with validation
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { Check, X, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

import { Technician, TechnicianRequest, TechnicianStatus } from '../../types';
import { useCreateTechnician, useUpdateTechnician } from '../../hooks';

const technicianFormSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name too long'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name too long'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(100, 'Email too long'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number too long'),
  status: z.nativeEnum(TechnicianStatus, { message: 'Status is required' }),
  skills: z.array(z.string().min(1, 'Skill cannot be empty')).min(1, 'At least one skill is required'),
});

type TechnicianFormValues = z.infer<typeof technicianFormSchema>;

interface TechnicianFormProps {
  technician?: Technician;
  onSuccess?: (technician: Technician) => void;
  onCancel?: () => void;
}

export function TechnicianForm({ technician, onSuccess, onCancel }: TechnicianFormProps) {
  const isEditing = !!technician;
  const createTechnicianMutation = useCreateTechnician();
  const updateTechnicianMutation = useUpdateTechnician();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  const form = useForm<TechnicianFormValues>({
    resolver: zodResolver(technicianFormSchema),
    defaultValues: {
      firstName: technician?.firstName || '',
      lastName: technician?.lastName || '',
      email: technician?.email || '',
      phone: technician?.phone || '',
      status: technician?.status || TechnicianStatus.ACTIVE,
      skills: technician?.skills || [],
    },
  });

  // Update form when technician prop changes
  useEffect(() => {
    if (technician) {
      form.reset({
        firstName: technician.firstName || '',
        lastName: technician.lastName || '',
        email: technician.email || '',
        phone: technician.phone || '',
        status: technician.status,
        skills: technician.skills || [],
      });
    }
  }, [technician, form]);

  const handleAddSkill = () => {
    const skillToAdd = newSkill.trim();
    if (skillToAdd && !form.getValues('skills').includes(skillToAdd)) {
      const currentSkills = form.getValues('skills');
      form.setValue('skills', [...currentSkills, skillToAdd]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const currentSkills = form.getValues('skills');
    form.setValue('skills', currentSkills.filter(skill => skill !== skillToRemove));
  };

  const handleSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSubmit = async (values: TechnicianFormValues) => {
    try {
      const technicianData: TechnicianRequest = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone.trim(),
        status: values.status,
        skills: values.skills.map(skill => skill.trim()).filter(skill => skill.length > 0),
      };

      let result: Technician;

      if (isEditing && technician) {
        result = await updateTechnicianMutation.mutateAsync({
          id: technician.id,
          data: technicianData,
        });
      } else {
        result = await createTechnicianMutation.mutateAsync(technicianData);
        form.reset();
        setNewSkill('');
      }

      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      onSuccess?.(result);
    } catch (error) {
      console.error('Technician form error:', error);
    }
  };

  const isLoading = createTechnicianMutation.isPending || updateTechnicianMutation.isPending;
  const error = createTechnicianMutation.error || updateTechnicianMutation.error;
  const currentSkills = form.watch('skills');

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Success Message */}
        {showSuccessMessage && (
          <Alert className="border-green-200 bg-green-50">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Technician {isEditing ? 'updated' : 'created'} successfully
            </AlertDescription>
          </Alert>
        )}

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              placeholder="Enter first name"
              {...form.register('firstName')}
              disabled={isLoading}
            />
            {form.formState.errors.firstName && (
              <p className="text-sm text-red-600">{form.formState.errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              placeholder="Enter last name"
              {...form.register('lastName')}
              disabled={isLoading}
            />
            {form.formState.errors.lastName && (
              <p className="text-sm text-red-600">{form.formState.errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              {...form.register('email')}
              disabled={isLoading}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              placeholder="Enter phone number"
              {...form.register('phone')}
              disabled={isLoading}
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={form.watch('status')}
            onValueChange={(value) => form.setValue('status', value as TechnicianStatus)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select technician status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TechnicianStatus.ACTIVE}>Active</SelectItem>
              <SelectItem value={TechnicianStatus.ON_VACATION}>On Vacation</SelectItem>
              <SelectItem value={TechnicianStatus.SICK_LEAVE}>Sick Leave</SelectItem>
              <SelectItem value={TechnicianStatus.TERMINATED}>Terminated</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.status && (
            <p className="text-sm text-red-600">{form.formState.errors.status.message}</p>
          )}
        </div>

        {/* Skills Section */}
        <div className="space-y-3">
          <Label>Skills *</Label>
          
          {/* Current Skills */}
          {currentSkills.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/30">
              {currentSkills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-1 hover:text-destructive"
                    disabled={isLoading}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Add New Skill */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter a skill (e.g., Hardware, Software, Network)"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={handleSkillKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleAddSkill}
              disabled={isLoading || !newSkill.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {form.formState.errors.skills && (
            <p className="text-sm text-red-600">{form.formState.errors.skills.message}</p>
          )}
          
          <p className="text-sm text-muted-foreground">
            Add technical skills this technician can handle. Common skills include: Hardware, Software, Network, Printer, Email, Security, Backup, Consultation.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <X className="h-4 w-4" />
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
            {isEditing ? 'Update Technician' : 'Create Technician'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default TechnicianForm;