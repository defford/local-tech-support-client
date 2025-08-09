/**
 * Enhanced Priority Badge component with visual indicators and consistent styling
 */

import { Badge } from '@/components/ui/badge';
import { TicketPriority } from '@/types';
import { AlertTriangle, ArrowUp, Minus, ArrowDown, Circle } from 'lucide-react';

export interface PriorityBadgeProps {
  priority: TicketPriority | undefined;
  size?: 'sm' | 'default' | 'lg';
  showIcon?: boolean;
  showLabel?: boolean;
  variant?: 'default' | 'compact';
  className?: string;
}

export function PriorityBadge({
  priority,
  size = 'default',
  showIcon = true,
  showLabel = true,
  variant = 'default',
  className = ''
}: PriorityBadgeProps) {
  const getPriorityConfig = (priority: TicketPriority | undefined) => {
    switch (priority) {
      case TicketPriority.URGENT:
        return {
          label: 'Urgent',
          emoji: '🔴',
          icon: AlertTriangle,
          badgeVariant: 'destructive' as const,
          bgColor: 'bg-red-50 dark:bg-red-950/30',
          borderColor: 'border-red-200 dark:border-red-800',
          textColor: 'text-red-700 dark:text-red-300',
          iconColor: 'text-red-500',
          description: 'Critical - immediate attention required'
        };
      case TicketPriority.HIGH:
        return {
          label: 'High',
          emoji: '🟠',
          icon: ArrowUp,
          badgeVariant: 'secondary' as const,
          bgColor: 'bg-orange-50 dark:bg-orange-950/30',
          borderColor: 'border-orange-200 dark:border-orange-800',
          textColor: 'text-orange-700 dark:text-orange-300',
          iconColor: 'text-orange-500',
          description: 'High priority - resolve same day'
        };
      case TicketPriority.MEDIUM:
        return {
          label: 'Medium',
          emoji: '🟡',
          icon: Minus,
          badgeVariant: 'outline' as const,
          bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          textColor: 'text-yellow-700 dark:text-yellow-300',
          iconColor: 'text-yellow-500',
          description: 'Standard priority - resolve within 3 days'
        };
      case TicketPriority.LOW:
        return {
          label: 'Low',
          emoji: '🟢',
          icon: ArrowDown,
          badgeVariant: 'outline' as const,
          bgColor: 'bg-green-50 dark:bg-green-950/30',
          borderColor: 'border-green-200 dark:border-green-800',
          textColor: 'text-green-700 dark:text-green-300',
          iconColor: 'text-green-500',
          description: 'Low priority - resolve when available'
        };
      default:
        return {
          label: 'Unknown',
          emoji: '⚪',
          icon: Circle,
          badgeVariant: 'outline' as const,
          bgColor: 'bg-gray-50 dark:bg-gray-950/30',
          borderColor: 'border-gray-200 dark:border-gray-800',
          textColor: 'text-gray-700 dark:text-gray-300',
          iconColor: 'text-gray-500',
          description: 'Priority not set'
        };
    }
  };

  const config = getPriorityConfig(priority);
  const IconComponent = config.icon;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          badge: 'text-xs px-2 py-1',
          icon: 'h-3 w-3'
        };
      case 'lg':
        return {
          badge: 'text-sm px-3 py-2',
          icon: 'h-5 w-5'
        };
      default:
        return {
          badge: 'text-xs px-2 py-1',
          icon: 'h-4 w-4'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  if (variant === 'compact') {
    return (
      <div 
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border ${config.bgColor} ${config.borderColor} ${className}`}
        title={`${config.label} Priority - ${config.description}`}
      >
        {showIcon && (
          <span className="text-sm" aria-hidden="true">
            {config.emoji}
          </span>
        )}
        {showLabel && (
          <span className={`text-xs font-medium ${config.textColor}`}>
            {config.label}
          </span>
        )}
      </div>
    );
  }

  return (
    <Badge
      variant={config.badgeVariant}
      className={`gap-1 ${sizeClasses.badge} ${className}`}
      title={`${config.label} Priority - ${config.description}`}
    >
      {showIcon && (
        <>
          <span className="text-sm" aria-hidden="true">
            {config.emoji}
          </span>
          <IconComponent className={`${sizeClasses.icon} ${config.iconColor}`} />
        </>
      )}
      {showLabel && (
        <span>{config.label.toLowerCase()}</span>
      )}
    </Badge>
  );
}

/**
 * Priority Badge with just the icon - useful for compact displays
 */
export function PriorityIcon({
  priority,
  size = 'default',
  className = ''
}: {
  priority: TicketPriority | undefined;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}) {
  return (
    <PriorityBadge
      priority={priority}
      size={size}
      showIcon={true}
      showLabel={false}
      variant="compact"
      className={className}
    />
  );
}

/**
 * Get priority level as number for sorting and comparison
 */
export function getPriorityLevel(priority: TicketPriority | undefined): number {
  switch (priority) {
    case TicketPriority.URGENT:
      return 4;
    case TicketPriority.HIGH:
      return 3;
    case TicketPriority.MEDIUM:
      return 2;
    case TicketPriority.LOW:
      return 1;
    default:
      return 0;
  }
}

/**
 * Get priority color class for styling
 */
export function getPriorityColor(priority: TicketPriority | undefined): string {
  switch (priority) {
    case TicketPriority.URGENT:
      return 'text-red-600 dark:text-red-400';
    case TicketPriority.HIGH:
      return 'text-orange-600 dark:text-orange-400';
    case TicketPriority.MEDIUM:
      return 'text-yellow-600 dark:text-yellow-400';
    case TicketPriority.LOW:
      return 'text-green-600 dark:text-green-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}

export default PriorityBadge;