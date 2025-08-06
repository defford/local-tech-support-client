/**
 * Overdue Indicator component with time-based warnings and visual alerts
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Calendar, CheckCircle } from 'lucide-react';
import { Ticket } from '@/types';
import { TicketUtils } from '@/types/Ticket';

export interface OverdueIndicatorProps {
  ticket: Ticket;
  showLabel?: boolean;
  showTimeRemaining?: boolean;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'badge' | 'inline' | 'card';
  className?: string;
}

export function OverdueIndicator({
  ticket,
  showLabel = true,
  showTimeRemaining = true,
  size = 'default',
  variant = 'badge',
  className = ''
}: OverdueIndicatorProps) {
  if (!ticket.dueAt) {
    if (variant === 'inline') {
      return (
        <span className={`text-sm text-muted-foreground ${className}`}>
          No due date
        </span>
      );
    }
    return null;
  }

  const dueDate = new Date(ticket.dueAt);
  const now = new Date();
  const isOverdue = dueDate < now;
  const isClosed = TicketUtils.isClosed(ticket);
  
  // Calculate time differences
  const timeDiff = Math.abs(dueDate.getTime() - now.getTime());
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
  const minutesDiff = Math.floor(timeDiff / (1000 * 60));

  const getTimeRemainingText = () => {
    if (isClosed) return 'Completed';
    
    if (isOverdue) {
      if (daysDiff > 0) return `${daysDiff} day${daysDiff !== 1 ? 's' : ''} overdue`;
      if (hoursDiff > 0) return `${hoursDiff} hour${hoursDiff !== 1 ? 's' : ''} overdue`;
      return `${minutesDiff} minute${minutesDiff !== 1 ? 's' : ''} overdue`;
    } else {
      if (daysDiff > 7) return `${daysDiff} days remaining`;
      if (daysDiff > 0) return `${daysDiff} day${daysDiff !== 1 ? 's' : ''} remaining`;
      if (hoursDiff > 0) return `${hoursDiff} hour${hoursDiff !== 1 ? 's' : ''} remaining`;
      return `${minutesDiff} minute${minutesDiff !== 1 ? 's' : ''} remaining`;
    }
  };

  const getUrgencyLevel = () => {
    if (isClosed) return 'completed';
    if (isOverdue) return 'overdue';
    if (daysDiff === 0 && hoursDiff < 24) return 'urgent';
    if (daysDiff <= 1) return 'warning';
    if (daysDiff <= 3) return 'caution';
    return 'normal';
  };

  const getStatusConfig = () => {
    const urgency = getUrgencyLevel();
    
    switch (urgency) {
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-950/30',
          borderColor: 'border-green-200 dark:border-green-800',
          badgeVariant: 'outline' as const,
          label: 'Completed'
        };
      case 'overdue':
        return {
          icon: AlertTriangle,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-950/30',
          borderColor: 'border-red-200 dark:border-red-800',
          badgeVariant: 'destructive' as const,
          label: 'Overdue'
        };
      case 'urgent':
        return {
          icon: AlertTriangle,
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-50 dark:bg-orange-950/30',
          borderColor: 'border-orange-200 dark:border-orange-800',
          badgeVariant: 'secondary' as const,
          label: 'Due Today'
        };
      case 'warning':
        return {
          icon: Clock,
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          badgeVariant: 'outline' as const,
          label: 'Due Soon'
        };
      case 'caution':
        return {
          icon: Calendar,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-950/30',
          borderColor: 'border-blue-200 dark:border-blue-800',
          badgeVariant: 'outline' as const,
          label: 'Due This Week'
        };
      default:
        return {
          icon: Calendar,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted/20',
          borderColor: 'border-muted',
          badgeVariant: 'outline' as const,
          label: 'Scheduled'
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;
  const timeText = getTimeRemainingText();

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          badge: 'text-xs px-2 py-1',
          icon: 'h-3 w-3',
          text: 'text-xs'
        };
      case 'lg':
        return {
          badge: 'text-sm px-3 py-2',
          icon: 'h-5 w-5',
          text: 'text-sm'
        };
      default:
        return {
          badge: 'text-xs px-2 py-1',
          icon: 'h-4 w-4',
          text: 'text-sm'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (variant === 'inline') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <IconComponent className={`${sizeClasses.icon} ${config.color}`} />
        <span className={`${sizeClasses.text} ${config.color} font-medium`}>
          {showTimeRemaining ? timeText : formatDate(dueDate)}
        </span>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div 
        className={`inline-flex items-center gap-3 px-3 py-2 rounded-lg border ${config.bgColor} ${config.borderColor} ${className}`}
        title={`Due: ${formatDate(dueDate)}`}
      >
        <IconComponent className={`${sizeClasses.icon} ${config.color}`} />
        <div className="flex flex-col">
          {showLabel && (
            <span className={`${sizeClasses.text} font-medium ${config.color}`}>
              {config.label}
            </span>
          )}
          {showTimeRemaining && (
            <span className="text-xs text-muted-foreground">
              {timeText}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default badge variant
  return (
    <Badge
      variant={config.badgeVariant}
      className={`gap-1 ${sizeClasses.badge} ${className}`}
      title={`Due: ${formatDate(dueDate)} - ${timeText}`}
    >
      <IconComponent className={`${sizeClasses.icon}`} />
      {showLabel && <span>{config.label}</span>}
      {showTimeRemaining && showLabel && <span>•</span>}
      {showTimeRemaining && <span>{timeText}</span>}
    </Badge>
  );
}

/**
 * Simple overdue status check component
 */
export function OverdueStatus({
  ticket,
  className = ''
}: {
  ticket: Ticket;
  className?: string;
}) {
  if (!ticket.dueAt) return null;

  const isOverdue = TicketUtils.isOverdue(ticket);
  const isClosed = TicketUtils.isClosed(ticket);

  if (isClosed) {
    return (
      <span title="Completed">
        <CheckCircle className={`h-4 w-4 text-green-600 ${className}`} />
      </span>
    );
  }

  if (isOverdue) {
    return (
      <span title="Overdue">
        <AlertTriangle className={`h-4 w-4 text-red-600 ${className}`} />
      </span>
    );
  }

  return (
    <span title="On Schedule">
      <Clock className={`h-4 w-4 text-muted-foreground ${className}`} />
    </span>
  );
}

/**
 * Format due date with overdue indication
 */
export function formatDueDate(ticket: Ticket): React.ReactElement {
  if (!ticket.dueAt) {
    return <span className="text-muted-foreground">No due date</span>;
  }

  const dueDate = new Date(ticket.dueAt);
  const isOverdue = TicketUtils.isOverdue(ticket);
  const isClosed = TicketUtils.isClosed(ticket);

  const formattedDate = dueDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  if (isClosed) {
    return <span className="text-muted-foreground">{formattedDate}</span>;
  }

  if (isOverdue) {
    return (
      <span className="text-red-600 font-medium">
        {formattedDate} (Overdue)
      </span>
    );
  }

  return <span className="text-muted-foreground">{formattedDate}</span>;
}

export default OverdueIndicator;