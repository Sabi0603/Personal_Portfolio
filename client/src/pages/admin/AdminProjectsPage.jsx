import { useState, useEffect, useMemo } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import {
  getAdminProjects,
  createAdminProject,
  updateAdminProject,
  deleteAdminProject,
  uploadMedia,
} from '../../services/adminService';
import AdminFormField from '../../components/admin/AdminFormField';
import AdminToggle from '../../components/admin/AdminToggle';
import AdminTagInput from '../../components/admin/AdminTagInput';
import AdminMediaUploader from '../../components/admin/AdminMediaUploader';
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog';
import Pagination from '../../components/Pagination';
import ProjectScreenshotSlider from '../../components/ProjectScreenshotSlider';
import {
  FolderGit2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Save,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function AdminProjectsPage() {
  useDocumentTitle('Projects Management | Admin Command');

  // List State
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Mode: 'list' | 'create' | 'edit'
  const [viewMode, setViewMode] = useState('list');
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [techStack, setTechStack] = useState([]);
  const [demoUrl, setDemoUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [thumbnail, setThumbnail] = useState(null); // { url, publicId, file?, previewUrl?, isStaged? }
  const [screenshots, setScreenshots] = useState([]); // [{ url, publicId, caption, file?, previewUrl?, isStaged? }]
  const [showSliderPreview, setShowSliderPreview] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [order, setOrder] = useState(0);

  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Helper to revoke temporary object URLs
  const cleanupStagedMedia = (thumb, shots) => {
    if (thumb?.isStaged && thumb?.previewUrl) {
      try {
        URL.revokeObjectURL(thumb.previewUrl);
      } catch {
        // ignore
      }
    }
    if (Array.isArray(shots)) {
      shots.forEach((s) => {
        if (s?.isStaged && s?.previewUrl) {
          try {
            URL.revokeObjectURL(s.previewUrl);
          } catch {
            // ignore
          }
        }
      });
    }
  };

  // Fetch Projects List
  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load projects from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getAdminProjects()
      .then((data) => {
        if (isMounted) {
          setProjects(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load projects from backend.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered List
  const filteredProjects = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.slug?.toLowerCase().includes(q) ||
        (Array.isArray(p.techStack) && p.techStack.some((t) => t.toLowerCase().includes(q)))
    );
  }, [projects, searchQuery]);

  const totalPages = Math.ceil(filteredProjects.length / pageSize) || 1;
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProjects.slice(start, start + pageSize);
  }, [filteredProjects, currentPage, pageSize]);

  // Open Create Form
  const handleOpenCreate = () => {
    cleanupStagedMedia(thumbnail, screenshots);
    setEditingId(null);
    setTitle('');
    setSlug('');
    setSummary('');
    setDescription('');
    setProblem('');
    setSolution('');
    setTechStack([]);
    setDemoUrl('');
    setGithubUrl('');
    setThumbnail(null);
    setScreenshots([]);
    setShowSliderPreview(false);
    setFeatured(false);
    setIsPublished(true);
    setOrder(projects.length);
    setFieldErrors({});
    setError('');
    setSuccessMessage('');
    setViewMode('create');
  };

  // Open Edit Form
  const handleOpenEdit = (project) => {
    cleanupStagedMedia(thumbnail, screenshots);
    setEditingId(project._id);
    setTitle(project.title || '');
    setSlug(project.slug || '');
    setSummary(project.summary || '');
    setDescription(project.description || '');
    setProblem(project.problem || '');
    setSolution(project.solution || '');
    setTechStack(Array.isArray(project.techStack) ? project.techStack : []);
    setDemoUrl(project.demoUrl || '');
    setGithubUrl(project.githubUrl || '');
    setThumbnail(project.thumbnail?.url ? project.thumbnail : null);
    setScreenshots(Array.isArray(project.screenshots) ? project.screenshots : []);
    setShowSliderPreview(false);
    setFeatured(Boolean(project.featured));
    setIsPublished(project.isPublished !== false);
    setOrder(project.order || 0);
    setFieldErrors({});
    setError('');
    setSuccessMessage('');
    setViewMode('edit');
  };

  // Cancel form
  const handleCancelForm = () => {
    cleanupStagedMedia(thumbnail, screenshots);
    setShowSliderPreview(false);
    setViewMode('list');
    setEditingId(null);
  };

  // Slug generator helper
  const generateSlugFromTitle = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Form Validation
  const validate = () => {
    const errors = {};
    if (!title.trim()) errors.title = 'Project title is required.';
    else if (title.trim().length > 150) errors.title = 'Title cannot exceed 150 characters.';

    if (!slug.trim()) errors.slug = 'Project slug is required.';
    else if (!/^[a-z0-9-]+$/.test(slug.trim())) {
      errors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens.';
    }

    if (!summary.trim()) errors.summary = 'Summary is required.';
    else if (summary.trim().length > 350) errors.summary = 'Summary cannot exceed 350 characters.';

    if (!description.trim()) errors.description = 'Detailed description is required.';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Submit (Create vs Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!validate()) return;

    setSaving(true);
    try {
      // 1. Upload staged thumbnail if any
      let finalThumbnail = { url: '', publicId: '' };
      if (thumbnail?.isStaged && thumbnail?.file) {
        const thumbRes = await uploadMedia(thumbnail.file, 'projects');
        const thumbData = thumbRes?.data?.url ? thumbRes.data : thumbRes;
        if (!thumbData?.url) throw new Error('Thumbnail upload failed to return a valid URL.');
        finalThumbnail = {
          url: thumbData.url,
          publicId: thumbData.publicId || '',
        };
      } else if (thumbnail?.url && !thumbnail?.isStaged) {
        finalThumbnail = {
          url: thumbnail.url,
          publicId: thumbnail.publicId || '',
        };
      }

      // 2. Upload staged screenshots if any
      const finalScreenshots = [];
      for (const shot of screenshots) {
        if (shot.isStaged && shot.file) {
          const shotRes = await uploadMedia(shot.file, 'projects');
          const shotData = shotRes?.data?.url ? shotRes.data : shotRes;
          if (!shotData?.url) throw new Error('Screenshot upload failed to return a valid URL.');
          finalScreenshots.push({
            url: shotData.url,
            publicId: shotData.publicId || '',
            caption: shot.caption ? shot.caption.trim() : '',
          });
        } else if (shot.url && !shot.isStaged) {
          finalScreenshots.push({
            url: shot.url,
            publicId: shot.publicId || '',
            caption: shot.caption ? shot.caption.trim() : '',
          });
        }
      }

      const payload = {
        title: title.trim(),
        slug: slug.toLowerCase().trim(),
        summary: summary.trim(),
        description: description.trim(),
        problem: problem.trim(),
        solution: solution.trim(),
        techStack,
        demoUrl: demoUrl.trim(),
        githubUrl: githubUrl.trim(),
        thumbnail: finalThumbnail,
        screenshots: finalScreenshots,
        featured,
        isPublished,
        order: Number(order) || 0,
      };

      if (editingId) {
        // EDIT FLOW: Use PUT with existing _id
        await updateAdminProject(editingId, payload);
        setSuccessMessage(`Project "${payload.title}" updated successfully.`);
      } else {
        // CREATE FLOW: Use POST
        await createAdminProject(payload);
        setSuccessMessage(`Project "${payload.title}" created successfully.`);
      }

      cleanupStagedMedia(thumbnail, screenshots);
      await fetchProjects();
      setViewMode('list');
      setEditingId(null);
    } catch (err) {
      setError(err.message || 'Failed to save project. Please check slug uniqueness or inputs.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError('');
    try {
      await deleteAdminProject(deleteTarget._id);
      setSuccessMessage(`Project "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
      await fetchProjects();
    } catch (err) {
      setError(err.message || 'Failed to delete project.');
    } finally {
      setDeleting(false);
    }
  };

  // Screenshots helpers
  const handleAddScreenshot = (uploadedAsset) => {
    if (!uploadedAsset) return;
    setScreenshots((prev) => [
      ...prev,
      {
        url: uploadedAsset.url || uploadedAsset.previewUrl || '',
        previewUrl: uploadedAsset.previewUrl || uploadedAsset.url || '',
        file: uploadedAsset.file || null,
        publicId: uploadedAsset.publicId || '',
        isStaged: Boolean(uploadedAsset.isStaged),
        caption: '',
      },
    ]);
  };

  const handleUpdateScreenshotCaption = (idx, caption) => {
    setScreenshots((prev) => {
      const copy = [...prev];
      copy[idx].caption = caption;
      return copy;
    });
  };

  const handleRemoveScreenshot = (idx) => {
    setScreenshots((prev) => {
      const target = prev[idx];
      if (target?.isStaged && target?.previewUrl) {
        try {
          URL.revokeObjectURL(target.previewUrl);
        } catch {
          // ignore
        }
      }
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleMoveScreenshot = (idx, direction) => {
    setScreenshots((prev) => {
      const targetIdx = idx + direction;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  return (
    <div className="space-y-8">
      {/* Notifications */}
      {error && (
        <div
          role="alert"
          className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-start gap-3 text-xs leading-relaxed"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div
          role="alert"
          className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-start gap-3 text-xs leading-relaxed"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE: LIST */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-(--border-color)">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-(--text-primary)">
                Projects Management
              </h1>
              <p className="text-xs font-mono text-(--text-muted)">
                Create, edit, reorder, and publish portfolio project case studies.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs font-mono bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md hover:shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search projects by title, slug, or tech..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-card) text-xs font-mono text-(--text-primary) placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Table / List */}
          {loading ? (
            <div className="p-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mx-auto" />
              <p className="text-xs font-mono text-(--text-muted)">Loading projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-16 text-center rounded-2xl border border-dashed border-(--border-color) bg-(--bg-card)/40 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 flex items-center justify-center mx-auto">
                <FolderGit2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-(--text-primary)">
                {projects.length === 0 ? 'No Projects Yet' : 'No matching projects'}
              </h3>
              <p className="text-xs font-mono text-(--text-muted) max-w-sm mx-auto">
                {projects.length === 0
                  ? 'Get started by creating your first showcase project.'
                  : 'Try adjusting your search terms.'}
              </p>
              {projects.length === 0 && (
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-mono font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Project</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-(--border-color) bg-(--bg-card) overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono divide-y divide-(--border-color)">
                    <thead className="bg-(--bg-primary)/80 text-(--text-muted) uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3.5 px-4">Project</th>
                        <th className="py-3.5 px-4">Slug</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Featured</th>
                        <th className="py-3.5 px-4">Order</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-(--border-color)/60">
                      {paginatedProjects.map((p) => (
                        <tr
                          key={p._id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              {p.thumbnail?.url ? (
                                <img
                                  src={p.thumbnail.url}
                                  alt={p.title}
                                  className="w-10 h-10 rounded-lg object-cover border border-(--border-color) shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 flex items-center justify-center shrink-0">
                                  <FolderGit2 className="w-4 h-4" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-bold text-(--text-primary) truncate max-w-xs">
                                  {p.title}
                                </p>
                                <p className="text-[11px] text-(--text-muted) truncate max-w-xs">
                                  {p.summary}
                                </p>
                              </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-(--text-secondary)">
                          /{p.slug}
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              p.isPublished
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                : 'bg-slate-500/10 text-slate-500 border-slate-500/30'
                            }`}
                          >
                            {p.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          {p.featured ? (
                            <span className="inline-flex items-center gap-1 text-cyan-500 text-[11px] font-semibold">
                              <Sparkles className="w-3 h-3" />
                              <span>Featured</span>
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-(--text-muted)">
                          {p.order ?? 0}
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(p)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-500 hover:bg-cyan-500/10 transition-colors"
                              aria-label={`Edit ${p.title}`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteTarget(p)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                              aria-label={`Delete ${p.title}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>

              {filteredProjects.length > pageSize && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredProjects.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE: CREATE OR EDIT */}
      {/* ========================================================================= */}
      {(viewMode === 'create' || viewMode === 'edit') && (
        <form onSubmit={handleSubmit} noValidate className="space-y-8 max-w-4xl mx-auto">
          {/* Form Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-(--border-color)">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCancelForm}
                className="p-2 rounded-xl border border-(--border-color) bg-(--bg-card) hover:bg-slate-100 dark:hover:bg-slate-800 text-(--text-primary) transition-colors"
                aria-label="Back to projects list"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-(--text-primary)">
                  {viewMode === 'edit' ? 'Edit Project' : 'Create New Project'}
                </h1>
                <p className="text-xs font-mono text-(--text-muted)">
                  {viewMode === 'edit' ? `Updating record ID: ${editingId}` : 'Add a new showcase project'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelForm}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-card) hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono text-(--text-primary) transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs font-mono bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md hover:shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>{viewMode === 'edit' ? 'Update Project' : 'Save Project'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section 1: Overview */}
          <section className="p-6 sm:p-8 rounded-3xl border border-(--border-color) bg-(--bg-card) space-y-6">
            <h2 className="text-xs font-mono uppercase tracking-wider text-cyan-500 font-semibold">
              General Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <AdminFormField
                label="Project Title"
                htmlFor="projTitle"
                required
                helperText="Max 150 characters"
                error={fieldErrors.title}
              >
                <input
                  id="projTitle"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!editingId && (!slug || slug === generateSlugFromTitle(title))) {
                      setSlug(generateSlugFromTitle(e.target.value));
                    }
                    if (fieldErrors.title) setFieldErrors((p) => ({ ...p, title: null }));
                  }}
                  maxLength={150}
                  placeholder="e.g. Real-Time Analytics Dashboard"
                  className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 font-mono"
                />
              </AdminFormField>

              <AdminFormField
                label="Slug (URL identifier)"
                htmlFor="projSlug"
                required
                helperText="Unique identifier for URL /projects/:slug"
                error={fieldErrors.slug}
              >
                <input
                  id="projSlug"
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value.toLowerCase().trim());
                    if (fieldErrors.slug) setFieldErrors((p) => ({ ...p, slug: null }));
                  }}
                  placeholder="analytics-dashboard"
                  className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 font-mono"
                />
              </AdminFormField>
            </div>

            <AdminFormField
              label="Short Summary"
              htmlFor="projSummary"
              required
              helperText={`${summary.length}/350 characters. Displayed on project cards.`}
              error={fieldErrors.summary}
            >
              <input
                id="projSummary"
                type="text"
                value={summary}
                onChange={(e) => {
                  setSummary(e.target.value);
                  if (fieldErrors.summary) setFieldErrors((p) => ({ ...p, summary: null }));
                }}
                maxLength={350}
                placeholder="Brief high-level overview of the application and architecture..."
                className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500"
              />
            </AdminFormField>

            <AdminFormField
              label="Detailed Case Study / Description"
              htmlFor="projDesc"
              required
              helperText="Comprehensive description covering architecture, challenges, and implementation details."
              error={fieldErrors.description}
            >
              <textarea
                id="projDesc"
                rows={8}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (fieldErrors.description) setFieldErrors((p) => ({ ...p, description: null }));
                }}
                placeholder="In-depth project breakdown..."
                className="w-full p-4 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 resize-y leading-relaxed"
              />
            </AdminFormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AdminFormField
                label="The Problem / Challenge (Optional)"
                htmlFor="projProblem"
                helperText="Explain the core problem, user friction, or technical challenges this project solves."
              >
                <textarea
                  id="projProblem"
                  rows={5}
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="e.g. Traditional inventory systems suffered from inconsistent state and high latency..."
                  className="w-full p-3.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-xs sm:text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 resize-y leading-relaxed"
                />
              </AdminFormField>

              <AdminFormField
                label="The Solution / Architecture (Optional)"
                htmlFor="projSolution"
                helperText="Explain the technical architecture, design patterns, and engineering choices."
              >
                <textarea
                  id="projSolution"
                  rows={5}
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  placeholder="e.g. Built an event-driven architecture using Redis pub/sub and optimistic UI updates..."
                  className="w-full p-3.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-xs sm:text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 resize-y leading-relaxed"
                />
              </AdminFormField>
            </div>

            <AdminFormField
              label="Technologies Used"
              helperText="Add technical competencies (React, Node.js, Socket.io, MongoDB, etc.)"
            >
              <AdminTagInput
                tags={techStack}
                onChange={setTechStack}
                placeholder="Add tech..."
                disabled={saving}
              />
            </AdminFormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <AdminFormField label="Live Demo URL" htmlFor="demoUrl">
                <input
                  id="demoUrl"
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 font-mono"
                />
              </AdminFormField>

              <AdminFormField label="GitHub Repository URL" htmlFor="githubUrl">
                <input
                  id="githubUrl"
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/sabari/repo"
                  className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 font-mono"
                />
              </AdminFormField>
            </div>
          </section>

          {/* Section 2: Media (Thumbnail & Screenshots) */}
          <section className="p-6 sm:p-8 rounded-3xl border border-(--border-color) bg-(--bg-card) space-y-6">
            <h2 className="text-xs font-mono uppercase tracking-wider text-cyan-500 font-semibold">
              Project Media
            </h2>

            {/* Thumbnail */}
            <AdminMediaUploader
              value={thumbnail}
              onChange={setThumbnail}
              folder="projects"
              accept="image/*"
              label="Cover Thumbnail Banner"
              helperText="Select cover image (staged locally, uploaded to Cloudinary only on Save)"
              disabled={saving}
              staged={true}
            />

            {/* Screenshots Gallery */}
            <div className="space-y-4 pt-4 border-t border-(--border-color)/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-mono font-semibold text-(--text-primary)">
                    Screenshots Gallery ({screenshots.length})
                  </h3>
                  <p className="text-[11px] font-mono text-(--text-muted)">
                    Add supporting UI and architecture screenshots. Staged files upload only on Save.
                  </p>
                </div>

                {screenshots.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowSliderPreview((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-mono font-medium hover:bg-cyan-500/20 transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{showSliderPreview ? 'Hide Slider Preview' : 'Test Slider Preview'}</span>
                  </button>
                )}
              </div>

              {/* Slider Preview inside Admin */}
              {showSliderPreview && screenshots.length > 0 && (
                <div className="p-4 rounded-2xl border border-cyan-500/30 bg-slate-950/70 backdrop-blur-md space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-[11px] font-mono text-cyan-400 font-medium">
                      Live Gallery Slider Preview (Public View Simulation)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSliderPreview(false)}
                      className="text-slate-400 hover:text-white text-xs font-mono"
                    >
                      Close
                    </button>
                  </div>
                  <ProjectScreenshotSlider screenshots={screenshots} title={title || 'Project'} />
                </div>
              )}

              {screenshots.map((shot, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border border-(--border-color) bg-(--bg-primary)"
                >
                  <div className="relative w-28 h-20 rounded-lg border border-(--border-color) bg-slate-950/80 overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src={shot.url || shot.previewUrl}
                      alt={shot.caption || `Screenshot ${idx + 1}`}
                      className="max-h-full max-w-full object-contain"
                    />
                    {shot.isStaged && (
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500 text-slate-950 font-bold">
                        Staged
                      </span>
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-1">
                    <input
                      type="text"
                      value={shot.caption || ''}
                      onChange={(e) => handleUpdateScreenshotCaption(idx, e.target.value)}
                      placeholder="Screenshot caption or feature title..."
                      className="w-full px-3 py-2 rounded-lg border border-(--border-color) bg-(--bg-card) text-xs font-mono text-(--text-primary) focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleMoveScreenshot(idx, -1)}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-500 hover:bg-cyan-500/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                      title="Move up"
                      aria-label="Move screenshot up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMoveScreenshot(idx, 1)}
                      disabled={idx === screenshots.length - 1}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-500 hover:bg-cyan-500/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                      title="Move down"
                      aria-label="Move screenshot down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveScreenshot(idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Remove screenshot"
                      aria-label="Remove screenshot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <AdminMediaUploader
                  value={null}
                  onChange={handleAddScreenshot}
                  folder="projects"
                  accept="image/*"
                  label=""
                  helperText="Select an image to stage in gallery (uploaded to Cloudinary only on Save)"
                  disabled={saving}
                  staged={true}
                />
              </div>
            </div>
          </section>

          {/* Section 3: Publishing & Ordering */}
          <section className="p-6 sm:p-8 rounded-3xl border border-(--border-color) bg-(--bg-card) space-y-6">
            <h2 className="text-xs font-mono uppercase tracking-wider text-cyan-500 font-semibold">
              Publishing Controls
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AdminToggle
                id="isPublished"
                checked={isPublished}
                onChange={setIsPublished}
                label="Publicly Published"
                description="When enabled, this project appears on the public portfolio."
              />

              <AdminToggle
                id="featured"
                checked={featured}
                onChange={setFeatured}
                label="Featured Project"
                description="Spotlight this build in the home page featured projects showcase."
              />
            </div>

            <AdminFormField
              label="Display Order Index"
              htmlFor="projOrder"
              helperText="Lower numbers appear first."
            >
              <input
                id="projOrder"
                type="number"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
                className="w-36 px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 font-mono"
              />
            </AdminFormField>
          </section>

          {/* Bottom Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancelForm}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-card) hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono text-(--text-primary) transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-xs font-mono bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md hover:shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Project...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{viewMode === 'edit' ? 'Update Project' : 'Save Project'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Delete Confirmation Modal */}
      <AdminConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Project"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmText="Delete Project"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
