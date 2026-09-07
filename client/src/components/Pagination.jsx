import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  className = '',
}) {
  if (totalPages <= 1 && totalItems <= pageSize) {
    return null;
  }

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with smart windowing
  const getPageNumbers = () => {
    const pages = [];
    const delta = 1; // Number of pages to show around current page

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 select-none ${className}`}
      aria-label="Pagination Navigation"
    >
      {/* Item Range Summary */}
      <p className="text-xs font-mono text-(--text-muted)">
        Showing <span className="font-semibold text-(--text-primary)">{startItem}</span> to{' '}
        <span className="font-semibold text-(--text-primary)">{endItem}</span> of{' '}
        <span className="font-semibold text-(--text-primary)">{totalItems}</span> records
      </p>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {/* First Page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          className="p-2 rounded-xl border border-(--border-color) bg-(--bg-card) backdrop-blur-md hover:bg-slate-100 dark:hover:bg-slate-800 text-(--text-primary) transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="First page"
          title="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-2 rounded-xl border border-(--border-color) bg-(--bg-card) backdrop-blur-md hover:bg-slate-100 dark:hover:bg-slate-800 text-(--text-primary) transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Previous page"
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Numbered Pages */}
        <div className="flex items-center gap-1">
          {pages.map((p, idx) => {
            if (p === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-xs font-mono text-(--text-muted)"
                >
                  &hellip;
                </span>
              );
            }
            const isActive = p === currentPage;
            return (
              <button
                key={`page-${p}`}
                type="button"
                onClick={() => onPageChange(p)}
                className={`min-w-8 h-8 px-2.5 rounded-xl text-xs font-mono font-medium transition-all ${
                  isActive
                    ? 'bg-linear-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-sm shadow-cyan-500/20'
                    : 'border border-(--border-color) bg-(--bg-card) backdrop-blur-md hover:bg-slate-100 dark:hover:bg-slate-800 text-(--text-primary) cursor-pointer'
                }`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Page ${p}`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-2 rounded-xl border border-(--border-color) bg-(--bg-card) backdrop-blur-md hover:bg-slate-100 dark:hover:bg-slate-800 text-(--text-primary) transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next page"
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className="p-2 rounded-xl border border-(--border-color) bg-(--bg-card) backdrop-blur-md hover:bg-slate-100 dark:hover:bg-slate-800 text-(--text-primary) transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Last page"
          title="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

