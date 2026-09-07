import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({
  message = 'Failed to load data. Please check your connection.',
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-rose-500/20 bg-rose-500/5 backdrop-blur-sm max-w-md mx-auto my-6">
      <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h2 className="text-base font-bold text-rose-600 dark:text-rose-400 mb-1">
        Unable to Load Content
      </h2>
      <p className="text-xs text-(--text-muted) max-w-xs mb-5">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          type="button"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-(--border-color) bg-(--bg-secondary) hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
}
