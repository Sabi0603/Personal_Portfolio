export default function AdminToggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
}) {
  const toggleId = id || `toggle-${label?.toLowerCase().replace(/\s+/g, '-') || 'checkbox'}`;

  return (
    <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-(--border-color) bg-(--bg-card)">
      <div className="space-y-0.5">
        <label
          htmlFor={toggleId}
          className="text-xs font-mono font-semibold text-(--text-primary) cursor-pointer"
        >
          {label}
        </label>
        {description && (
          <p className="text-[11px] font-mono text-(--text-muted)">
            {description}
          </p>
        )}
      </div>

      <button
        type="button"
        id={toggleId}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500/30 ${
          checked ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
