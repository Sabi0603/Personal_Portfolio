import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-7xl font-mono font-extrabold text-cyan-500 mb-2">404</h1>
      <h2 className="text-2xl font-bold mb-3">Page Not Found</h2>
      <p className="text-(--text-muted) max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
      >
        <Home className="w-4 h-4" />
        Back to Home
      </Link>
    </div>
  );
}
