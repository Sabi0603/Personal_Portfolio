export default function AdminFormField({
  label,
  htmlFor,
  required = false,
  helperText,
  hint,
  help,
  error,
  children,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  id,
  name,
  min,
  max,
  step,
  maxLength,
  className = '',
  inputClassName = '',
  ...rest
}) {
  const finalId = id || htmlFor;
  const finalHelp = helperText || hint || help;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={finalId}
            className="block text-xs font-mono font-medium text-(--text-secondary)"
          >
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        </div>
      )}

      {children ? (
        children
      ) : (
        <input
          id={finalId}
          name={name}
          type={type}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          maxLength={maxLength}
          className={`w-full px-4 py-2.5 rounded-xl border ${
            error ? 'border-rose-500' : 'border-(--border-color)'
          } bg-(--bg-primary) text-sm font-mono text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${inputClassName}`}
          {...rest}
        />
      )}

      {finalHelp && !error && (
        <p className="text-[11px] font-mono text-(--text-muted) leading-normal">
          {finalHelp}
        </p>
      )}

      {error && (
        <p className="text-xs text-rose-500 font-mono">
          {error}
        </p>
      )}
    </div>
  );
}
