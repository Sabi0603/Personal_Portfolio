import { useState, useEffect, useRef } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import {
  getAdminCertifications,
  createAdminCertification,
  updateAdminCertification,
  deleteAdminCertification,
  uploadMedia,
} from '../../services/adminService';
import AdminFormField from '../../components/admin/AdminFormField';
import AdminToggle from '../../components/admin/AdminToggle';
import AdminMediaUploader from '../../components/admin/AdminMediaUploader';
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog';
import Pagination from '../../components/Pagination';
import {
  getCertificationViewUrl,
  getCertificationPreviewUrl,
  getCertificationDownloadUrl,
  isPdfCertificate,
} from '../../services/portfolioService';
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  Save,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Search,
  Download,
} from 'lucide-react';

export default function AdminCertificationsPage() {
  useDocumentTitle('Certifications Management | Admin Command');

  const [certifications, setCertifications] = useState([]);
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
  const [issuer, setIssuer] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [doesNotExpire, setDoesNotExpire] = useState(true);
  const [credentialId, setCredentialId] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');
  const [image, setImage] = useState({ url: '', publicId: '' });
  const [order, setOrder] = useState(0);

  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCertifications = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminCertifications();
      setCertifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load certifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getAdminCertifications()
      .then((data) => {
        if (isMounted) {
          setCertifications(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load certifications.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const formatDateForInput = (dateVal) => {
    if (!dateVal) return '';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Helper to revoke temporary object URLs for staged image
  const cleanupStagedMedia = (img) => {
    if (img?.isStaged && img?.previewUrl) {
      try {
        URL.revokeObjectURL(img.previewUrl);
      } catch {
        // ignore
      }
    }
  };

  const imageRef = useRef(image);
  useEffect(() => {
    imageRef.current = image;
  });

  useEffect(() => {
    return () => {
      cleanupStagedMedia(imageRef.current);
    };
  }, []);

  const handleOpenCreate = () => {
    cleanupStagedMedia(image);
    setEditingId(null);
    setTitle('');
    setIssuer('');
    setIssueDate('');
    setExpiryDate('');
    setDoesNotExpire(true);
    setCredentialId('');
    setCredentialUrl('');
    setImage({ url: '', publicId: '', fileType: 'image', fileName: '' });
    setOrder(certifications.length);
    setFieldErrors({});
    setError('');
    setSuccessMessage('');
    setViewMode('create');
  };

  const handleOpenEdit = (cert) => {
    cleanupStagedMedia(image);
    // CRITICAL: Bind the existing _id explicitly
    setEditingId(cert._id);
    setTitle(cert.title || '');
    setIssuer(cert.issuer || '');
    setIssueDate(formatDateForInput(cert.issueDate));
    setExpiryDate(formatDateForInput(cert.expiryDate));
    setDoesNotExpire(cert.doesNotExpire ?? (cert.expiryDate ? false : true));
    setCredentialId(cert.credentialId || '');
    setCredentialUrl(cert.credentialUrl || '');
    const isCertPdf =
      cert.image?.fileType === 'pdf' ||
      cert.image?.url?.toLowerCase().endsWith('.pdf') ||
      cert.image?.url?.toLowerCase().includes('.pdf?');
    setImage({
      url: cert.image?.url || '',
      publicId: cert.image?.publicId || '',
      fileType: isCertPdf ? 'pdf' : 'image',
      fileName: cert.image?.fileName || '',
      previewUrl: cert.image?.previewUrl || (isCertPdf ? getCertificationPreviewUrl(cert._id) : ''),
      viewUrl: isCertPdf ? getCertificationViewUrl(cert._id) : cert.image?.url,
    });
    setOrder(cert.order ?? 0);
    setFieldErrors({});
    setError('');
    setSuccessMessage('');
    setViewMode('edit');
  };

  const handleCancelForm = () => {
    cleanupStagedMedia(image);
    setViewMode('list');
    setEditingId(null);
  };

  const validateForm = () => {
    const errors = {};
    if (!title.trim()) errors.title = 'Title is required';
    if (!issuer.trim()) errors.issuer = 'Issuer is required';
    if (!issueDate) errors.issueDate = 'Issue date is required';
    if (!doesNotExpire && !expiryDate) errors.expiryDate = 'Expiry date is required if credential expires';
    if (credentialUrl.trim() && !credentialUrl.trim().startsWith('http')) {
      errors.credentialUrl = 'Credential URL must start with http:// or https://';
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

    try {
      // 1. Upload staged certificate media if any (deferred Cloudinary upload)
      let finalImage = { url: '', publicId: '', fileType: 'image', fileName: '', previewUrl: '' };
      if (image?.isStaged && image?.file) {
        const uploadRes = await uploadMedia(image.file, 'certifications');
        const mediaData = uploadRes?.data?.url ? uploadRes.data : uploadRes;
        if (!mediaData?.url) {
          throw new Error('Certificate media upload failed to return a valid URL.');
        }
        const isUploadedPdf =
          mediaData.fileType === 'pdf' ||
          mediaData.format === 'pdf' ||
          image.file.type === 'application/pdf' ||
          image.file.name.toLowerCase().endsWith('.pdf');
        finalImage = {
          url: mediaData.url,
          publicId: mediaData.publicId || '',
          fileType: isUploadedPdf ? 'pdf' : 'image',
          fileName: mediaData.fileName || image.file.name || '',
          previewUrl: mediaData.previewUrl || '',
        };
      } else if (image?.url && !image?.isStaged) {
        const isCertPdf =
          image.fileType === 'pdf' ||
          image.url.toLowerCase().endsWith('.pdf') ||
          image.url.toLowerCase().includes('.pdf?');
        finalImage = {
          url: image.url,
          publicId: image.publicId || '',
          fileType: isCertPdf ? 'pdf' : 'image',
          fileName: image.fileName || '',
          previewUrl: image.previewUrl || '',
        };
      }

      const payload = {
        title: title.trim(),
        issuer: issuer.trim(),
        issueDate,
        doesNotExpire,
        expiryDate: doesNotExpire ? null : expiryDate || null,
        credentialId: credentialId.trim(),
        credentialUrl: credentialUrl.trim(),
        image: finalImage,
        order: Number(order) || 0,
      };

      if (viewMode === 'edit') {
        // STRICT EDIT: Use PUT with editingId
        if (!editingId) {
          throw new Error('Missing record ID for edit operation');
        }
        await updateAdminCertification(editingId, payload);
        setSuccessMessage(`Certification "${title}" updated successfully.`);
      } else {
        // STRICT CREATE: Use POST
        await createAdminCertification(payload);
        setSuccessMessage(`Certification "${title}" created successfully.`);
      }

      cleanupStagedMedia(image);
      await fetchCertifications();
      setViewMode('list');
      setEditingId(null);
    } catch (err) {
      setError(err.message || 'Failed to save certification.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (cert) => {
    setDeleteTarget(cert);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAdminCertification(deleteTarget._id);
      setSuccessMessage(`Certification "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
      await fetchCertifications();
    } catch (err) {
      setError(err.message || 'Failed to delete certification.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredCerts = certifications.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.title?.toLowerCase().includes(q) ||
      c.issuer?.toLowerCase().includes(q) ||
      c.credentialId?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredCerts.length / pageSize) || 1;
  const paginatedCerts = filteredCerts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Award className="w-6 h-6 text-emerald-400" />
            Certifications Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage professional certificates, credentials, issuing bodies, and verification badges.
          </p>
        </div>

        {viewMode === 'list' ? (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-lg shadow-emerald-500/20 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add Certification
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
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-xl border border-white/5">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by certification title, issuer, credential ID..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div className="text-xs text-slate-400 font-mono px-2 py-1 bg-slate-950/60 rounded border border-slate-800 self-end sm:self-auto">
              Total: {certifications.length}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 bg-slate-900/40 rounded-xl border border-white/5">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                <span className="text-sm">Loading certifications...</span>
              </div>
            </div>
          ) : filteredCerts.length === 0 ? (
            <div className="text-center py-16 px-4 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
              <Award className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-300">No certifications found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? 'No certifications match your filter criteria.'
                  : 'Start adding your professional certifications, credentials, and licenses.'}
              </p>
              {!searchQuery && (
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add First Certification
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedCerts.map((cert) => {
                const issueYear = cert.issueDate
                  ? new Date(cert.issueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })
                  : '';
                const expiryYear = cert.expiryDate
                  ? new Date(cert.expiryDate).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })
                  : '';

                const isPdfCert = isPdfCertificate(cert);

                return (
                  <div
                    key={cert._id}
                    className="p-5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-start gap-3">
                          {cert.image?.url ? (
                            isPdfCert ? (
                              <img
                                src={cert.image?.previewUrl || getCertificationPreviewUrl(cert._id)}
                                alt={cert.title}
                                className="w-12 h-12 rounded-lg object-contain bg-slate-950 p-1 border border-slate-800 shrink-0"
                                onError={(e) => {
                                  if (e.target.src !== getCertificationPreviewUrl(cert._id)) {
                                    e.target.src = getCertificationPreviewUrl(cert._id);
                                  }
                                }}
                              />
                            ) : (
                              <img
                                src={cert.image.url}
                                alt={cert.title}
                                className="w-12 h-12 rounded-lg object-contain bg-slate-950 p-1 border border-slate-800 shrink-0"
                              />
                            )
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                              <Award className="w-6 h-6" />
                            </div>
                          )}

                          <div>
                            <h3 className="font-semibold text-slate-100 text-base leading-snug group-hover:text-emerald-400 transition-colors">
                              {cert.title}
                            </h3>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">
                              {cert.issuer}
                            </p>
                          </div>
                        </div>

                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
                          #{cert.order ?? 0}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-400 pl-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>
                            Issued {issueYear || 'N/A'} &bull;{' '}
                            {cert.doesNotExpire ? (
                              <span className="text-emerald-400/90 font-medium">No Expiration</span>
                            ) : (
                              <span>Expires {expiryYear || 'N/A'}</span>
                            )}
                          </span>
                        </div>

                        {cert.credentialId && (
                          <div className="text-[11px] font-mono text-slate-500 truncate">
                            ID: <span className="text-slate-300">{cert.credentialId}</span>
                          </div>
                        )}

                        <div className="pt-1 flex flex-wrap items-center gap-3">
                          {cert.credentialUrl && (
                            <a
                              href={cert.credentialUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
                            >
                              Verify Credential
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}

                          {cert.image?.url && (
                            isPdfCert ? (
                              <div className="flex items-center gap-2">
                                <a
                                  href={getCertificationViewUrl(cert._id)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
                                >
                                  View PDF
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                                <span className="text-slate-600">&bull;</span>
                                <a
                                  href={getCertificationDownloadUrl(cert._id)}
                                  className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 underline underline-offset-2"
                                  title="Download PDF"
                                >
                                  Download
                                  <Download className="w-3 h-3" />
                                </a>
                              </div>
                            ) : (
                              <a
                                href={cert.image.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
                              >
                                View Image
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(cert)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(cert)}
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

              {filteredCerts.length > pageSize && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredCerts.length}
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
                {viewMode === 'edit' ? 'Edit Certification' : 'Add New Certification'}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AdminFormField
              label="Certification Title"
              htmlFor="certTitle"
              required
              error={fieldErrors.title}
            >
              <input
                id="certTitle"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (fieldErrors.title) setFieldErrors((p) => ({ ...p, title: null }));
                }}
                placeholder="e.g. AWS Certified Developer - Associate"
                className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm font-mono text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                required
              />
            </AdminFormField>

            <AdminFormField
              label="Issuing Organization"
              htmlFor="certIssuer"
              required
              error={fieldErrors.issuer}
            >
              <input
                id="certIssuer"
                type="text"
                value={issuer}
                onChange={(e) => {
                  setIssuer(e.target.value);
                  if (fieldErrors.issuer) setFieldErrors((p) => ({ ...p, issuer: null }));
                }}
                placeholder="e.g. Amazon Web Services, Meta, Coursera"
                className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm font-mono text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                required
              />
            </AdminFormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <AdminFormField
              label="Issue Date"
              htmlFor="certIssueDate"
              required
              error={fieldErrors.issueDate}
            >
              <input
                id="certIssueDate"
                type="date"
                value={issueDate}
                onChange={(e) => {
                  setIssueDate(e.target.value);
                  if (fieldErrors.issueDate) setFieldErrors((p) => ({ ...p, issueDate: null }));
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm font-mono text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                required
              />
            </AdminFormField>

            <div className="flex flex-col justify-center">
              <label className="text-xs font-mono font-medium text-(--text-secondary) mb-2">
                Credential Validity
              </label>
              <AdminToggle
                label="This credential does not expire"
                checked={doesNotExpire}
                onChange={(checked) => setDoesNotExpire(checked)}
              />
            </div>

            {!doesNotExpire && (
              <AdminFormField
                label="Expiry Date"
                htmlFor="certExpiryDate"
                required={!doesNotExpire}
                error={fieldErrors.expiryDate}
              >
                <input
                  id="certExpiryDate"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => {
                    setExpiryDate(e.target.value);
                    if (fieldErrors.expiryDate) setFieldErrors((p) => ({ ...p, expiryDate: null }));
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm font-mono text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                  required={!doesNotExpire}
                />
              </AdminFormField>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AdminFormField
              label="Credential ID"
              htmlFor="certCredId"
              helperText="License or verification ID"
            >
              <input
                id="certCredId"
                type="text"
                value={credentialId}
                onChange={(e) => setCredentialId(e.target.value)}
                placeholder="e.g. ABC-123456789"
                className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm font-mono text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
              />
            </AdminFormField>

            <AdminFormField
              label="Credential URL"
              htmlFor="certCredUrl"
              error={fieldErrors.credentialUrl}
              helperText="Public link to verify badge or certificate"
            >
              <input
                id="certCredUrl"
                type="url"
                value={credentialUrl}
                onChange={(e) => {
                  setCredentialUrl(e.target.value);
                  if (fieldErrors.credentialUrl) setFieldErrors((p) => ({ ...p, credentialUrl: null }));
                }}
                placeholder="https://www.credly.com/badges/..."
                className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm font-mono text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
              />
            </AdminFormField>
          </div>

          {/* Certificate Document / Image Upload */}
          <div className="space-y-2 border-t border-(--border-color) pt-5">
            <label className="text-xs font-mono font-medium text-(--text-secondary) uppercase tracking-wider">
              Certificate Document / Image
            </label>
            <p className="text-xs font-mono text-(--text-muted)">
              Upload the certificate image (JPEG, PNG, WEBP) or official PDF document. Staged file uploads only on Save.
            </p>
            <AdminMediaUploader
              folder="certifications"
              accept="image/*,application/pdf"
              value={image}
              onChange={(val) => setImage(val)}
              label="Certificate Document (Image or PDF)"
              helperText="Select image (up to 5 MB) or PDF document (up to 10 MB)"
              disabled={saving}
              staged={true}
            />
          </div>

          <div className="w-36 border-t border-(--border-color) pt-4">
            <AdminFormField
              label="Display Order"
              htmlFor="certOrder"
              helperText="Lower number shows first"
            >
              <input
                id="certOrder"
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
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{viewMode === 'edit' ? 'Update Certification' : 'Create Certification'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Delete Confirmation Modal */}
      <AdminConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Certification"
        message={`Are you sure you want to delete the certification "${deleteTarget?.title}" from ${deleteTarget?.issuer}? This action cannot be undone.`}
        confirmLabel={deleting ? 'Deleting...' : 'Delete Certification'}
        isDestructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
