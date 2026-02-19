import Link from 'next/link';

export default function NotFound() { return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-800">
      <div className="text-center p-8">
        <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block"
        >
          Go Home
        </Link>
      </div>
    </div>
  ); }
