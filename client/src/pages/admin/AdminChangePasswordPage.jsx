import { useState } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAuth } from '../../hooks/useAuth';
import * as authService from '../../services/authService';
import AdminFormField from '../../components/admin/AdminFormField';
import {
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Shield,
} from 'lucide-react';

export default function AdminChangePasswordPage() {
  useDocumentTitle('Change Password | Admin Command');
  const { updateSessionToken } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!currentPassword) {
      errors.currentPassword = 'Current password is required.';
    }

    if (!newPassword) {
      errors.newPassword = 'New password is required.';
    } else if (newPassword.length < 8) {
      errors.newPassword = 'New password must be at least 8 characters.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Password confirmation is required.';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
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
      const data = await authService.changePassword(currentPassword, newPassword);

      // Backend returns fresh JWT token on password change
      if (data?.token) {
        updateSessionToken(data.token);
      }

      setSuccessMessage('Password changed successfully! Session updated with fresh credentials.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMessage(
        err.message || 'Failed to change password. Please verify your current password.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-(--border-color)">
        <h1 className="text-2xl font-bold tracking-tight text-(--text-primary)">
          Change Password
        </h1>
        <p className="text-xs font-mono text-(--text-muted) mt-1">
          Update your administrator credentials. A new authentication token will be issued.
        </p>
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

      {/* Change Password Card */}
      <div className="p-6 sm:p-8 rounded-3xl border border-(--border-color) bg-(--bg-card) backdrop-blur-md shadow-xl space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-(--border-color)/60 text-xs font-mono uppercase tracking-wider text-cyan-500 font-semibold">
          <Shield className="w-4 h-4" />
          <span>Credential Security</span>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Current Password */}
          <AdminFormField
            label="Current Password"
            htmlFor="currentPassword"
            required
            error={fieldErrors.currentPassword}
          >
            <div className="relative">
              <input
                id="currentPassword"
                type={showCurrent ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (fieldErrors.currentPassword) {
                    setFieldErrors((prev) => ({ ...prev, currentPassword: null }));
                  }
                }}
                placeholder="••••••••"
                className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-(--text-primary) transition-colors cursor-pointer"
                aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </AdminFormField>

          {/* New Password */}
          <AdminFormField
            label="New Password"
            htmlFor="newPassword"
            required
            helperText="Minimum 8 characters."
            error={fieldErrors.newPassword}
          >
            <div className="relative">
              <input
                id="newPassword"
                type={showNew ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (fieldErrors.newPassword) {
                    setFieldErrors((prev) => ({ ...prev, newPassword: null }));
                  }
                }}
                placeholder="••••••••"
                className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowNew((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-(--text-primary) transition-colors cursor-pointer"
                aria-label={showNew ? 'Hide new password' : 'Show new password'}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </AdminFormField>

          {/* Confirm New Password */}
          <AdminFormField
            label="Confirm New Password"
            htmlFor="confirmPassword"
            required
            error={fieldErrors.confirmPassword}
          >
            <input
              id="confirmPassword"
              type={showNew ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) {
                  setFieldErrors((prev) => ({ ...prev, confirmPassword: null }));
                }
              }}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
            />
          </AdminFormField>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-xs font-mono bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md hover:shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
