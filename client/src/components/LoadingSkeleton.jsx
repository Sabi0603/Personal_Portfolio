export default function LoadingSkeleton({ count = 3, type = 'card' }) {
  return (
    <div className="w-full space-y-6 animate-pulse" aria-busy="true" aria-label="Loading content">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-6 rounded-2xl border border-(--border-color) bg-(--bg-card)/50 backdrop-blur-sm space-y-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
          </div>
          {type === 'card' && (
            <div className="flex gap-2 pt-2">
              <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
