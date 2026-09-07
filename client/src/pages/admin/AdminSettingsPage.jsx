import { useState, useEffect } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useSettings } from '../../context/SettingsContext';
import { getAdminSettings, updateAdminSettings } from '../../services/adminService';
import AdminFormField from '../../components/admin/AdminFormField';
import AdminToggle from '../../components/admin/AdminToggle';
import AdminTagInput from '../../components/admin/AdminTagInput';
import AdminMediaUploader from '../../components/admin/AdminMediaUploader';
import {
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Settings,
  Share2,
  Sliders,
} from 'lucide-react';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function AdminSettingsPage() {
  useDocumentTitle('Site Settings & SEO | Admin Command');
  const { refetchSettings } = useSettings();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Form State
  const [siteTitle, setSiteTitle] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [author, setAuthor] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [enableContactForm, setEnableContactForm] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [ogImage, setOgImage] = useState(null); // { url, publicId }

  // Fetch current site settings
  useEffect(() => {
    let isMounted = true;

    const fetchSettings = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const data = await getAdminSettings();
        if (isMounted && data) {
          setSiteTitle(data.siteTitle || '');
          setSiteDescription(data.siteDescription || '');
          setKeywords(Array.isArray(data.keywords) ? data.keywords : []);
          setAuthor(data.author || '');
          setContactEmail(data.contactEmail || '');
          setEnableContactForm(data.enableContactForm ?? true);
          setMaintenanceMode(data.maintenanceMode ?? false);
          setOgImage(data.ogImage?.url ? data.ogImage : null);
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to load site settings.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const validate = () => {
    const errors = {};
    if (!siteTitle.trim()) {
      errors.siteTitle = 'Site title is required (max 150 characters).';
    } else if (siteTitle.trim().length > 150) {
      errors.siteTitle = 'Site title cannot exceed 150 characters.';
    }

    if (!siteDescription.trim()) {
      errors.siteDescription = 'Site description is required (max 300 characters).';
    } else if (siteDescription.trim().length > 300) {
      errors.siteDescription = 'Site description cannot exceed 300 characters.';
    }

    if (contactEmail.trim() && !EMAIL_REGEX.test(contactEmail.trim())) {
      errors.contactEmail = 'Please provide a valid contact email address.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        siteTitle: siteTitle.trim(),
        siteDescription: siteDescription.trim(),
        keywords,
        author: author.trim(),
        contactEmail: contactEmail.trim().toLowerCase(),
        enableContactForm,
        maintenanceMode,
        ogImage: ogImage
          ? { url: ogImage.url, publicId: ogImage.publicId || '' }
          : { url: '', publicId: '' },
      };

      const updated = await updateAdminSettings(payload);
      if (refetchSettings) {
        await refetchSettings();
      }
      setSuccessMessage('Site settings updated successfully! Changes saved.');

      if (updated?.ogImage) {
        setOgImage(updated.ogImage.url ? updated.ogImage : null);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save site settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-3">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        <p className="text-xs font-mono text-(--text-muted)">Loading site settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-(--border-color)">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-(--text-primary)">
            Site Settings &amp; SEO
          </h1>
          <p className="text-xs font-mono text-(--text-muted) mt-1">
            Global portfolio metadata, Open Graph preview image, and platform controls.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs font-mono bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md hover:shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Settings</span>
            </>
          )}
        </button>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-start gap-3 text-xs leading-relaxed"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
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

      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        {/* Section 1: Global SEO Metadata */}
        <section className="p-6 sm:p-8 rounded-3xl border border-(--border-color) bg-(--bg-card) backdrop-blur-md space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-(--border-color)/60 text-xs font-mono uppercase tracking-wider text-cyan-500 font-semibold">
            <Settings className="w-4 h-4" />
            <span>SEO &amp; Identity</span>
          </div>

          <AdminFormField
            label="Site Title"
            htmlFor="siteTitle"
            required
            helperText="Default HTML browser title and search engine title (max 150 chars)."
            error={fieldErrors.siteTitle}
          >
            <input
              id="siteTitle"
              type="text"
              value={siteTitle}
              onChange={(e) => {
                setSiteTitle(e.target.value);
                if (fieldErrors.siteTitle) setFieldErrors((prev) => ({ ...prev, siteTitle: null }));
              }}
              maxLength={150}
              placeholder="Sabari M | MERN Stack Developer"
              className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
            />
          </AdminFormField>

          <AdminFormField
            label="Site Meta Description"
            htmlFor="siteDescription"
            required
            helperText={`${siteDescription.length}/300 characters. Used by search engines and social link previews.`}
            error={fieldErrors.siteDescription}
          >
            <textarea
              id="siteDescription"
              rows={3}
              value={siteDescription}
              onChange={(e) => {
                setSiteDescription(e.target.value);
                if (fieldErrors.siteDescription) setFieldErrors((prev) => ({ ...prev, siteDescription: null }));
              }}
              maxLength={300}
              placeholder="Production-ready full-stack portfolio of Sabari M, a MERN Stack Developer..."
              className="w-full p-3.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all resize-y"
            />
          </AdminFormField>

          <AdminFormField
            label="Search Engine Keywords"
            helperText="Keywords used in meta tags."
          >
            <AdminTagInput
              tags={keywords}
              onChange={setKeywords}
              placeholder="Add keyword (e.g. MERN Stack, React)..."
              disabled={saving}
            />
          </AdminFormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <AdminFormField label="Site Author" htmlFor="author">
              <input
                id="author"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Sabari M"
                className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
              />
            </AdminFormField>

            <AdminFormField
              label="Contact Email"
              htmlFor="contactEmail"
              error={fieldErrors.contactEmail}
            >
              <input
                id="contactEmail"
                type="email"
                value={contactEmail}
                onChange={(e) => {
                  setContactEmail(e.target.value);
                  if (fieldErrors.contactEmail) setFieldErrors((prev) => ({ ...prev, contactEmail: null }));
                }}
                placeholder="contact@sabari.dev"
                className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
              />
            </AdminFormField>
          </div>
        </section>

        {/* Section 2: Open Graph Social Preview Media */}
        <section className="p-6 sm:p-8 rounded-3xl border border-(--border-color) bg-(--bg-card) backdrop-blur-md space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-(--border-color)/60 text-xs font-mono uppercase tracking-wider text-cyan-500 font-semibold">
            <Share2 className="w-4 h-4" />
            <span>Open Graph (Social Sharing Image)</span>
          </div>

          <AdminMediaUploader
            value={ogImage}
            onChange={setOgImage}
            folder="profile"
            accept="image/*"
            label="Open Graph Image"
            helperText="Recommended: 1200x630 (JPEG, PNG, WEBP up to 5 MB). Displayed when your site is shared on LinkedIn, Twitter, Slack, etc."
            disabled={saving}
          />
        </section>

        {/* Section 3: Platform & Form Controls */}
        <section className="p-6 sm:p-8 rounded-3xl border border-(--border-color) bg-(--bg-card) backdrop-blur-md space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-(--border-color)/60 text-xs font-mono uppercase tracking-wider text-cyan-500 font-semibold">
            <Sliders className="w-4 h-4" />
            <span>Platform Controls</span>
          </div>

          <div className="space-y-4">
            <AdminToggle
              id="enableContactForm"
              checked={enableContactForm}
              onChange={setEnableContactForm}
              label="Enable Visitor Contact Form"
              description="When active, visitors can submit inquiries. If disabled, the contact form shows an offline notice."
            />

            <AdminToggle
              id="maintenanceMode"
              checked={maintenanceMode}
              onChange={setMaintenanceMode}
              label="Maintenance Mode Flag"
              description="Platform maintenance flag stored in site settings."
            />
          </div>
        </section>

        {/* Bottom Save Action */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-xs font-mono bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md hover:shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Settings...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
