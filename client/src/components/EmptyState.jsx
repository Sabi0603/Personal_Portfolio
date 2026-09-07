import { Link } from 'react-router-dom';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No Records Found',
  description = 'No records have been published yet.',
  actionText,
  actionLink,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed border-(--border-color) bg-(--bg-card)/40 backdrop-blur-sm max-w-lg mx-auto">
      <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-cyan-500 mb-4 ring-1 ring-(--border-color)">
        <Icon className="w-6 h-6" />
      </div>
      <h2 className="text-lg font-bold tracking-tight mb-1 text-(--text-primary)">
        {title}
      </h2>
      <p className="text-sm text-(--text-muted) max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-sm"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
}
