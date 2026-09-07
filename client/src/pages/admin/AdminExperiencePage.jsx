import { useState, useEffect } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import {
  getAdminExperiences,
  createAdminExperience,
  updateAdminExperience,
  deleteAdminExperience,
} from '../../services/adminService';
import AdminFormField from '../../components/admin/AdminFormField';
import AdminToggle from '../../components/admin/AdminToggle';
import AdminTagInput from '../../components/admin/AdminTagInput';
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog';
import Pagination from '../../components/Pagination';
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Save,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  MapPin,
} from 'lucide-react';

const EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance',
  'Internship',
];

export default function AdminExperiencePage() {
  useDocumentTitle('Experience Management | Admin Command');

  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Mode: 'list' | 'create' | 'edit'
  const [viewMode, setViewMode] = useState('list');
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [descriptionText, setDescriptionText] = useState('');
  const [techStack, setTechStack] = useState([]);
  const [companyUrl, setCompanyUrl] = useState('');
  const [order, setOrder] = useState(0);

  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchExperiences = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminExperiences();
      setExperiences(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load experience records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getAdminExperiences()
      .then((data) => {
        if (isMounted) {
          setExperiences(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load experience records.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle('');
    setCompany('');
    setLocation('');
    setEmploymentType('Full-time');
    setStartDate('');
    setEndDate('');
    setIsCurrent(false);
    setDescriptionText('');
    setTechStack([]);
    setCompanyUrl('');
    setOrder(experiences.length);
    setFieldErrors({});
    setError('');
    setSuccessMessage('');
    setViewMode('create');
  };

  const handleOpenEdit = (exp) => {
    setEditingId(exp._id);
    setTitle(exp.title || '');
    setCompany(exp.company || '');
    setLocation(exp.location || '');
    setEmploymentType(exp.employmentType || 'Full-time');
    setStartDate(exp.startDate ? new Date(exp.startDate).toISOString().slice(0, 10) : '');
    setEndDate(exp.endDate ? new Date(exp.endDate).toISOString().slice(0, 10) : '');
    setIsCurrent(Boolean(exp.isCurrent));
    setDescriptionText(Array.isArray(exp.description) ? exp.description.join('\n') : '');
    setTechStack(Array.isArray(exp.techStack) ? exp.techStack : []);
    setCompanyUrl(exp.companyUrl || '');
    setOrder(exp.order || 0);
    setFieldErrors({});
    setError('');
    setSuccessMessage('');
    setViewMode('edit');
  };

  const validate = () => {
    const errors = {};
    if (!title.trim()) errors.title = 'Job title is required (max 120 characters).';
    else if (title.trim().length > 120) errors.title = 'Title cannot exceed 120 characters.';

    if (!company.trim()) errors.company = 'Company name is required (max 120 characters).';
    else if (company.trim().length > 120) errors.company = 'Company cannot exceed 120 characters.';

    if (!startDate) errors.startDate = 'Start date is required.';

    if (!isCurrent && !endDate) {
      errors.endDate = 'End date is required when not currently employed here.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!validate()) return;

    setSaving(true);
    try {
      const descriptionList = descriptionText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        title: title.trim(),
        company: company.trim(),
        location: location.trim(),
        employmentType,
        startDate: new Date(startDate),
        endDate: isCurrent ? null : (endDate ? new Date(endDate) : null),
        isCurrent,
        description: descriptionList,
        techStack,
        companyUrl: companyUrl.trim(),
        order: Number(order) || 0,
      };

      if (editingId) {
        // EDIT FLOW: PUT /api/admin/experience/:id
        await updateAdminExperience(editingId, payload);
        setSuccessMessage(`Experience at "${payload.company}" updated successfully.`);
      } else {
        // CREATE FLOW: POST /api/admin/experience
        await createAdminExperience(payload);
        setSuccessMessage(`Experience at "${payload.company}" created successfully.`);
      }

      await fetchExperiences();
      setViewMode('list');
      setEditingId(null);
    } catch (err) {
      setError(err.message || 'Failed to save experience entry.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError('');
    try {
      await deleteAdminExperience(deleteTarget._id);
      setSuccessMessage(`Experience entry at "${deleteTarget.company}" deleted.`);
      setDeleteTarget(null);
      await fetchExperiences();
    } catch (err) {
      setError(err.message || 'Failed to delete experience entry.');
    } finally {
      setDeleting(false);
    }
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
      {/* VIEW: LIST */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-(--border-color)">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-(--text-primary)">
                Work Experience Management
              </h1>
              <p className="text-xs font-mono text-(--text-muted)">
                Manage your professional employment timeline, engineering roles, and achievements.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs font-mono bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md hover:shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Experience</span>
            </button>
          </div>

          {loading ? (
            <div className="p-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mx-auto" />
              <p className="text-xs font-mono text-(--text-muted)">Loading experience records...</p>
            </div>
          ) : experiences.length === 0 ? (
            <div className="p-16 text-center rounded-2xl border border-dashed border-(--border-color) bg-(--bg-card)/40 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 flex items-center justify-center mx-auto">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-(--text-primary)">No Experience Recorded</h3>
              <p className="text-xs font-mono text-(--text-muted) max-w-sm mx-auto">
                Add your employment history, client roles, or internships.
              </p>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-mono font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Experience</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                {experiences
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map((exp) => (
                    <div
                      key={exp._id}
                      className="p-5 rounded-2xl border border-(--border-color) bg-(--bg-card) flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-cyan-500/30 transition-all shadow-sm"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-sm text-(--text-primary)">
                            {exp.title}
                          </h3>
                          <span className="text-xs font-mono text-cyan-500">
                            @ {exp.company}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-(--border-color) text-(--text-secondary)">
                            {exp.employmentType}
                          </span>
                          {exp.isCurrent && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold">
                              Current
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-(--text-muted)">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(exp.startDate).toLocaleDateString('en-US', {
                                month: 'short',
                                year: 'numeric',
                              })}{' '}
                              —{' '}
                              {exp.isCurrent
                                ? 'Present'
                                : exp.endDate
                                ? new Date(exp.endDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : 'N/A'}
                            </span>
                          </div>

                          {exp.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{exp.location}</span>
                            </div>
                          )}

                          <span>Order: {exp.order ?? 0}</span>
                        </div>

                        {Array.isArray(exp.techStack) && exp.techStack.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {exp.techStack.map((tech) => (
                              <span
                                key={tech}
                                className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-slate-800/80 text-(--text-secondary) border border-(--border-color)/60"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(exp)}
                          className="p-2 rounded-lg text-slate-400 hover:text-cyan-500 hover:bg-cyan-500/10 transition-colors"
                          aria-label={`Edit ${exp.title}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(exp)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                          aria-label={`Delete ${exp.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
              {experiences.length > pageSize && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(experiences.length / pageSize) || 1}
                  totalItems={experiences.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW: CREATE OR EDIT */}
      {/* ========================================================================= */}
      {(viewMode === 'create' || viewMode === 'edit') && (
        <form onSubmit={handleSubmit} noValidate className="space-y-8 max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-(--border-color)">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="p-2 rounded-xl border border-(--border-color) bg-(--bg-card) hover:bg-slate-100 dark:hover:bg-slate-800 text-(--text-primary) transition-colors"
                aria-label="Back to experience list"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-(--text-primary)">
                  {viewMode === 'edit' ? 'Edit Work Experience' : 'Add Work Experience'}
                </h1>
                <p className="text-xs font-mono text-(--text-muted)">
                  {viewMode === 'edit' ? `Updating ID: ${editingId}` : 'Create a new experience timeline entry'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-card) text-xs font-mono text-(--text-primary)"
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
                    <span>{viewMode === 'edit' ? 'Update Entry' : 'Save Entry'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <section className="p-6 sm:p-8 rounded-3xl border border-(--border-color) bg-(--bg-card) space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <AdminFormField
                label="Role / Job Title"
                htmlFor="expTitle"
                required
                helperText="Max 120 characters"
                error={fieldErrors.title}
              >
                <input
                  id="expTitle"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (fieldErrors.title) setFieldErrors((p) => ({ ...p, title: null }));
                  }}
                  maxLength={120}
                  placeholder="Senior Full Stack Engineer"
                  className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 font-mono"
                />
              </AdminFormField>

              <AdminFormField
                label="Company Name"
                htmlFor="expCompany"
                required
                helperText="Max 120 characters"
                error={fieldErrors.company}
              >
                <input
                  id="expCompany"
                  type="text"
                  value={company}
                  onChange={(e) => {
                    setCompany(e.target.value);
                    if (fieldErrors.company) setFieldErrors((p) => ({ ...p, company: null }));
                  }}
                  maxLength={120}
                  placeholder="Tech Corp / Startup"
                  className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 font-mono"
                />
              </AdminFormField>

              <AdminFormField label="Location" htmlFor="expLocation">
                <input
                  id="expLocation"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Remote / Bangalore, India"
                  className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 font-mono"
                />
              </AdminFormField>

              <AdminFormField label="Employment Type" htmlFor="expType">
                <select
                  id="expType"
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 font-mono"
                >
                  {EMPLOYMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </AdminFormField>

              <AdminFormField
                label="Start Date"
                htmlFor="expStart"
                required
                error={fieldErrors.startDate}
              >
                <input
                  id="expStart"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (fieldErrors.startDate) setFieldErrors((p) => ({ ...p, startDate: null }));
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 font-mono"
                />
              </AdminFormField>

              <AdminFormField
                label="End Date"
                htmlFor="expEnd"
                helperText={isCurrent ? 'Disabled (currently employed)' : 'Completion date'}
                error={fieldErrors.endDate}
              >
                <input
                  id="expEnd"
                  type="date"
                  disabled={isCurrent}
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    if (fieldErrors.endDate) setFieldErrors((p) => ({ ...p, endDate: null }));
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 font-mono disabled:opacity-40"
                />
              </AdminFormField>
            </div>

            <AdminToggle
              id="isCurrentExp"
              checked={isCurrent}
              onChange={(checked) => {
                setIsCurrent(checked);
                if (checked) setEndDate('');
              }}
              label="Currently Working Here"
              description="Marks role as Present on the public timeline."
            />

            <AdminFormField
              label="Responsibilities & Achievements (One per line)"
              htmlFor="expDesc"
              helperText="Enter bullet points separated by new lines."
            >
              <textarea
                id="expDesc"
                rows={5}
                value={descriptionText}
                onChange={(e) => setDescriptionText(e.target.value)}
                placeholder="Architected RESTful microservices...&#10;Mentored junior engineers and conducted code reviews...&#10;Improved API response times by 35%..."
                className="w-full p-4 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 leading-relaxed font-mono"
              />
            </AdminFormField>

            <AdminFormField
              label="Technologies & Stack"
              helperText="Keywords for frameworks and tools utilized in this role"
            >
              <AdminTagInput
                tags={techStack}
                onChange={setTechStack}
                placeholder="Add tool/tech..."
                disabled={saving}
              />
            </AdminFormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <AdminFormField label="Company Website URL" htmlFor="companyUrl">
                <input
                  id="companyUrl"
                  type="url"
                  value={companyUrl}
                  onChange={(e) => setCompanyUrl(e.target.value)}
                  placeholder="https://company.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 font-mono"
                />
              </AdminFormField>

              <AdminFormField
                label="Display Order"
                htmlFor="expOrder"
                helperText="Lower numbers appear first"
              >
                <input
                  id="expOrder"
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 font-mono"
                />
              </AdminFormField>
            </div>
          </section>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-card) text-xs font-mono text-(--text-primary)"
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
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{viewMode === 'edit' ? 'Update Entry' : 'Save Entry'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Delete Confirmation Modal */}
      <AdminConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Experience Entry"
        message={`Are you sure you want to delete the experience entry for "${deleteTarget?.title} at ${deleteTarget?.company}"?`}
        confirmText="Delete Entry"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
