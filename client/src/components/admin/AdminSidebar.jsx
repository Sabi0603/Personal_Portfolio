import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FolderGit2,
  Briefcase,
  GraduationCap,
  Award,
  Sparkles,
  Share2,
  Mail,
  Settings,
  KeyRound,
  Shield,
  X,
  FileText,
} from 'lucide-react';

const ADMIN_NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/admin/profile', label: 'Profile', icon: User },
  { path: '/admin/resume', label: 'Resume', icon: FileText },
  { path: '/admin/skills', label: 'Skills', icon: Sparkles },
  { path: '/admin/projects', label: 'Projects', icon: FolderGit2 },
  { path: '/admin/experience', label: 'Experience', icon: Briefcase },
  { path: '/admin/education', label: 'Education', icon: GraduationCap },
  { path: '/admin/certifications', label: 'Certifications', icon: Award },
  { path: '/admin/social-links', label: 'Social Links', icon: Share2 },
  { path: '/admin/messages', label: 'Messages', icon: Mail },
  { path: '/admin/settings', label: 'Site Settings', icon: Settings },
  { path: '/admin/change-password', label: 'Change Password', icon: KeyRound },
];

export default function AdminSidebar({ mobileOpen, onClose }) {
  const content = (
    <div className="flex flex-col h-full">
      {/* Brand / Title */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-(--border-color)">
        <div className="flex items-center gap-2.5 font-mono font-bold text-sm tracking-tight text-(--text-primary)">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <span>Admin Command</span>
        </div>
        {mobileOpen && (
          <button
            type="button"
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg border border-(--border-color) text-slate-400 hover:text-(--text-primary) transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto" aria-label="Admin Navigation">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => mobileOpen && onClose && onClose()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-mono font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-500 border border-cyan-500/30 font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-(--text-primary) hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-(--border-color)/60 text-[11px] font-mono text-(--text-muted) text-center">
        Sabari M Portfolio v1.0
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 border-r border-(--border-color) bg-(--bg-primary) h-screen sticky top-0 transition-colors duration-200">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[80vw] bg-(--bg-primary) border-r border-(--border-color) h-full shadow-2xl animate-slide-in-left">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
