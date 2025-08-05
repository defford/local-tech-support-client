/**
 * Loading spinner component with basic HTML/CSS implementation
 * TODO: Replace with ShadCN UI Skeleton/Loading components
 */

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

export function LoadingSpinner({
  message = 'Loading...',
  size = 'md',
  centered = false,
  overlay = false
}: LoadingSpinnerProps) {
  const sizeClasses = getSizeClasses(size);
  
  const spinner = (
    <div className="flex flex-col items-center">
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses}`} />
      {message && (
        <p className="mt-2 text-sm text-gray-600">{message}</p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
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

export function CardLoadingSpinner({ message }: { message?: string }) {
  return (
    <div className="p-4">
      <LoadingSpinner message={message} />
    </div>
  );
}

export default LoadingSpinner;