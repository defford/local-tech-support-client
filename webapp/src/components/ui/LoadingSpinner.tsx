/**
 * Loading spinner component using ShadCN UI Skeleton components
 */

import { Skeleton } from '@/components/ui/skeleton';

export interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  centered?: boolean;
  overlay?: boolean;
}

const getSizeClasses = (size: 'sm' | 'md' | 'lg' | 'xl') => {
  switch (size) {
    case 'sm':
      return 'h-4 w-4';
    case 'lg':
      return 'h-8 w-8';
    case 'xl':
      return 'h-12 w-12';
    default:
      return 'h-6 w-6';
  }
};

const getSkeletonHeight = (size: 'sm' | 'md' | 'lg' | 'xl') => {
  switch (size) {
    case 'sm':
      return 'h-8';
    case 'lg':
      return 'h-12';
    case 'xl':
      return 'h-16';
    default:
      return 'h-10';
  }
};

export function LoadingSpinner({
  message = 'Loading...',
  size = 'md',
  centered = false,
  overlay = false
}: LoadingSpinnerProps) {
  const sizeClasses = getSizeClasses(size);
  
  const spinner = (
    <div className="flex flex-col items-center space-y-2">
      <div className={`animate-spin rounded-full border-2 border-muted border-t-primary ${sizeClasses}`} />
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-card rounded-lg p-6 shadow-lg">
          {spinner}
        </div>
      </div>
    );
  }

  if (centered) {
    return (
      <div className="flex items-center justify-center h-64">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export function TableLoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
      ))}
    </div>
  );
}

export function TableLoadingSpinner({ message = 'Loading data...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner message={message} size="lg" />
    </div>
  );
}

export function PageLoadingSpinner({ message = 'Loading page...' }: { message?: string }) {
  return <LoadingSpinner message={message} size="lg" centered />;
}

export function CardLoadingSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function CardLoadingSpinner({ message }: { message?: string }) {
  return (
    <div className="p-4">
      <LoadingSpinner message={message} />
    </div>
  );
}

export default LoadingSpinner;