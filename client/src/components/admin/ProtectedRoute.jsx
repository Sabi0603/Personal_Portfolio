import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-(--bg-primary) text-(--text-primary)">
        <div className="flex flex-col items-center gap-3 p-8 rounded-2xl border border-(--border-color) bg-(--bg-card)/80 backdrop-blur-md shadow-xl">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
          <p className="text-xs font-mono text-(--text-muted) tracking-wider uppercase">
            Verifying Authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}
