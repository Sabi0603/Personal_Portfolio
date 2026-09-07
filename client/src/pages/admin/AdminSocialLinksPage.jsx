import { useState, useEffect } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import {
  getAdminSocialLinks,
  createAdminSocialLink,
  updateAdminSocialLink,
  deleteAdminSocialLink,
} from '../../services/adminService';
import AdminFormField from '../../components/admin/AdminFormField';
import AdminToggle from '../../components/admin/AdminToggle';
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog';
import Pagination from '../../components/Pagination';
import {
  Share2,
  Plus,
  Edit2,
  Trash2,
  Save,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Search,
  Globe,
  Eye,
  EyeOff,
} from 'lucide-react';

const COMMON_PLATFORMS = [
  'GitHub',
  'LinkedIn',
  'Twitter / X',
  'Email',
  'LeetCode',
  'CodeChef',
  'Dev.to',
  'YouTube',
  'Portfolio',
];

export default function AdminSocialLinksPage() {
  useDocumentTitle('Social Links Management | Admin Command');

  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Mode: 'list' | 'create' | 'edit'
  const [viewMode, setViewMode] = useState('list');
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [platform, setPlatform] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [order, setOrder] = useState(0);

  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchLinks = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminSocialLinks();
      setLinks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load social links.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getAdminSocialLinks()
      .then((data) => {
        if (isMounted) {
          setLinks(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load social links.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setPlatform('');
    setUrl('');
    setIcon('');
    setIsVisible(true);
    setOrder(links.length);
    setFieldErrors({});
    setError('');
    setSuccessMessage('');
    setViewMode('create');
  };

  const handleOpenEdit = (link) => {
    // CRITICAL: Bind the existing _id explicitly
    setEditingId(link._id);
    setPlatform(link.platform || '');
    setUrl(link.url || '');
    setIcon(link.icon || '');
    setIsVisible(link.isVisible ?? true);
    setOrder(link.order ?? 0);
    setFieldErrors({});
    setError('');
    setSuccessMessage('');
    setViewMode('edit');
  };

  const handleCancelForm = () => {
    setViewMode('list');
    setEditingId(null);
    setFieldErrors({});
    setError('');
  };

  const validateForm = () => {
    const errors = {};
    if (!platform.trim()) errors.platform = 'Platform name is required';
    if (!url.trim()) {
      errors.url = 'URL is required';
    } else if (!url.trim().startsWith('http://') && !url.trim().startsWith('https://') && !url.trim().startsWith('mailto:')) {
      errors.url = 'URL must start with http://, https://, or mailto:';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setError('');
    setSuccessMessage('');

    const payload = {
      platform: platform.trim(),
      url: url.trim(),
      icon: icon.trim(),
      isVisible,
      order: Number(order) || 0,
    };

    try {
      if (viewMode === 'edit') {
        // STRICT EDIT: Use PUT with editingId
        if (!editingId) {
          throw new Error('Missing record ID for edit operation');
        }
        await updateAdminSocialLink(editingId, payload);
        setSuccessMessage(`Social link "${platform}" updated successfully.`);
      } else {
        // STRICT CREATE: Use POST
        await createAdminSocialLink(payload);
        setSuccessMessage(`Social link "${platform}" created successfully.`);
      }

      await fetchLinks();
      setViewMode('list');
      setEditingId(null);
    } catch (err) {
      setError(err.message || 'Failed to save social link.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (link) => {
    setDeleteTarget(link);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAdminSocialLink(deleteTarget._id);
      setSuccessMessage(`Social link "${deleteTarget.platform}" deleted.`);
      setDeleteTarget(null);
      await fetchLinks();
    } catch (err) {
      setError(err.message || 'Failed to delete social link.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredLinks = links.filter((l) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      l.platform?.toLowerCase().includes(q) ||
      l.url?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredLinks.length / pageSize) || 1;
  const paginatedLinks = filteredLinks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Share2 className="w-6 h-6 text-emerald-400" />
            Social Links Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure social media profiles, developer handles, and communication channels.
          </p>
        </div>

        {viewMode === 'list' ? (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-lg shadow-emerald-500/20 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add Social Link
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCancelForm}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors self-start sm:self-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to List
          </button>
        )}
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p>{successMessage}</p>
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/50 border border-white/5 p-3 rounded-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by platform name or URL..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div className="text-xs text-slate-400 font-mono px-2 py-1 bg-slate-950/60 rounded border border-slate-800 self-end sm:self-auto">
              Total: {links.length}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 bg-slate-900/40 rounded-xl border border-white/5">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                <span className="text-sm">Loading social links...</span>
              </div>
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="text-center py-16 px-4 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
              <Globe className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-300">No social links found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? 'No links match your filter criteria.'
                  : 'Start adding your social profiles and professional networking links.'}
              </p>
              {!searchQuery && (
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add First Social Link
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedLinks.map((link) => {
                return (
                  <div
                    key={link._id}
                    className="p-5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                            <Share2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-100 text-base leading-snug group-hover:text-emerald-400 transition-colors">
                              {link.platform}
                            </h3>
                            {link.icon && (
                              <span className="text-[11px] font-mono text-slate-500">
                                icon: {link.icon}
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
                          #{link.order ?? 0}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs text-slate-400 pl-1">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 truncate max-w-full font-mono text-[12px] transition-colors"
                        >
                          <span className="truncate">{link.url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>

                        <div>
                          {link.isVisible ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                              <Eye className="w-3 h-3" />
                              Visible on Portfolio
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">
                              <EyeOff className="w-3 h-3" />
                              Hidden
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(link)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(link)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
              </div>

              {filteredLinks.length > pageSize && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredLinks.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT FORM */}
      {viewMode !== 'list' && (
        <form
          onSubmit={handleSave}
          className="bg-(--bg-card) border border-(--border-color) rounded-2xl p-6 space-y-6 shadow-xl backdrop-blur-md transition-colors"
        >
          <div className="flex items-center justify-between pb-4 border-b border-(--border-color)">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-(--text-primary)">
                {viewMode === 'edit' ? 'Edit Social Link' : 'Add New Social Link'}
              </h2>
              {viewMode === 'edit' && (
                <p className="text-xs font-mono text-(--text-muted) mt-0.5">
                  Record ID: <span className="text-cyan-500">{editingId}</span> (Updates existing record)
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleCancelForm}
              className="text-xs font-mono text-(--text-muted) hover:text-(--text-primary) transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Quick chips for platform */}
          <div>
            <label className="text-xs font-mono font-medium text-(--text-secondary) mb-2 block">
              Quick Select Platform
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setPlatform(p);
                    if (!icon) setIcon(p.toLowerCase().replace(/[^a-z0-9]/g, ''));
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg transition-colors border font-mono ${
                    platform === p
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 font-semibold'
                      : 'bg-(--bg-primary) border-(--border-color) text-(--text-muted) hover:text-(--text-primary)'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AdminFormField
              label="Platform Name"
              htmlFor="socialPlatform"
              required
              error={fieldErrors.platform}
            >
              <input
                id="socialPlatform"
                type="text"
                value={platform}
                onChange={(e) => {
                  setPlatform(e.target.value);
                  if (fieldErrors.platform) setFieldErrors((p) => ({ ...p, platform: null }));
                }}
                placeholder="e.g. GitHub, LinkedIn, Twitter"
                className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm font-mono text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                required
              />
            </AdminFormField>

            <AdminFormField
              label="URL / Target"
              htmlFor="socialUrl"
              required
              error={fieldErrors.url}
            >
              <input
                id="socialUrl"
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (fieldErrors.url) setFieldErrors((p) => ({ ...p, url: null }));
                }}
                placeholder="https://github.com/username or mailto:user@domain.com"
                className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm font-mono text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                required
              />
            </AdminFormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <AdminFormField
              label="Icon Identifier"
              htmlFor="socialIcon"
              helperText="Optional icon name or identifier"
            >
              <input
                id="socialIcon"
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="e.g. github, linkedin, twitter, mail"
                className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm font-mono text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
              />
            </AdminFormField>

            <div className="flex flex-col justify-center">
              <label className="text-xs font-mono font-medium text-(--text-secondary) mb-2">
                Visibility
              </label>
              <AdminToggle
                label="Visible on public portfolio"
                checked={isVisible}
                onChange={(checked) => setIsVisible(checked)}
              />
            </div>

            <AdminFormField
              label="Display Order"
              htmlFor="socialOrder"
              helperText="Lower number displays first"
            >
              <input
                id="socialOrder"
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm font-mono text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
              />
            </AdminFormField>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-(--border-color)">
            <button
              type="button"
              onClick={handleCancelForm}
              disabled={saving}
              className="px-4 py-2 text-xs font-mono font-medium text-(--text-secondary) hover:text-(--text-primary) bg-(--bg-primary) border border-(--border-color) rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-mono font-semibold text-slate-950 bg-cyan-500 hover:bg-cyan-400 rounded-xl shadow-md hover:shadow-cyan-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {viewMode === 'edit' ? 'Update Social Link' : 'Create Social Link'}
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Delete Confirmation Modal */}
      <AdminConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Social Link"
        message={`Are you sure you want to delete "${deleteTarget?.platform}" (${deleteTarget?.url})? This action cannot be undone.`}
        confirmLabel={deleting ? 'Deleting...' : 'Delete Social Link'}
        isDestructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
