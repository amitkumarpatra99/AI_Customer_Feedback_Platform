import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <h2 className="text-4xl font-bold text-gray-900">404 - Page Not Found</h2>
      <p className="mt-4 text-lg text-gray-600">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/login"
        className="mt-8 rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
      >
        Go back to Login
      </Link>
    </div>
  );
}