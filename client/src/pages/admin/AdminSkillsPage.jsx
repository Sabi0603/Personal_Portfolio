import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import {
  getAdminSkills,
  createAdminSkill,
  updateAdminSkill,
  deleteAdminSkill,
} from '../../services/adminService';
import AdminFormField from '../../components/admin/AdminFormField';
import AdminToggle from '../../components/admin/AdminToggle';
import AdminMediaUploader from '../../components/admin/AdminMediaUploader';
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import {
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Layers,
  Percent,
} from 'lucide-react';

const PRESET_CATEGORIES = [
  'All',
  'Frontend',
  'Backend',
  'Database',
  'Tools & DevOps',
  'Languages',
  'Other',
];

const INITIAL_FORM = {
  _id: null,
  name: '',
  category: 'Frontend',
  icon: { url: '', publicId: '' },
  proficiency: 80,
  order: 0,
  isPublished: true,
};

export default function AdminSkillsPage() {
  useDocumentTitle('Skill Management | Admin Command');

  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtering & Pagination State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(1);
  const pageSize = 9;

  // Modal & Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirm Dialog State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSkills = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminSkills();
      const list = Array.isArray(data) ? data : data?.items || [];
      setSkills(list);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch skills from database.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    getAdminSkills()
      .then((data) => {
        if (isMounted) {
          const list = Array.isArray(data) ? data : data?.items || [];
          setSkills(list);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to fetch skills from database.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Client-side Filtered List (for instant search & category tab response)
  const filteredSkills = useMemo(() => {
    return skills.filter((item) => {
      const matchesSearch =
        !search.trim() ||
        item.name.toLowerCase().includes(search.toLowerCase().trim()) ||
        item.category.toLowerCase().includes(search.toLowerCase().trim());

      const matchesCat =
        selectedCategory === 'All' ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCat;
    });
  }, [skills, search, selectedCategory]);

  // Paginated Window
  const totalPages = Math.ceil(filteredSkills.length / pageSize) || 1;
  const paginatedSkills = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSkills.slice(start, start + pageSize);
  }, [filteredSkills, page, pageSize]);

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  // Handlers for Create/Edit Modal
  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData(INITIAL_FORM);
    setFormErrors({});
    setModalOpen(true);
  };

  const normalizeIcon = (icon) => {
    if (!icon) return { url: '', publicId: '' };
    if (typeof icon === 'string') return { url: icon, publicId: '' };
    return { url: icon.url || '', publicId: icon.publicId || '' };
  };

  const handleOpenEdit = (skill) => {
    setIsEditing(true);
    setFormData({
      _id: skill._id,
      name: skill.name || '',
      category: skill.category || 'Frontend',
      icon: normalizeIcon(skill.icon),
      proficiency: Number(skill.proficiency) || 80,
      order: Number(skill.order) || 0,
      isPublished: skill.isPublished ?? true,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (submitting) return;
    setModalOpen(false);
    setFormData(INITIAL_FORM);
    setFormErrors({});
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.name || !formData.name.trim()) {
      errs.name = 'Skill name is required';
    }
    if (!formData.category || !formData.category.trim()) {
      errs.category = 'Category is required';
    }
    const prof = Number(formData.proficiency);
    if (isNaN(prof) || prof < 0 || prof > 100) {
      errs.proficiency = 'Proficiency must be between 0 and 100%';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        icon: formData.icon,
        proficiency: Number(formData.proficiency),
        order: Number(formData.order) || 0,
        isPublished: formData.isPublished,
      };

      if (isEditing && formData._id) {
        // STRICT EDIT: Updates existing record _id
        await updateAdminSkill(formData._id, payload);
        setSuccess(`Skill "${payload.name}" updated successfully.`);
      } else {
        // CREATE: Calls POST
        await createAdminSkill(payload);
        setSuccess(`Skill "${payload.name}" created successfully.`);
      }

      await fetchSkills();
      setModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to save skill.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Action Handlers
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError('');
    setSuccess('');

    try {
      await deleteAdminSkill(deleteTarget._id);
      setSuccess(`Skill "${deleteTarget.name}" deleted successfully.`);
      setDeleteTarget(null);
      await fetchSkills();
    } catch (err) {
      setError(err.message || 'Failed to delete skill.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl border border-(--border-color) bg-(--bg-card) backdrop-blur-md shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-500 font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Curated Technologies</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-(--text-primary)">
            Skills Management
          </h1>
          <p className="text-xs font-mono text-(--text-muted)">
            Manage your verified technologies, proficiencies, and categories shown on the public site.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs font-mono bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-md hover:shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Skill</span>
        </button>
      </div>

      {/* Notifications */}
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono animate-zoom-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
          <button
            type="button"
            onClick={() => setSuccess('')}
            className="ml-auto p-1 hover:text-emerald-500"
            aria-label="Dismiss alert"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-mono animate-zoom-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError('')}
            className="ml-auto p-1 hover:text-rose-500"
            aria-label="Dismiss alert"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search & Category Tabs */}
      <div className="p-4 sm:p-5 rounded-2xl border border-(--border-color) bg-(--bg-card) backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search skills by name or category..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-(--border-color) bg-(--bg-primary) text-xs font-mono text-(--text-primary) placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {PRESET_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-linear-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-sm'
                  : 'border border-(--border-color) bg-(--bg-card) text-(--text-muted) hover:text-(--text-primary)'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      {loading ? (
        <LoadingSkeleton count={6} type="cards" />
      ) : filteredSkills.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No Skills Found"
          description={
            skills.length === 0
              ? 'No skills have been created yet. Add your first technology above.'
              : 'No skills match your current search or category filter.'
          }
          actionText={skills.length === 0 ? 'Add First Skill' : 'Reset Filters'}
          onAction={skills.length === 0 ? handleOpenCreate : () => { setSearch(''); setSelectedCategory('All'); }}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedSkills.map((skill) => (
              <div
                key={skill._id}
                className="p-5 rounded-2xl border border-(--border-color) bg-(--bg-card) backdrop-blur-md hover:border-cyan-500/40 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group shadow-sm"
              >
                <div>
                  {/* Top Bar: Icon + Category + Published Tag */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-(--border-color)/60 mb-4">
                    <div className="flex items-center gap-3">
                      {skill.icon?.url ? (
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-(--border-color) bg-(--bg-primary) p-1 shrink-0">
                          <img
                            src={skill.icon.url}
                            alt={skill.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center shrink-0">
                          <Layers className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-sm tracking-tight text-(--text-primary)">
                          {skill.name}
                        </h3>
                        <span className="text-[10px] font-mono text-(--text-muted)">
                          {skill.category}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
                        skill.isPublished
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {skill.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  {/* Proficiency Meter */}
                  <div className="space-y-1.5 my-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-(--text-muted)">Proficiency</span>
                      <span className="font-bold text-cyan-600 dark:text-cyan-400">
                        {skill.proficiency}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                        style={{ width: `${Math.min(Math.max(skill.proficiency, 0), 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="pt-4 border-t border-(--border-color)/60 flex items-center justify-between mt-2">
                  <span className="text-[10px] font-mono text-(--text-muted)">
                    Order: {skill.order}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(skill)}
                      className="p-1.5 rounded-lg border border-(--border-color) bg-(--bg-card) hover:bg-cyan-500/10 hover:text-cyan-500 text-slate-500 transition-colors cursor-pointer"
                      title="Edit Skill"
                      aria-label={`Edit ${skill.name}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(skill)}
                      className="p-1.5 rounded-lg border border-(--border-color) bg-(--bg-card) hover:bg-rose-500/10 hover:text-rose-500 text-slate-500 transition-colors cursor-pointer"
                      title="Delete Skill"
                      aria-label={`Delete ${skill.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={filteredSkills.length}
            pageSize={pageSize}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      )}

      {/* Modal: Create / Edit Skill */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-(--border-color) bg-(--bg-card) backdrop-blur-xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6 animate-zoom-in scrollbar-none z-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-(--border-color)">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold tracking-tight text-(--text-primary)">
                  {isEditing ? 'Edit Skill' : 'Create New Skill'}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={submitting}
                className="p-1.5 rounded-xl border border-(--border-color) text-slate-400 hover:text-(--text-primary) transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AdminFormField
                label="Skill Name *"
                error={formErrors.name}
                help="e.g. React, Node.js, TypeScript, Docker"
              >
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. React"
                  className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-xs font-mono text-(--text-primary) focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
                  required
                />
              </AdminFormField>

              <AdminFormField
                label="Category *"
                error={formErrors.category}
                help="Select or enter custom category"
              >
                <div className="space-y-2">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-xs font-mono text-(--text-primary) focus:outline-none focus:border-cyan-500"
                  >
                    {PRESET_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Or type custom category..."
                    className="w-full px-4 py-2 rounded-xl border border-(--border-color) bg-(--bg-primary) text-xs font-mono text-(--text-primary) focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </AdminFormField>

              {/* Proficiency Percentage Slider & Input */}
              <AdminFormField
                label="Proficiency Percentage (0 - 100%) *"
                error={formErrors.proficiency}
                help="Accurate representation of your expertise with this technology"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-(--text-muted)">Selected Level:</span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                      {formData.proficiency}
                      <Percent className="w-3 h-3" />
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.proficiency}
                    onChange={(e) =>
                      setFormData({ ...formData, proficiency: Number(e.target.value) })
                    }
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.proficiency}
                    onChange={(e) =>
                      setFormData({ ...formData, proficiency: Number(e.target.value) })
                    }
                    className="w-28 px-3 py-1.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-xs font-mono text-(--text-primary) focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </AdminFormField>

              {/* Display Order */}
              <AdminFormField
                label="Display Order"
                help="Lower numbers appear first in the public listing (default 0)"
              >
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-xs font-mono text-(--text-primary) focus:outline-none focus:border-cyan-500"
                />
              </AdminFormField>

              {/* Skill Icon Upload */}
              <AdminFormField
                label="Skill Icon (Optional)"
                help="Upload SVG, PNG, or WebP logo via Cloudinary"
              >
                <AdminMediaUploader
                  label="Upload Skill Icon"
                  folder="skills"
                  value={formData.icon}
                  onChange={(media) =>
                    setFormData((prev) => ({
                      ...prev,
                      icon: media
                        ? { url: media.url, publicId: media.publicId || '' }
                        : { url: '', publicId: '' },
                    }))
                  }
                  accept="image/*"
                  disabled={submitting}
                />
              </AdminFormField>

              {/* Published Toggle */}
              <div className="pt-2">
                <AdminToggle
                  label="Published Status"
                  description="When enabled, this skill is publicly visible on your Skills page."
                  checked={formData.isPublished}
                  onChange={(val) => setFormData({ ...formData, isPublished: val })}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-(--border-color)">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl border border-(--border-color) text-xs font-mono text-(--text-muted) hover:text-(--text-primary) transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-mono font-semibold bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{isEditing ? 'Save Changes' : 'Create Skill'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AdminConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Skill"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete Skill"
        cancelText="Cancel"
        isDestructive={true}
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
