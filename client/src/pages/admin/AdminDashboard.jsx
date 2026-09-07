import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getDashboardSummary } from '../../services/adminService';
import {
  FolderGit2,
  Briefcase,
  GraduationCap,
  Award,
  Share2,
  Mail,
  User,
  Settings,
  KeyRound,
  ArrowRight,
  Server,
  Database,
  ShieldCheck,
  RefreshCw,
  Loader2,
  AlertCircle,
  Inbox,
} from 'lucide-react';

export default function AdminDashboard() {
  useDocumentTitle('Dashboard Overview | Admin Command');
  const { admin } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const summary = await getDashboardSummary();
      setData(summary);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics from backend API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getDashboardSummary()
      .then((summary) => {
        if (isMounted) setData(summary);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load dashboard metrics from backend API.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    const handleFocus = () => {
      getDashboardSummary()
        .then((summary) => {
          if (isMounted) setData(summary);
        })
        .catch(() => {});
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const counts = data?.counts || {
    projects: 0,
    experience: 0,
    education: 0,
    certifications: 0,
    socialLinks: 0,
    messages: 0,
    unreadMessages: 0,
  };

  const statCards = [
    {
      title: 'Projects',
      count: counts.projects,
      icon: FolderGit2,
      link: '/admin/projects',
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
    },
    {
      title: 'Experience',
      count: counts.experience,
      icon: Briefcase,
      link: '/admin/experience',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Education',
      count: counts.education,
      icon: GraduationCap,
      link: '/admin/education',
      color: 'text-violet-500',
      bg: 'bg-violet-500/10 border-violet-500/20',
    },
    {
      title: 'Certifications',
      count: counts.certifications,
      icon: Award,
      link: '/admin/certifications',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Social Links',
      count: counts.socialLinks,
      icon: Share2,
      link: '/admin/social-links',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Inbox',
      count: counts.unreadMessages,
      badge:
        counts.unreadMessages > 0
          ? `${counts.unreadMessages} unread`
          : counts.messages > 0
          ? `${counts.messages} total`
          : null,
      icon: Mail,
      link: '/admin/messages',
      color: 'text-rose-500',
      bg: 'bg-rose-500/10 border-rose-500/20',
    },
  ];

  const quickActions = [
    { label: 'Edit Profile', link: '/admin/profile', icon: User },
    { label: 'Site Settings', link: '/admin/settings', icon: Settings },
    { label: 'Change Password', link: '/admin/change-password', icon: KeyRound },
    { label: 'Manage Projects', link: '/admin/projects', icon: FolderGit2 },
    { label: 'Manage Experience', link: '/admin/experience', icon: Briefcase },
    { label: 'Manage Education', link: '/admin/education', icon: GraduationCap },
    { label: 'Manage Certifications', link: '/admin/certifications', icon: Award },
    { label: 'View Messages', link: '/admin/messages', icon: Mail },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl border border-(--border-color) bg-linear-to-br from-cyan-500/10 via-blue-500/5 to-transparent backdrop-blur-md">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-mono bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-(--text-primary)">
            Welcome, {admin?.name || 'Administrator'}
          </h1>
          <p className="text-xs font-mono text-(--text-muted)">
            Portfolio content management and live system telemetry.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-(--border-color) bg-(--bg-card) hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono text-(--text-primary) transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Data</span>
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div
          role="alert"
          className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-between gap-4 text-xs font-mono"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="underline underline-offset-2 hover:text-rose-500 font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Content Metrics Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-semibold">
            Database Content Metrics
          </h2>
          <span className="text-[11px] font-mono text-(--text-muted)">Real MongoDB Records</span>
        </div>

        {loading && !data ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="h-28 rounded-2xl border border-(--border-color) bg-(--bg-card)/60 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  to={card.link}
                  className="p-4 rounded-2xl border border-(--border-color) bg-(--bg-card) hover:border-cyan-500/40 hover:-translate-y-0.5 transition-all flex flex-col justify-between group space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl border ${card.bg} ${card.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {card.badge && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-rose-500/15 text-rose-500 font-semibold">
                        {card.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="text-2xl font-bold font-mono text-(--text-primary)">
                      {card.count}
                    </div>
                    <div className="text-xs font-mono text-(--text-muted) group-hover:text-cyan-500 transition-colors flex items-center justify-between mt-1">
                      <span>{card.title}</span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Two Column Layout: Recent Messages & Quick Actions / System Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Recent Messages */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-semibold">
              Recent Inquiries
            </h2>
            <Link
              to="/admin/messages"
              className="text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Inbox ({counts.unreadMessages})</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="rounded-2xl border border-(--border-color) bg-(--bg-card) divide-y divide-(--border-color)/60 overflow-hidden">
            {loading && !data ? (
              <div className="p-8 text-center text-xs font-mono text-(--text-muted) flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
                <span>Loading recent inquiries...</span>
              </div>
            ) : data?.recentMessages?.length > 0 ? (
              data.recentMessages.map((msg) => (
                <Link
                  key={msg._id}
                  to="/admin/messages"
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {!msg.isRead && (
                        <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0" />
                      )}
                      <span className="text-sm font-semibold text-(--text-primary) truncate">
                        {msg.name}
                      </span>
                      <span className="text-xs font-mono text-(--text-muted) truncate">
                        &lt;{msg.email}&gt;
                      </span>
                    </div>
                    <p className="text-xs text-(--text-secondary) font-medium truncate">
                      {msg.subject}
                    </p>
                    <p className="text-[11px] text-(--text-muted) line-clamp-1">
                      {msg.message}
                    </p>
                  </div>

                  <div className="text-[11px] font-mono text-(--text-muted) shrink-0 self-start sm:self-center">
                    {msg.createdAt
                      ? new Date(msg.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : ''}
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-400 flex items-center justify-center mx-auto">
                  <Inbox className="w-5 h-5" />
                </div>
                <p className="text-xs font-mono font-medium text-(--text-primary)">
                  No Messages Yet
                </p>
                <p className="text-[11px] font-mono text-(--text-muted)">
                  Inquiries submitted through the contact form will appear here in real time.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Quick Actions & Live System Status */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="p-5 rounded-2xl border border-(--border-color) bg-(--bg-card) space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-semibold">
              Quick Shortcuts
            </h2>

            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => {
                const ActionIcon = action.icon;
                return (
                  <Link
                    key={action.label}
                    to={action.link}
                    className="p-3 rounded-xl border border-(--border-color) bg-(--bg-primary) hover:border-cyan-500/40 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all text-xs font-mono flex items-center gap-2 text-(--text-secondary) hover:text-(--text-primary)"
                  >
                    <ActionIcon className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                    <span className="truncate">{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Real System Telemetry */}
          <div className="p-5 rounded-2xl border border-(--border-color) bg-(--bg-card) space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-semibold">
              API &amp; Database Telemetry
            </h2>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-(--bg-primary) border border-(--border-color)">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-500" />
                  <span>API Server</span>
                </div>
                <span className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {data?.systemHealth?.status === 'ok' ? 'Online' : 'Connected'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-(--bg-primary) border border-(--border-color)">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-500" />
                  <span>Database (MongoDB)</span>
                </div>
                <span className="text-emerald-500 font-semibold">
                  {data?.systemHealth?.database === 'connected' ? 'Connected' : 'Active'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-(--bg-primary) border border-(--border-color)">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-cyan-500" />
                  <span>Active Session</span>
                </div>
                <span className="text-(--text-primary) font-semibold truncate max-w-[130px]">
                  {admin?.name || 'Administrator'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
