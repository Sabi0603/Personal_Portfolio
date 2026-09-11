import { FileText, ExternalLink, Image as ImageIcon } from 'lucide-react';

export default function AdminMediaPreview({
  url,
  previewUrl,
  fileName,
  viewUrl,
  isPdf = false,
  isAvatar = false,
  alt = 'Media preview',
}) {
  if (!url) return null;

  if (isPdf) {
    return (
      <div className="flex items-center gap-3 p-3.5 rounded-xl border border-(--border-color) bg-(--bg-card)">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={alt}
            className="w-12 h-14 rounded-lg object-contain bg-slate-950 p-0.5 border border-(--border-color) shrink-0 shadow-xs"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono font-medium text-(--text-primary) truncate">
            {fileName || 'document.pdf'}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase font-semibold">
              PDF
            </span>
            <span className="text-[11px] font-mono text-(--text-muted)">
              {previewUrl ? 'Visual Preview' : 'Document Preview'}
            </span>
          </div>
        </div>
        <a
          href={viewUrl || url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-(--border-color) bg-(--bg-primary) hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono text-cyan-600 dark:text-cyan-400 transition-colors shrink-0"
        >
          <span>View Document</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  if (isAvatar) {
    return (
      <div className="relative group w-24 h-24 rounded-2xl overflow-hidden border-2 border-cyan-500/30 bg-slate-900/60 shadow-inner">
        <img
          src={url}
          alt={alt}
          className="w-full h-full object-cover object-top"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-mono transition-opacity"
          aria-label="View full avatar image"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <div className="relative group rounded-xl overflow-hidden border border-(--border-color) bg-slate-950/40 max-w-sm">
      <img
        src={url}
        alt={alt}
        className="w-full h-44 object-fill object-center"
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
        <span className="text-[11px] font-mono text-slate-200 truncate max-w-[200px]">
          {fileName || 'image_asset'}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-900/80 hover:bg-slate-800 text-cyan-400 text-[11px] font-mono border border-cyan-500/30 transition-colors"
        >
          <ImageIcon className="w-3 h-3" />
          <span>Full Image</span>
        </a>
      </div>
    </div>
  );
}
