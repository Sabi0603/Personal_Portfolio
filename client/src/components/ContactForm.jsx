import { useState } from 'react';
import { sendContactMessage } from '../services/portfolioService';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Please provide your name.';
    }
    if (!formData.email.trim()) {
      errors.email = 'Please provide your email address.';
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }
    if (!formData.subject.trim()) {
      errors.subject = 'Please provide a subject.';
    }
    if (!formData.message.trim()) {
      errors.message = 'Please provide a message.';
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters long.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await sendContactMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });

      setSuccessMessage(
        res.message || 'Thank you! Your message has been received successfully.'
      );
      setFormData({ name: '', email: '', subject: '', message: '' });
      setFieldErrors({});
    } catch (err) {
      setErrorMessage(
        err.message || 'Failed to deliver message. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (successMessage) {
    return (
      <div className="p-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md text-center space-y-4 animate-zoom-in">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
          Message Sent
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
          {successMessage}
        </p>
        <button
          onClick={() => setSuccessMessage('')}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-(--bg-secondary) border border-(--border-color) hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="p-6 sm:p-8 rounded-2xl border border-(--border-color) backdrop-blur-xs shadow-sm space-y-5"
    >
      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-start gap-3 text-sm text-rose-600 dark:text-rose-400"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Name Field */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-xs font-mono font-medium text-(--text-secondary)">
            Your Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name"
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? 'name-error' : undefined}
            className={`w-full px-4 py-2.5 rounded-xl border bg-(--bg-primary) text-sm text-(--text-primary) placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
              fieldErrors.name
                ? 'border-rose-500 focus:ring-rose-500/20'
                : 'border-(--border-color) focus:border-cyan-500 focus:ring-cyan-500/20'
            }`}
          />
          {fieldErrors.name && (
            <p id="name-error" className="text-xs text-rose-500">
              {fieldErrors.name}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-mono font-medium text-(--text-secondary)">
            Your Email <span className="text-rose-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            className={`w-full px-4 py-2.5 rounded-xl border bg-(--bg-primary) text-sm text-(--text-primary) placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
              fieldErrors.email
                ? 'border-rose-500 focus:ring-rose-500/20'
                : 'border-(--border-color) focus:border-cyan-500 focus:ring-cyan-500/20'
            }`}
          />
          {fieldErrors.email && (
            <p id="email-error" className="text-xs text-rose-500">
              {fieldErrors.email}
            </p>
          )}
        </div>
      </div>

      {/* Subject Field */}
      <div className="space-y-1.5">
        <label htmlFor="subject" className="block text-xs font-mono font-medium text-(--text-secondary)">
          Subject <span className="text-rose-500">*</span>
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          value={formData.subject}
          onChange={handleChange}
          placeholder="Subject"
          aria-invalid={Boolean(fieldErrors.subject)}
          aria-describedby={fieldErrors.subject ? 'subject-error' : undefined}
          className={`w-full px-4 py-2.5 rounded-xl border bg-(--bg-primary) text-sm text-(--text-primary) placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
            fieldErrors.subject
              ? 'border-rose-500 focus:ring-rose-500/20'
              : 'border-(--border-color) focus:border-cyan-500 focus:ring-cyan-500/20'
          }`}
        />
        {fieldErrors.subject && (
          <p id="subject-error" className="text-xs text-rose-500">
            {fieldErrors.subject}
          </p>
        )}
      </div>

      {/* Message Field */}
      <div className="space-y-1.5">
        <label htmlFor="message" className="block text-xs font-mono font-medium text-(--text-secondary)">
          Message <span className="text-rose-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          value={formData.message}
          onChange={handleChange}
          placeholder="Your message..."
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={fieldErrors.message ? 'message-error' : undefined}
          className={`w-full px-4 py-2.5 rounded-xl border bg-(--bg-primary) text-sm text-(--text-primary) placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all resize-y ${
            fieldErrors.message
              ? 'border-rose-500 focus:ring-rose-500/20'
              : 'border-(--border-color) focus:border-cyan-500 focus:ring-cyan-500/20'
          }`}
        />
        {fieldErrors.message && (
          <p id="message-error" className="text-xs text-rose-500">
            {fieldErrors.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-md hover:shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Sending Message...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Send Message</span>
          </>
        )}
      </button>
    </form>
  );
}
