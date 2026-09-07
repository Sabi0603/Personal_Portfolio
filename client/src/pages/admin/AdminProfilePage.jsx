import { useState, useEffect } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getAdminProfile, updateAdminProfile } from '../../services/adminService';
import AdminFormField from '../../components/admin/AdminFormField';
import AdminToggle from '../../components/admin/AdminToggle';
import AdminMediaUploader from '../../components/admin/AdminMediaUploader';
import {
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
  Briefcase,
  Sparkles,
} from 'lucide-react';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function AdminProfilePage() {
  useDocumentTitle('Profile Management | Admin Command');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Form State
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [shortBio, setShortBio] = useState('');
  const [about, setAbout] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [availableForHire, setAvailableForHire] = useState(true);
  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [avatar, setAvatar] = useState(null); // { url, publicId }
  const [resume, setResume] = useState(null); // { url, publicId, fileName }

  // Load existing profile data
  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const profile = await getAdminProfile();
        if (isMounted && profile) {
          setFullName(profile.fullName || '');
          setTitle(profile.title || '');
          setShortBio(profile.shortBio || '');
          setAbout(profile.about || '');
          setEmail(profile.email || '');
          setPhone(profile.phone || '');
          setLocation(profile.location || '');
          setAvailableForHire(profile.availableForHire ?? true);
          setYearsOfExperience(profile.yearsOfExperience || 0);
          setAvatar(profile.avatar?.url ? profile.avatar : null);
          setResume(profile.resume?.url ? profile.resume : null);
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to fetch profile data.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  // Validation
  const validate = () => {
    const errors = {};
    if (!fullName.trim()) errors.fullName = 'Full name is required (max 100 characters).';
    else if (fullName.trim().length > 100) errors.fullName = 'Full name cannot exceed 100 characters.';

    if (!title.trim()) errors.title = 'Professional title is required (max 150 characters).';
    else if (title.trim().length > 150) errors.title = 'Title cannot exceed 150 characters.';

    if (!shortBio.trim()) errors.shortBio = 'Short bio is required (max 300 characters).';
    else if (shortBio.trim().length > 300) errors.shortBio = 'Short bio cannot exceed 300 characters.';

    if (!about.trim()) errors.about = 'Detailed about section is required.';

    if (!email.trim()) {
      errors.email = 'Contact email is required.';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }

    if (yearsOfExperience < 0) {
      errors.yearsOfExperience = 'Years of experience cannot be negative.';
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
        fullName: fullName.trim(),
        title: title.trim(),
        shortBio: shortBio.trim(),
        about: about.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        location: location.trim(),
        availableForHire,
        yearsOfExperience: Number(yearsOfExperience) || 0,
        avatar: avatar ? { url: avatar.url, publicId: avatar.publicId || '' } : { url: '', publicId: '' },
        resume: resume
          ? { url: resume.url, publicId: resume.publicId || '', fileName: resume.fileName || '' }
          : { url: '', publicId: '', fileName: '' },
      };

      const updated = await updateAdminProfile(payload);
      setSuccessMessage('Profile saved successfully! Database record updated.');

      if (updated) {
        setAvatar(updated.avatar?.url ? updated.avatar : null);
        setResume(updated.resume?.url ? updated.resume : null);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-3">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        <p className="text-xs font-mono text-(--text-muted)">Loading profile configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-(--border-color)">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-(--text-primary)">
            Profile Management
          </h1>
          <p className="text-xs font-mono text-(--text-muted) mt-1">
            Configure primary developer identity, biography, availability, and media assets.
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
              <span>Save Changes</span>
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
        {/* Section 1: Media Assets (Avatar & Resume) */}
        <section className="p-6 sm:p-8 rounded-3xl border border-(--border-color) bg-(--bg-card) backdrop-blur-md space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-(--border-color)/60 text-xs font-mono uppercase tracking-wider text-cyan-500 font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Profile Media</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AdminMediaUploader
              value={avatar}
              onChange={setAvatar}
              folder="profile"
              accept="image/*"
              label="Profile Avatar"
              helperText="JPEG, PNG, or WEBP up to 5 MB"
              isAvatar={true}
              disabled={saving}
            />

            <AdminMediaUploader
              value={resume}
              onChange={setResume}
              folder="resume"
              accept="application/pdf"
              label="Resume Document (PDF)"
              helperText="PDF document up to 10 MB"
              disabled={saving}
            />
          </div>
        </section>

        {/* Section 2: Core Identity */}
        <section className="p-6 sm:p-8 rounded-3xl border border-(--border-color) bg-(--bg-card) backdrop-blur-md space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-(--border-color)/60 text-xs font-mono uppercase tracking-wider text-cyan-500 font-semibold">
            <User className="w-4 h-4" />
            <span>Core Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <AdminFormField
              label="Full Name"
              htmlFor="fullName"
              required
              helperText="Max 100 characters"
              error={fieldErrors.fullName}
            >
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (fieldErrors.fullName) setFieldErrors((prev) => ({ ...prev, fullName: null }));
                }}
                maxLength={100}
                placeholder="Sabari M"
                className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
              />
            </AdminFormField>

            <AdminFormField
              label="Professional Title"
              htmlFor="title"
              required
              helperText="Max 150 characters"
              error={fieldErrors.title}
            >
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: null }));
                }}
                maxLength={150}
                placeholder="MERN Stack Developer"
                className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
              />
            </AdminFormField>
          </div>

          <AdminFormField
            label="Short Bio"
            htmlFor="shortBio"
            required
            helperText={`${shortBio.length}/300 characters. Used in page headers and hero previews.`}
            error={fieldErrors.shortBio}
          >
            <input
              id="shortBio"
              type="text"
              value={shortBio}
              onChange={(e) => {
                setShortBio(e.target.value);
                if (fieldErrors.shortBio) setFieldErrors((prev) => ({ ...prev, shortBio: null }));
              }}
              maxLength={300}
              placeholder="Brief summary of your professional specialty..."
              className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
            />
          </AdminFormField>

          <AdminFormField
            label="Detailed Biography (About)"
            htmlFor="about"
            required
            helperText="Complete biography displayed on the About page."
            error={fieldErrors.about}
          >
            <textarea
              id="about"
              rows={6}
              value={about}
              onChange={(e) => {
                setAbout(e.target.value);
                if (fieldErrors.about) setFieldErrors((prev) => ({ ...prev, about: null }));
              }}
              placeholder="Detailed overview of your background, architectural focus, and engineering values..."
              className="w-full p-4 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all resize-y leading-relaxed"
            />
          </AdminFormField>
        </section>

        {/* Section 3: Contact & Status */}
        <section className="p-6 sm:p-8 rounded-3xl border border-(--border-color) bg-(--bg-card) backdrop-blur-md space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-(--border-color)/60 text-xs font-mono uppercase tracking-wider text-cyan-500 font-semibold">
            <Briefcase className="w-4 h-4" />
            <span>Contact &amp; Status</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <AdminFormField
              label="Contact Email"
              htmlFor="email"
              required
              error={fieldErrors.email}
            >
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: null }));
                }}
                placeholder="sabari@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
              />
            </AdminFormField>

            <AdminFormField label="Phone Number" htmlFor="phone">
              <input
                id="phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
              />
            </AdminFormField>

            <AdminFormField label="Location" htmlFor="location">
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="India"
                className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
              />
            </AdminFormField>

            <AdminFormField
              label="Years of Experience"
              htmlFor="yearsOfExperience"
              error={fieldErrors.yearsOfExperience}
            >
              <input
                id="yearsOfExperience"
                type="number"
                min="0"
                step="1"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
              />
            </AdminFormField>
          </div>

          <AdminToggle
            id="availableForHire"
            checked={availableForHire}
            onChange={setAvailableForHire}
            label="Available for Hire"
            description="When enabled, renders the active availability pulse badge on the public portfolio."
          />
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
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
