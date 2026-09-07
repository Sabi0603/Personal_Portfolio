import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../../hooks/useSEO';
import * as authService from '../../services/authService';
import { KeyRound, Mail, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function AdminForgotPasswordPage() {
  useSEO({
    title: 'Forgot Password | Sabari M',
    noIndex: true,
  });

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email.trim()) {
      setError('Please provide an email address.');
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Please provide a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authService.forgotPassword(email.trim());
      setSuccessMessage(
        res.message ||
          'If an admin account is registered with this email, password reset instructions have been dispatched.'
      );
      setEmail('');
    } catch (err) {
      setError(
        err.message || 'Unable to process password reset request. Please try again later.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-(--bg-primary) text-(--text-primary) transition-colors duration-200">
      <div className="w-full max-w-md space-y-8">
        {/* Brand / Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs font-mono text-(--text-muted) max-w-xs mx-auto">
            Provide the registered admin email to receive secure recovery instructions.
          </p>
        </div>

        {/* Card */}
        <div className="p-6 sm:p-8 rounded-3xl border border-(--border-color) bg-(--bg-card)/80 backdrop-blur-xl shadow-2xl space-y-6">
          {error && (
            <div
              role="alert"
              className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-start gap-3 text-xs leading-relaxed"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage ? (
            <div className="space-y-4 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                Instructions Dispatched
              </h2>
              <p className="text-xs text-(--text-secondary) leading-relaxed">
                {successMessage}
              </p>
              <div className="pt-2">
                <Link
                  to="/admin/login"
                  className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-xl text-xs font-semibold bg-(--bg-primary) border border-(--border-color) hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="reset-email"
                  className="block text-xs font-mono font-medium text-(--text-secondary)"
                >
                  Admin Email
                </label>
                <div className="relative">
                  <input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) text-sm text-(--text-primary) placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  />
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-md hover:shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Dispatching Instructions...</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-(--text-muted) hover:text-cyan-500 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
