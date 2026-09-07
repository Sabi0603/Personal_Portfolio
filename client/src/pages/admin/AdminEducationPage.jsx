import { useState, useEffect } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import {
  getAdminEducations,
  createAdminEducation,
  updateAdminEducation,
  deleteAdminEducation,
} from '../../services/adminService';
import AdminFormField from '../../components/admin/AdminFormField';
import AdminToggle from '../../components/admin/AdminToggle';
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog';
import Pagination from '../../components/Pagination';
import {
  GraduationCap,
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

export default function AdminEducationPage() {
  useDocumentTitle('Education Management | Admin Command');

  const [educations, setEducations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Mode: 'list' | 'create' | 'edit'
  const [viewMode, setViewMode] = useState('list');
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [grade, setGrade] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState(0);

  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEducations = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminEducations();
      setEducations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load education entries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getAdminEducations()
      .then((data) => {
        if (isMounted) {
          setEducations(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load education entries.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setInstitution('');
    setDegree('');
    setFieldOfStudy('');
    setLocation('');
    setStartDate('');
    setEndDate('');
    setIsCurrent(false);
    setGrade('');
    setDescription('');
    setOrder(educations.length);
    setFieldErrors({});
    setError('');
    setSuccessMessage('');
    setViewMode('create');
  };

  const handleOpenEdit = (edu) => {
    setEditingId(edu._id);
    setInstitution(edu.institution || '');
    setDegree(edu.degree || '');
    setFieldOfStudy(edu.fieldOfStudy || '');
    setLocation(edu.location || '');
    setStartDate(edu.startDate ? new Date(edu.startDate).toISOString().slice(0, 10) : '');
    setEndDate(edu.endDate ? new Date(edu.endDate).toISOString().slice(0, 10) : '');
    setIsCurrent(Boolean(edu.isCurrent));
    setGrade(edu.grade || '');
    setDescription(edu.description || '');
    setOrder(edu.order || 0);
    setFieldErrors({});
    setError('');
    setSuccessMessage('');
    setViewMode('edit');
  };

  const validate = () => {
    const errors = {};
    if (!institution.trim()) errors.institution = 'Institution is required (max 150 characters).';
    else if (institution.trim().length > 150) errors.institution = 'Institution cannot exceed 150 characters.';

    if (!degree.trim()) errors.degree = 'Degree is required (max 120 characters).';
    else if (degree.trim().length > 120) errors.degree = 'Degree cannot exceed 120 characters.';

    if (!fieldOfStudy.trim()) errors.fieldOfStudy = 'Field of study is required (max 120 characters).';
    else if (fieldOfStudy.trim().length > 120) errors.fieldOfStudy = 'Field of study cannot exceed 120 characters.';

    if (!startDate) errors.startDate = 'Start date is required.';

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
      const payload = {
        institution: institution.trim(),
        degree: degree.trim(),
        fieldOfStudy: fieldOfStudy.trim(),
        location: location.trim(),
        startDate: new Date(startDate),
        endDate: isCurrent ? null : (endDate ? new Date(endDate) : null),
        isCurrent,
        grade: grade.trim(),
        description: description.trim(),
        order: Number(order) || 0,
      };

      if (editingId) {
        // EDIT: PUT /api/admin/education/:id
        await updateAdminEducation(editingId, payload);
        setSuccessMessage(`Education entry for "${payload.degree}" updated successfully.`);
      } else {
        // CREATE: POST /api/admin/education
        await createAdminEducation(payload);
        setSuccessMessage(`Education entry for "${payload.degree}" created successfully.`);
      }

      await fetchEducations();
      setViewMode('list');
      setEditingId(null);
    } catch (err) {
      setError(err.message || 'Failed to save education entry.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError('');
    try {
      await deleteAdminEducation(deleteTarget._id);
      setSuccessMessage(`Education entry for "${deleteTarget.institution}" deleted.`);
      setDeleteTarget(null);
      await fetchEducations();
    } catch (err) {
      setError(err.message || 'Failed to delete education entry.');
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
                Education &amp; Qualifications
              </h1>
              <p className="text-xs font-mono text-(--text-muted)">
                Academic degrees, university coursework, and technical training.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs font-mono bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md hover:shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Education</span>
            </button>
          </div>

          {loading ? (
            <div className="p-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mx-auto" />
              <p className="text-xs font-mono text-(--text-muted)">Loading education records...</p>
            </div>
          ) : educations.length === 0 ? (
            <div className="p-16 text-center rounded-2xl border border-dashed border-(--border-color) bg-(--bg-card)/40 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 flex items-center justify-center mx-auto">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-(--text-primary)">No Education Recorded</h3>
              <p className="text-xs font-mono text-(--text-muted) max-w-sm mx-auto">
                Add your degree, university, or academic program.
              </p>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-mono font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Degree</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                {educations
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map((edu) => (
                    <div
                      key={edu._id}
                      className="p-5 rounded-2xl border border-(--border-color) bg-(--bg-card) flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-cyan-500/30 transition-all shadow-sm"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-sm text-(--text-primary)">
                            {edu.degree}
                          </h3>
                          {edu.fieldOfStudy && (
                            <span className="text-xs text-(--text-secondary)">
                              in {edu.fieldOfStudy}
                            </span>
                          )}
                          <span className="text-xs font-mono text-cyan-500">
                            @ {edu.institution}
                          </span>
                          {edu.grade && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-(--border-color) text-(--text-secondary)">
                              {edu.grade}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-(--text-muted)">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(edu.startDate).toLocaleDateString('en-US', {
                                month: 'short',
                                year: 'numeric',
                              })}{' '}
                              —{' '}
                              {edu.isCurrent
                                ? 'Present'
                                : edu.endDate
                                ? new Date(edu.endDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : 'N/A'}
                            </span>
                          </div>

                          {edu.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{edu.location}</span>
                            </div>
                          )}

                          <span>Order: {edu.order ?? 0}</span>
                        </div>

                        {edu.description && (
                          <p className="text-xs text-(--text-secondary) pt-1 line-clamp-2">
                            {edu.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(edu)}
                          className="p-2 rounded-lg text-slate-400 hover:text-cyan-500 hover:bg-cyan-500/10 transition-colors"
                          aria-label={`Edit ${edu.degree}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(edu)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                          aria-label={`Delete ${edu.degree}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
              {educations.length > pageSize && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(educations.length / pageSize) || 1}
                  totalItems={educations.length}
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
                aria-label="Back to education list"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-(--text-primary)">
                  {viewMode === 'edit' ? 'Edit Education Entry' : 'Add Education Entry'}
                </h1>
                <p className="text-xs font-mono text-(--text-muted)">
                  {viewMode === 'edit' ? `Updating ID: ${editingId}` : 'Create a new qualification record'}
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
                    <span>{viewMode === 'edit' ? 'Update Education' : 'Save Education'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <section className="p-6 sm:p-8 rounded-3xl border border-(--border-color) bg-(--bg-card) space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <AdminFormField
                label="Institution / University"
                htmlFor="eduInst"
                required
                helperText="Max 150 characters"
                error={fieldErrors.institution}
              >
                <input
                  id="eduInst"
                  type="text"
                  value={institution}
                  onChange={(e) => {
                    setInstitution(e.target.value);
                    if (fieldErrors.institution) setFieldErrors((p) => ({ ...p, institution: null }));
                  }}
                  maxLength={150}
                  placeholder="e.g. University of Technology"
                  className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 font-mono"
                />
              </AdminFormField>

              <AdminFormField
                label="Degree / Diploma"
                htmlFor="eduDegree"
                required
                helperText="Max 120 characters"
                error={fieldErrors.degree}
              >
                <input
                  id="eduDegree"
                  type="text"
                  value={degree}
                  onChange={(e) => {
                    setDegree(e.target.value);
                    if (fieldErrors.degree) setFieldErrors((p) => ({ ...p, degree: null }));
                  }}
                  maxLength={120}
                  placeholder="Bachelor of Engineering (B.E.)"
                  className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 font-mono"
                />
              </AdminFormField>

              <AdminFormField
                label="Field of Study / Major"
                htmlFor="eduField"
                required
                helperText="Max 120 characters"
                error={fieldErrors.fieldOfStudy}
              >
                <input
                  id="eduField"
                  type="text"
                  value={fieldOfStudy}
                  onChange={(e) => {
                    setFieldOfStudy(e.target.value);
                    if (fieldErrors.fieldOfStudy) setFieldErrors((p) => ({ ...p, fieldOfStudy: null }));
                  }}
                  maxLength={120}
                  placeholder="Computer Science & Engineering"
                  className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 font-mono"
                />
              </AdminFormField>

              <AdminFormField label="Location" htmlFor="eduLocation">
                <input
                  id="eduLocation"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Tamil Nadu, India"
                  className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 font-mono"
                />
              </AdminFormField>

              <AdminFormField
                label="Start Date"
                htmlFor="eduStart"
                required
                error={fieldErrors.startDate}
              >
                <input
                  id="eduStart"
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
                htmlFor="eduEnd"
                helperText={isCurrent ? 'Disabled (currently enrolled)' : 'Graduation date'}
              >
                <input
                  id="eduEnd"
                  type="date"
                  disabled={isCurrent}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 font-mono disabled:opacity-40"
                />
              </AdminFormField>
            </div>

            <AdminToggle
              id="isCurrentEdu"
              checked={isCurrent}
              onChange={(checked) => {
                setIsCurrent(checked);
                if (checked) setEndDate('');
              }}
              label="Currently Enrolled"
              description="Marks program as in-progress on public profile."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <AdminFormField label="Grade / GPA / Percentage" htmlFor="eduGrade">
                <input
                  id="eduGrade"
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="First Class with Distinction / 8.5 CGPA"
                  className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 font-mono"
                />
              </AdminFormField>

              <AdminFormField
                label="Display Order"
                htmlFor="eduOrder"
                helperText="Lower numbers appear first"
              >
                <input
                  id="eduOrder"
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 font-mono"
                />
              </AdminFormField>
            </div>

            <AdminFormField
              label="Academic Description / Coursework Highlights"
              htmlFor="eduDesc"
            >
              <textarea
                id="eduDesc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Relevant coursework: Data Structures, Database Systems, Web Technologies..."
                className="w-full p-4 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 leading-relaxed font-mono"
              />
            </AdminFormField>
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
                  <span>{viewMode === 'edit' ? 'Update Education' : 'Save Education'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Delete Confirmation Modal */}
      <AdminConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Education Entry"
        message={`Are you sure you want to delete "${deleteTarget?.degree} at ${deleteTarget?.institution}"?`}
        confirmText="Delete Education"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
