import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import {
  Sun,
  Moon,
  LogOut,
  Menu,
  ExternalLink,
  Loader2,
  User,
} from 'lucide-react';

const ROUTE_LABELS = {
  '/admin': 'Dashboard Overview',
  '/admin/profile': 'Profile Management',
  '/admin/projects': 'Projects Management',
  '/admin/projects/new': 'Create Project',
  '/admin/experience': 'Work Experience',
  '/admin/education': 'Education & Coursework',
  '/admin/certifications': 'Certifications & Credentials',
  '/admin/social-links': 'Social Channels',
  '/admin/messages': 'Contact Messages Inbox',
  '/admin/settings': 'Site Settings & SEO',
  '/admin/change-password': 'Change Admin Password',
};

export default function AdminHeader({ onOpenMobileMenu }) {
  const { admin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [loggingOut, setLoggingOut] = useState(false);

  // Compute clean breadcrumb/title
  const currentTitle =
    ROUTE_LABELS[location.pathname] ||
    (location.pathname.startsWith('/admin/projects/') ? 'Project Editor' : 'Admin Panel');

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/admin/login', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-(--border-color) bg-(--bg-primary)/85 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between transition-colors duration-200">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl border border-(--border-color) hover:bg-slate-100 dark:hover:bg-slate-800 text-(--text-primary) transition-colors"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400 hidden sm:inline">Admin /</span>
          <span className="font-semibold text-(--text-primary)">
            {currentTitle}
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5">
        {/* Public Portfolio Preview Link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-(--border-color) hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono text-(--text-secondary) hover:text-(--text-primary) transition-colors"
        >
          <span>View Site</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-(--border-color) bg-(--bg-card) hover:bg-slate-100 dark:hover:bg-slate-800 text-(--text-primary) transition-colors cursor-pointer"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Admin Identity Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-(--border-color) bg-(--bg-card) text-xs font-mono text-(--text-secondary)">
          <div className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
            <User className="w-3 h-3" />
          </div>
          <span className="truncate max-w-[120px]">{admin?.name || 'Administrator'}</span>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-mono font-medium transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Sign out"
        >
          {loggingOut ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <LogOut className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
