/**
 * 404 Not Found page component
 * Basic HTML implementation - TODO: Replace with ShadCN UI components
 */

import { IconHome, IconArrowLeft } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center space-y-8">
          <div>
            <h1 className="text-8xl font-black text-blue-600 leading-none">
              404
            </h1>
            <h2 className="text-3xl font-bold mt-4">
              Page Not Found
            </h2>
            <p className="text-gray-600 text-lg mt-4 max-w-lg">
              The page you are looking for might have been removed, 
              had its name changed, or is temporarily unavailable.
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Link
              to="/"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <IconHome size={16} />
              Go to Dashboard
            </Link>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-200 flex items-center gap-2"
            >
              <IconArrowLeft size={16} />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;