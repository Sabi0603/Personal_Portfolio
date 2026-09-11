import { useState, useEffect } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import {
  getAdminResumes,
  createAdminResume,
  updateAdminResume,
  setActiveAdminResume,
  deleteAdminResume,
} from '../../services/adminService';
import AdminFormField from '../../components/admin/AdminFormField';
import AdminMediaUploader from '../../components/admin/AdminMediaUploader';
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog';
import { downloadFileFromUrl } from '../../utils/downloadHelper';
import { getResumeViewUrl, getResumeDownloadUrl } from '../../services/portfolioService';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Download,
  Trash2,
  Check,
  XCircle,
  Loader2,
  Calendar,
  HardDrive,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function AdminResumePage() {
  useDocumentTitle('Resume Management | Admin Command');

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Upload Form State
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [title, setTitle] = useState('');
  const [uploadedMedia, setUploadedMedia] = useState(null); // { url, publicId, fileName, bytes }
  const [setAsActive, setSetAsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Action Loading
  const [activatingId, setActivatingId] = useState(null);

  const fetchResumes = async () => {
    setError('');
    try {
      const data = await getAdminResumes();
      setResumes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load resumes from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getAdminResumes()
      .then((data) => {
        if (isMounted) {
          setResumes(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load resumes from server.');
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const activeResume = resumes.find((r) => r.isActive);

  const handleCreateResume = async (e) => {
    e.preventDefault();
    if (!uploadedMedia || !uploadedMedia.url) {
      setError('Please upload a PDF document before saving.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const payload = {
        title: title.trim() || uploadedMedia.fileName || 'Sabari M - Resume',
        fileName: uploadedMedia.fileName || 'Sabari-M-Resume.pdf',
        url: uploadedMedia.url,
        publicId: uploadedMedia.publicId || '',
        format: 'pdf',
        bytes: uploadedMedia.bytes || 0,
        isActive: setAsActive,
      };

      await createAdminResume(payload);
      setSuccessMessage('Resume registered and saved successfully.');
      setUploadedMedia(null);
      setTitle('');
      setShowUploadForm(false);
      await fetchResumes();
    } catch (err) {
      setError(err.message || 'Failed to register resume document.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (resume) => {
    setActivatingId(resume._id);
    setError('');
    setSuccessMessage('');
    try {
      if (resume.isActive) {
        // Disable active resume
        await updateAdminResume(resume._id, { isActive: false });
        setSuccessMessage(`Resume "${resume.title}" has been deactivated.`);
      } else {
        // Activate this resume
        await setActiveAdminResume(resume._id);
        setSuccessMessage(`Resume "${resume.title}" is now active and published to the portfolio.`);
      }
      await fetchResumes();
    } catch (err) {
      setError(err.message || 'Failed to update resume active status.');
    } finally {
      setActivatingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError('');
    setSuccessMessage('');
    try {
      await deleteAdminResume(deleteTarget._id);
      setSuccessMessage(`Resume "${deleteTarget.title}" and its storage asset were deleted.`);
      setDeleteTarget(null);
      await fetchResumes();
    } catch (err) {
      setError(err.message || 'Failed to delete resume.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = async (resume) => {
    try {
      await downloadFileFromUrl(resume.url, resume.fileName || 'Sabari-M-Resume.pdf');
    } catch {
      window.location.href = getResumeDownloadUrl(resume._id);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-cyan-400" />
            Resume Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Upload, activate, view, and version your official curriculum vitae / resume PDF documents.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowUploadForm((prev) => !prev);
            setUploadedMedia(null);
            setTitle('');
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>{showUploadForm ? 'Close Upload Form' : 'Upload New Resume'}</span>
        </button>
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

      {/* Section 1: Active Resume Hero Showcase */}
      <div className="rounded-2xl border border-(--border-color) bg-(--bg-card) backdrop-blur-md p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-(--border-color)/60 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-(--text-primary)">
                Current Public Resume
              </h2>
              <p className="text-xs font-mono text-(--text-muted) mt-0.5">
                The active document served to visitors and recruiters on your public portfolio.
              </p>
            </div>
          </div>

          {activeResume ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              LIVE & ACTIVE
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 self-start sm:self-auto">
              NO ACTIVE RESUME
            </span>
          )}
        </div>

        {activeResume ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-(--border-color)/60 bg-(--bg-primary)/60 space-y-1">
                <span className="text-[11px] font-mono text-(--text-muted) uppercase">Document Title</span>
                <p className="text-sm font-semibold text-(--text-primary) truncate">
                  {activeResume.title}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-(--border-color)/60 bg-(--bg-primary)/60 space-y-1">
                <span className="text-[11px] font-mono text-(--text-muted) uppercase">File Name</span>
                <p className="text-sm font-mono text-cyan-400 truncate">
                  {activeResume.fileName}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-(--border-color)/60 bg-(--bg-primary)/60 space-y-1">
                <span className="text-[11px] font-mono text-(--text-muted) uppercase">File Size & Upload Date</span>
                <p className="text-sm font-mono text-(--text-primary) truncate">
                  {formatBytes(activeResume.bytes)} &bull; {formatDate(activeResume.createdAt)}
                </p>
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={getResumeViewUrl(activeResume._id)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-semibold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 transition-all cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Document in New Tab</span>
              </a>

              <button
                type="button"
                onClick={() => handleDownload(activeResume)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowUploadForm(true);
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-all cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Replace / Upload New</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleActive(activeResume)}
                disabled={activatingId === activeResume._id}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {activatingId === activeResume._id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                <span>Deactivate / Disable</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 px-4 bg-slate-950/40 rounded-xl border border-dashed border-slate-800 space-y-3">
            <FileText className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-300">No active resume is set</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Upload a new PDF resume document below or choose an existing version from the table to activate it on the public site.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Upload / Replace Form */}
      {showUploadForm && (
        <form
          onSubmit={handleCreateResume}
          className="rounded-2xl border border-cyan-500/30 bg-(--bg-card) backdrop-blur-md p-6 sm:p-8 space-y-6 animate-slide-in-top shadow-xl"
        >
          <div className="flex items-center justify-between pb-4 border-b border-(--border-color)">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-(--text-primary)">
                Upload New Resume Document
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowUploadForm(false)}
              className="text-xs font-mono text-(--text-muted) hover:text-(--text-primary) transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-4">
            <AdminFormField
              label="Resume Label / Title"
              htmlFor="resumeTitle"
              helperText="Internal title or display label for this version"
            >
              <input
                id="resumeTitle"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sabari M - Full Stack Developer CV (2026)"
                className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm font-mono text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </AdminFormField>

            <div className="space-y-2">
              <label className="block text-xs font-mono font-medium text-(--text-secondary)">
                Resume PDF Document
              </label>
              <AdminMediaUploader
                folder="resume"
                accept="application/pdf"
                value={uploadedMedia}
                onChange={(val) => setUploadedMedia(val)}
                label=""
                helperText="Only PDF documents are allowed (up to 10 MB)"
                staged={false}
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer select-none pt-2">
              <input
                type="checkbox"
                checked={setAsActive}
                onChange={(e) => setSetAsActive(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500/20 bg-slate-900 cursor-pointer"
              />
              <span className="text-xs font-mono text-(--text-primary)">
                Make this the active/live resume immediately (deactivates previous resumes)
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-(--border-color)">
            <button
              type="button"
              onClick={() => setShowUploadForm(false)}
              disabled={submitting}
              className="px-4 py-2 text-xs font-mono font-medium text-(--text-secondary) hover:text-(--text-primary) bg-(--bg-primary) border border-(--border-color) rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !uploadedMedia?.url}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-mono font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl shadow-md hover:shadow-cyan-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Resume Version</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Section 3: Resume Versions & Management List */}
      <div className="rounded-2xl border border-(--border-color) bg-(--bg-card) backdrop-blur-md p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-(--border-color)/60 pb-5">
          <div>
            <h2 className="text-lg font-bold text-(--text-primary) flex items-center gap-2">
              <span>All Resumes</span>
              <span className="text-xs font-mono font-normal text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                {resumes.length}
              </span>
            </h2>
            <p className="text-xs font-mono text-(--text-muted) mt-0.5">
              History of all uploaded resumes. Only one can be active at a time.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
              <span className="text-xs font-mono">Loading resumes...</span>
            </div>
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-12 px-4 bg-slate-950/30 rounded-xl border border-dashed border-slate-800">
            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No resumes uploaded yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Click &quot;Upload New Resume&quot; above to add your official PDF resume.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {resumes.map((resume) => (
              <div
                key={resume._id}
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  resume.isActive
                    ? 'bg-cyan-500/5 border-cyan-500/30 shadow-sm'
                    : 'bg-slate-900/40 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      resume.isActive
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-sm font-semibold text-slate-100 truncate">
                        {resume.title}
                      </h3>
                      {resume.isActive && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
                      <span className="truncate text-slate-300">{resume.fileName}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <HardDrive className="w-3 h-3" />
                        {formatBytes(resume.bytes)}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Calendar className="w-3 h-3" />
                        {formatDate(resume.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  {!resume.isActive ? (
                    <button
                      type="button"
                      disabled={activatingId === resume._id}
                      onClick={() => handleToggleActive(resume)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {activatingId === resume._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>Set Active</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={activatingId === resume._id}
                      onClick={() => handleToggleActive(resume)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {activatingId === resume._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      <span>Disable</span>
                    </button>
                  )}

                  <a
                    href={getResumeViewUrl(resume._id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-lg transition-colors cursor-pointer"
                    title="View Document in New Tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleDownload(resume)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                    title="Download PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(resume)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-colors cursor-pointer"
                    title="Delete Resume"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AdminConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Resume"
        message={`Are you sure you want to delete the resume "${deleteTarget?.title || deleteTarget?.fileName}"? This will permanently delete the record and its storage asset from Cloudinary.`}
        confirmLabel={deleting ? 'Deleting...' : 'Delete Resume'}
        isDestructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
