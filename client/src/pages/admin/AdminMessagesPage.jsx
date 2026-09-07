import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import {
  getAdminMessages,
  markAdminMessageRead,
  deleteAdminMessage,
} from '../../services/adminService';
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog';
import Pagination from '../../components/Pagination';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import {
  Mail,
  MailOpen,
  Trash2,
  Search,
  RefreshCw,
  Clock,
  User,
  AtSign,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  Inbox,
} from 'lucide-react';

export default function AdminMessagesPage() {
  useDocumentTitle('Contact Messages | Admin Command');

  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'unread' | 'read'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Detail Modal State
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMessages = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError('');

    try {
      const data = await getAdminMessages();
      const messageList = Array.isArray(data?.messages) ? data.messages : [];
      const unread = typeof data?.unreadCount === 'number' ? data.unreadCount : 0;
      setMessages(messageList);
      setUnreadCount(unread);
    } catch (err) {
      setError(err.message || 'Failed to load contact messages.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    getAdminMessages()
      .then((data) => {
        if (isMounted) {
          const messageList = Array.isArray(data?.messages) ? data.messages : [];
          const unread = typeof data?.unreadCount === 'number' ? data.unreadCount : 0;
          setMessages(messageList);
          setUnreadCount(unread);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load contact messages.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered & Searched Messages
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      // Status filter
      if (statusFilter === 'unread' && msg.isRead) return false;
      if (statusFilter === 'read' && !msg.isRead) return false;

      // Search query
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      const nameMatch = msg.name?.toLowerCase().includes(q);
      const emailMatch = msg.email?.toLowerCase().includes(q);
      const subjectMatch = msg.subject?.toLowerCase().includes(q);
      const messageMatch = msg.message?.toLowerCase().includes(q);

      return nameMatch || emailMatch || subjectMatch || messageMatch;
    });
  }, [messages, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredMessages.length / pageSize) || 1;
  const paginatedMessages = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMessages.slice(start, start + pageSize);
  }, [filteredMessages, currentPage, pageSize]);

  // Open Message Detail & auto-mark read if unread
  const handleOpenDetail = async (msg) => {
    setSelectedMessage(msg);

    // If message is unread, automatically mark as read
    if (!msg.isRead) {
      try {
        await markAdminMessageRead(msg._id, true);
        setMessages((prev) =>
          prev.map((m) => (m._id === msg._id ? { ...m, isRead: true } : m))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setSelectedMessage((prev) => (prev ? { ...prev, isRead: true } : null));
      } catch (err) {
        console.warn('Failed to auto-mark message as read:', err.message);
      }
    }
  };

  // Toggle Read / Unread
  const handleToggleRead = async (msg, e) => {
    if (e) e.stopPropagation();
    const nextReadStatus = !msg.isRead;

    try {
      await markAdminMessageRead(msg._id, nextReadStatus);
      setMessages((prev) =>
        prev.map((m) => (m._id === msg._id ? { ...m, isRead: nextReadStatus } : m))
      );
      setUnreadCount((prev) =>
        nextReadStatus ? Math.max(0, prev - 1) : prev + 1
      );
      if (selectedMessage && selectedMessage._id === msg._id) {
        setSelectedMessage((prev) => ({ ...prev, isRead: nextReadStatus }));
      }
      setSuccessMessage(
        `Message from ${msg.name} marked as ${nextReadStatus ? 'read' : 'unread'}.`
      );
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update message read status.');
    }
  };

  // Delete Action
  const handleDeleteClick = (msg, e) => {
    if (e) e.stopPropagation();
    setDeleteTarget(msg);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      await deleteAdminMessage(deleteTarget._id);
      setSuccessMessage(`Message from "${deleteTarget.name}" deleted successfully.`);
      setTimeout(() => setSuccessMessage(''), 3000);

      // If open in modal, close modal
      if (selectedMessage && selectedMessage._id === deleteTarget._id) {
        setSelectedMessage(null);
      }

      setDeleteTarget(null);
      await fetchMessages(true);
    } catch (err) {
      setError(err.message || 'Failed to delete message.');
    } finally {
      setDeleting(false);
    }
  };

  const formatDateTime = (dateVal) => {
    if (!dateVal) return 'Unknown date';
    try {
      const d = new Date(dateVal);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return String(dateVal);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-(--border-color) pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-(--text-primary) flex items-center gap-2.5">
              <Mail className="w-6 h-6 text-cyan-500" />
              Contact Messages
            </h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-rose-500/15 text-rose-500 border border-rose-500/30 animate-pulse">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs font-mono text-(--text-muted) mt-1">
            Inquiries and correspondence received through the public portfolio contact form.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchMessages(true)}
          disabled={refreshing || loading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-(--border-color) bg-(--bg-card) hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono text-(--text-primary) transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Sync Inbox</span>
        </button>
      </div>

      {/* Global Alerts */}
      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 text-xs font-mono flex items-center gap-3"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="flex-1">{error}</p>
          <button
            type="button"
            onClick={() => setError('')}
            className="text-rose-400 hover:text-rose-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-xs font-mono flex items-center gap-3"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <p className="flex-1">{successMessage}</p>
          <button
            type="button"
            onClick={() => setSuccessMessage('')}
            className="text-emerald-400 hover:text-emerald-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl border border-(--border-color) bg-(--bg-card)">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-muted)" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, email, subject, or message content..."
            className="w-full bg-(--bg-primary) border border-(--border-color) rounded-xl pl-9 pr-8 py-2 text-xs font-mono text-(--text-primary) placeholder-(--text-muted) focus:outline-none focus:border-cyan-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) hover:text-(--text-primary)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-(--bg-primary) p-1 rounded-xl border border-(--border-color) shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            onClick={() => {
              setStatusFilter('all');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              statusFilter === 'all'
                ? 'bg-cyan-500/15 text-cyan-500 font-semibold border border-cyan-500/30'
                : 'text-(--text-muted) hover:text-(--text-primary) border border-transparent'
            }`}
          >
            All ({messages.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('unread')}
            onClick={() => {
              setStatusFilter('unread');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              statusFilter === 'unread'
                ? 'bg-rose-500/15 text-rose-500 font-semibold border border-rose-500/30'
                : 'text-(--text-muted) hover:text-(--text-primary) border border-transparent'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('read')}
            onClick={() => {
              setStatusFilter('read');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              statusFilter === 'read'
                ? 'bg-emerald-500/15 text-emerald-500 font-semibold border border-emerald-500/30'
                : 'text-(--text-muted) hover:text-(--text-primary) border border-transparent'
            }`}
          >
            Read ({Math.max(0, messages.length - unreadCount)})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingSkeleton count={4} type="card" />
      ) : error && messages.length === 0 ? (
        <ErrorState message={error} onRetry={() => fetchMessages()} />
      ) : messages.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No Messages Found"
          description="Your inbox is currently empty. When visitors submit the public portfolio contact form, their inquiries will appear here."
        />
      ) : filteredMessages.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-(--border-color) bg-(--bg-card)/40 max-w-md mx-auto space-y-3">
          <Search className="w-8 h-8 text-(--text-muted) mx-auto" />
          <h3 className="text-sm font-bold text-(--text-primary) font-mono">
            No matching messages
          </h3>
          <p className="text-xs text-(--text-muted) font-mono">
            No messages match your active filter or search query.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs font-mono font-semibold rounded-lg bg-cyan-500/15 text-cyan-500 border border-cyan-500/30 hover:bg-cyan-500/25 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {paginatedMessages.map((msg) => {
            const isUnread = !msg.isRead;

            return (
              <div
                key={msg._id}
                onClick={() => handleOpenDetail(msg)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                  isUnread
                    ? 'border-cyan-500/40 bg-cyan-500/[0.04] dark:bg-cyan-500/[0.03] shadow-sm'
                    : 'border-(--border-color) bg-(--bg-card) hover:border-(--border-color)/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                }`}
              >
                {/* Left: Message Summary */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Unread indicator */}
                    {isUnread ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shrink-0 ring-4 ring-cyan-500/20" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0" />
                    )}

                    <span
                      className={`text-sm truncate ${
                        isUnread
                          ? 'font-bold text-(--text-primary)'
                          : 'font-medium text-(--text-primary)'
                      }`}
                    >
                      {msg.name}
                    </span>

                    <span className="text-xs font-mono text-(--text-muted) truncate">
                      &lt;{msg.email}&gt;
                    </span>

                    <span className="text-[11px] font-mono text-(--text-muted) flex items-center gap-1 sm:ml-auto">
                      <Clock className="w-3 h-3" />
                      {formatDateTime(msg.createdAt)}
                    </span>
                  </div>

                  <h3
                    className={`text-xs truncate ${
                      isUnread
                        ? 'font-semibold text-cyan-600 dark:text-cyan-400'
                        : 'font-medium text-(--text-secondary)'
                    }`}
                  >
                    {msg.subject}
                  </h3>

                  <p className="text-xs text-(--text-muted) line-clamp-2 leading-relaxed">
                    {msg.message}
                  </p>
                </div>

                {/* Right: Quick Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-(--border-color)/60 w-full sm:w-auto justify-end">
                  {/* View Details Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetail(msg);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono font-medium rounded-lg text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-(--border-color) transition-colors cursor-pointer"
                    title="View Message"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>

                  {/* Toggle Read/Unread */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleRead(msg, e)}
                    className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                      isUnread
                        ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20'
                        : 'border-(--border-color) bg-(--bg-secondary) text-(--text-muted) hover:text-(--text-primary) hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title={isUnread ? 'Mark as Read' : 'Mark as Unread'}
                  >
                    {isUnread ? (
                      <MailOpen className="w-3.5 h-3.5" />
                    ) : (
                      <Mail className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={(e) => handleDeleteClick(msg, e)}
                    className="p-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors cursor-pointer"
                    title="Delete Message"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
          </div>

          {filteredMessages.length > pageSize && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredMessages.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}

      {/* MESSAGE DETAIL MODAL */}
      {selectedMessage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-message-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedMessage(null)}
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-2xl rounded-2xl border border-(--border-color) bg-(--bg-card) shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-zoom-in">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-(--border-color) flex items-start justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md ${
                      selectedMessage.isRead
                        ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                    }`}
                  >
                    {selectedMessage.isRead ? 'Read' : 'Unread'}
                  </span>
                  <span className="text-xs font-mono text-(--text-muted) flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDateTime(selectedMessage.createdAt)}
                  </span>
                </div>

                <h2
                  id="modal-message-title"
                  className="text-base sm:text-lg font-bold text-(--text-primary) break-words pt-1"
                >
                  {selectedMessage.subject}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="p-1.5 rounded-lg text-(--text-muted) hover:text-(--text-primary) hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sender Metadata Bar */}
            <div className="px-5 sm:px-6 py-3 bg-(--bg-primary) border-b border-(--border-color) flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-(--text-primary) font-semibold">
                  <User className="w-3.5 h-3.5 text-cyan-500" />
                  {selectedMessage.name}
                </span>
                <span className="text-(--text-muted) flex items-center gap-1">
                  <AtSign className="w-3 h-3 text-(--text-muted)" />
                  {selectedMessage.email}
                </span>
              </div>

              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                  selectedMessage.subject
                )}`}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-cyan-600 dark:text-cyan-400 hover:underline shrink-0"
              >
                <span>Reply via Mail</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Modal Body: Full Message */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-sm text-(--text-primary) leading-relaxed whitespace-pre-wrap font-sans break-words selection:bg-cyan-500/20">
              {selectedMessage.message}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-(--border-color) bg-(--bg-secondary)/50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleRead(selectedMessage)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg border border-(--border-color) bg-(--bg-card) hover:bg-slate-100 dark:hover:bg-slate-800 text-(--text-primary) transition-colors cursor-pointer"
                >
                  {selectedMessage.isRead ? (
                    <>
                      <Mail className="w-3.5 h-3.5 text-cyan-500" />
                      <span>Mark as Unread</span>
                    </>
                  ) : (
                    <>
                      <MailOpen className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Mark as Read</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteClick(selectedMessage)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-1.5 text-xs font-mono font-medium rounded-lg border border-(--border-color) bg-(--bg-card) hover:bg-slate-100 dark:hover:bg-slate-800 text-(--text-primary) transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AdminConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Contact Message"
        message={`Are you sure you want to delete the message from "${deleteTarget?.name}" regarding "${deleteTarget?.subject}"? This action cannot be undone.`}
        confirmLabel={deleting ? 'Deleting...' : 'Delete Message'}
        isDestructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
