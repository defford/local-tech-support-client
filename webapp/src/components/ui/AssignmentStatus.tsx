/**
 * Assignment Status component for displaying technician assignment information
 */

import { Badge } from '@/components/ui/badge';
import { UserCheck, UserX, User, Mail, Phone, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Ticket, Technician, TechnicianStatus } from '@/types';
import { TicketUtils } from '@/types/Ticket';

export interface AssignmentStatusProps {
  ticket: Ticket;
  technician?: Technician;
  showDetails?: boolean;
  showStatus?: boolean;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'badge' | 'inline' | 'card';
  className?: string;
  onAssignClick?: () => void;
}

export function AssignmentStatus({
  ticket,
  technician,
  showDetails = true,
  showStatus = true,
  size = 'default',
  variant = 'inline',
  className = '',
  onAssignClick
}: AssignmentStatusProps) {
  const isAssigned = TicketUtils.isAssigned(ticket) && technician;
  const isClosed = TicketUtils.isClosed(ticket);

  const getInitials = (tech: Technician): string => {
    return `${tech.firstName?.[0] || ''}${tech.lastName?.[0] || ''}`.toUpperCase();
  };

  const getFullName = (tech: Technician): string => {
    return `${tech.firstName || ''} ${tech.lastName || ''}`.trim();
  };

  const getTechnicianStatusConfig = (status: TechnicianStatus) => {
    switch (status) {
      case TechnicianStatus.ACTIVE:
        return {
          icon: CheckCircle,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-950/30',
          label: 'Active'
        };
      case TechnicianStatus.TERMINATED:
        return {
          icon: AlertCircle,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-950/30',
          label: 'Terminated'
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-950/30',
          label: 'Unknown'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          avatar: 'h-8 w-8 text-xs',
          icon: 'h-3 w-3',
          text: 'text-xs',
          name: 'text-sm',
          details: 'text-xs'
        };
      case 'lg':
        return {
          avatar: 'h-12 w-12 text-lg',
          icon: 'h-5 w-5',
          text: 'text-sm',
          name: 'text-lg',
          details: 'text-sm'
        };
      default:
        return {
          avatar: 'h-10 w-10 text-sm',
          icon: 'h-4 w-4',
          text: 'text-sm',
          name: 'text-base',
          details: 'text-sm'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  // Unassigned state
  if (!isAssigned) {
    if (variant === 'badge') {
      return (
        <Badge variant="outline" className={`gap-1 ${className}`}>
          <UserX className="h-3 w-3 text-muted-foreground" />
          Unassigned
        </Badge>
      );
    }

    if (variant === 'card') {
      return (
        <div className={`p-4 border border-dashed border-muted-foreground/30 rounded-lg bg-muted/20 text-center ${className}`}>
          <UserX className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-3">No technician assigned</p>
          {onAssignClick && (
            <button
              onClick={onAssignClick}
              className="text-xs text-primary hover:underline"
            >
              Assign Technician
            </button>
          )}
        </div>
      );
    }

    // Inline variant
    return (
      <div className={`inline-flex items-center gap-2 text-muted-foreground ${className}`}>
        <UserX className={sizeClasses.icon} />
        <span className={sizeClasses.text}>
          Unassigned
          {onAssignClick && (
            <button
              onClick={onAssignClick}
              className="ml-2 text-primary hover:underline"
            >
              (Assign)
            </button>
          )}
        </span>
      </div>
    );
  }

  const statusConfig = getTechnicianStatusConfig(technician.status);
  const StatusIcon = statusConfig.icon;

  if (variant === 'badge') {
    return (
      <Badge variant="outline" className={`gap-1 ${className}`}>
        <UserCheck className="h-3 w-3 text-green-600" />
        {showDetails ? getFullName(technician) : 'Assigned'}
      </Badge>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`p-4 border rounded-lg bg-card ${className}`}>
        <div className="flex items-start gap-3">
          <div className={`${sizeClasses.avatar} rounded-full bg-muted flex items-center justify-center font-medium`}>
            {getInitials(technician)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={`font-semibold ${sizeClasses.name} truncate`}>
                {getFullName(technician)}
              </h4>
              {showStatus && (
                <StatusIcon className={`${sizeClasses.icon} ${statusConfig.color}`} />
              )}
            </div>
            
            {showDetails && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span className={sizeClasses.details}>{technician.email}</span>
                </div>
                
                {technician.phone && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span className={sizeClasses.details}>{technician.phone}</span>
                  </div>
                )}
                
                {technician.skills && technician.skills.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {technician.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs px-2 py-0">
                        {skill}
                      </Badge>
                    ))}
                    {technician.skills.length > 3 && (
                      <Badge variant="secondary" className="text-xs px-2 py-0">
                        +{technician.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {onAssignClick && (
              <button
                onClick={onAssignClick}
                className="text-xs text-primary hover:underline mt-2"
              >
                Reassign
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Inline variant (default)
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses.avatar} rounded-full bg-muted flex items-center justify-center font-medium`}>
        {getInitials(technician)}
      </div>
      
      <div className="flex items-center gap-2">
        <div>
          <span className={`font-medium ${sizeClasses.name}`}>
            {getFullName(technician)}
          </span>
          {showDetails && (
            <div className={`${sizeClasses.details} text-muted-foreground`}>
              {technician.email}
            </div>
          )}
        </div>
        
        {showStatus && (
          <StatusIcon className={`${sizeClasses.icon} ${statusConfig.color}`} />
        )}
        
        {onAssignClick && (
          <button
            onClick={onAssignClick}
            className="text-xs text-primary hover:underline ml-2"
          >
            Reassign
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Simple assignment icon component
 */
export function AssignmentIcon({
  ticket,
  className = ''
}: {
  ticket: Ticket;
  className?: string;
}) {
  const isAssigned = TicketUtils.isAssigned(ticket);

  if (isAssigned) {
    return (
      <span title="Assigned">
        <UserCheck className={`h-4 w-4 text-green-600 ${className}`} />
      </span>
    );
  }

  return (
    <span title="Unassigned">
      <UserX className={`h-4 w-4 text-muted-foreground ${className}`} />
    </span>
  );
}

/**
 * Assignment status badge for compact display
 */
export function AssignmentBadge({
  ticket,
  technician,
  className = ''
}: {
  ticket: Ticket;
  technician?: Technician;
  className?: string;
}) {
  return (
    <AssignmentStatus
      ticket={ticket}
      technician={technician}
      variant="badge"
      showDetails={false}
      className={className}
    />
  );
}

/**
 * Get assignment status text
 */
export function getAssignmentStatusText(ticket: Ticket, technician?: Technician): string {
  if (!TicketUtils.isAssigned(ticket) || !technician) {
    return 'Unassigned';
  }

  return `Assigned to ${technician.firstName} ${technician.lastName}`;
}

export default AssignmentStatus;