import { useState, useRef } from 'react';
import { uploadMedia } from '../../services/adminService';
import AdminMediaPreview from './AdminMediaPreview';
import {
  UploadCloud,
  Loader2,
  AlertCircle,
  RefreshCw,
  Trash2,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';

const ALLOWED_STANDARD_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_SKILL_IMAGE_TYPES = [...ALLOWED_STANDARD_IMAGE_TYPES, 'image/svg+xml'];
const ALLOWED_PDF_TYPES = ['application/pdf'];

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export default function AdminMediaUploader({
  value, // { url: string, publicId: string, fileName?: string, previewUrl?: string, file?: File, isStaged?: boolean } OR string url
  onChange,
  folder = 'projects',
  accept = 'image/*',
  label = 'Media Asset',
  helperText,
  isAvatar = false,
  disabled = false,
  staged = false,
}) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isPdf = accept === 'application/pdf' || folder === 'resume';
  const maxSizeBytes = isPdf ? MAX_PDF_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
  const maxSizeLabel = isPdf ? '10 MB' : '5 MB';

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    // Reset file input value so re-selecting same file triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (!file) return;

    setErrorMessage('');

    const ext = (file.name ? file.name.slice(file.name.lastIndexOf('.')) : '').toLowerCase();
    const isSvg = file.type === 'image/svg+xml' || ext === '.svg';

    // MIME type & format validation
    if (isPdf) {
      if (!ALLOWED_PDF_TYPES.includes(file.type) && ext !== '.pdf') {
        setErrorMessage('Invalid file format. Only PDF documents are allowed.');
        return;
      }
    } else if (folder === 'skills') {
      const isValidSkill =
        ALLOWED_SKILL_IMAGE_TYPES.includes(file.type) ||
        isSvg ||
        ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
      if (!isValidSkill) {
        setErrorMessage('Invalid image format. Allowed formats: JPEG, PNG, WEBP, SVG.');
        return;
      }
    } else {
      if (isSvg) {
        setErrorMessage('SVG files are only allowed for skill icons.');
        return;
      }
      const isValidImage =
        ALLOWED_STANDARD_IMAGE_TYPES.includes(file.type) ||
        ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
      if (!isValidImage) {
        setErrorMessage('Invalid image format. Allowed formats: JPEG, PNG, WEBP.');
        return;
      }
    }

    // File size validation
    if (file.size > maxSizeBytes) {
      setErrorMessage(`File exceeds the maximum limit of ${maxSizeLabel}.`);
      return;
    }

    // STAGED MODE: Local preview only, no remote upload yet
    if (staged) {
      if (value?.isStaged && value?.previewUrl) {
        try {
          URL.revokeObjectURL(value.previewUrl);
        } catch {
          // ignore
        }
      }
      const previewUrl = URL.createObjectURL(file);
      onChange({
        file,
        previewUrl,
        url: previewUrl,
        fileName: file.name,
        isStaged: true,
      });
      return;
    }

    // DIRECT MODE: Upload to backend/Cloudinary immediately
    setUploading(true);
    try {
      const result = await uploadMedia(file, folder);

      // Safe extraction supporting both direct asset payload and nested data payload
      const media = result?.data?.url ? result.data : result;

      if (media?.url) {
        onChange({
          url: media.url,
          publicId: media.publicId || '',
          fileName: media.fileName || file.name,
        });
      } else {
        throw new Error('Upload succeeded but no asset URL was returned.');
      }
    } catch (err) {
      const message =
        err.message ||
        'Upload failed. Ensure Cloudinary is configured or check your network connection.';
      setErrorMessage(message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setErrorMessage('');
    if (value?.isStaged && value?.previewUrl) {
      try {
        URL.revokeObjectURL(value.previewUrl);
      } catch {
        // ignore
      }
    }
    onChange(null);
  };

  const mediaUrl = typeof value === 'string' ? value : value?.previewUrl || value?.url || '';
  const mediaFileName = typeof value === 'object' ? value?.fileName : '';
  const isStaged = typeof value === 'object' && Boolean(value?.isStaged);
  const hasMedia = Boolean(mediaUrl);

  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-mono font-medium text-(--text-secondary)">
            {label}
          </label>
          <span className="text-[11px] font-mono text-(--text-muted)">
            Max: {maxSizeLabel}
          </span>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        disabled={disabled || uploading}
        className="hidden"
        aria-hidden="true"
      />

      {/* Error Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-start gap-2.5 text-xs leading-relaxed"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">{errorMessage}</div>
        </div>
      )}

      {/* Media Present View */}
      {hasMedia ? (
        <div className="space-y-3">
          <AdminMediaPreview
            url={mediaUrl}
            fileName={mediaFileName}
            isPdf={isPdf}
            isAvatar={isAvatar}
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={disabled || uploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-(--border-color) bg-(--bg-card) hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono font-medium text-(--text-primary) transition-colors cursor-pointer disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              <span>Replace</span>
            </button>

            <button
              type="button"
              disabled={disabled || uploading}
              onClick={handleRemove}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-mono font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>

            {isStaged && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                Staged (Uploads on Save)
              </span>
            )}
          </div>
        </div>
      ) : (
        /* Empty Upload Dropzone View */
        <div
          onClick={() => {
            if (!disabled && !uploading) {
              fileInputRef.current?.click();
            }
          }}
          className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-2 ${
            uploading
              ? 'border-cyan-500/50 bg-cyan-500/5 pointer-events-none'
              : 'border-(--border-color) hover:border-cyan-500/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 bg-(--bg-card)/40'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
              <p className="text-xs font-mono text-cyan-500 font-medium">
                Uploading to Cloud Storage...
              </p>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 flex items-center justify-center">
                {isPdf ? (
                  <FileText className="w-5 h-5" />
                ) : isAvatar ? (
                  <ImageIcon className="w-5 h-5" />
                ) : (
                  <UploadCloud className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-mono font-medium text-(--text-primary)">
                  Click to select {isPdf ? 'PDF document' : 'image'}
                </p>
                <p className="text-[11px] font-mono text-(--text-muted)">
                  {helperText ||
                    (isPdf
                      ? 'PDF file up to 10 MB'
                      : 'JPEG, PNG, SVG or WEBP up to 5 MB')}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
