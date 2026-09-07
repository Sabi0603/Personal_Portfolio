export default function SectionHeader({
  badge,
  category,
  title,
  subtitle,
  align = 'left',
  className = '',
}) {
  const badgeText = badge || category;
  const alignmentClasses =
    align === 'center'
      ? 'text-center items-center mx-auto'
      : 'text-left items-start';

  return (
    <div className={`flex flex-col space-y-3 mb-10 ${alignmentClasses} ${className}`}>
      {badgeText && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium border border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
          {badgeText}
        </div>
      )}

      {title && (
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
          {title}
        </h1>
      )}

      {subtitle && (
        <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
