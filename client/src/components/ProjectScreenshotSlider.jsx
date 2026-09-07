import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Layers,
} from 'lucide-react';

export default function ProjectScreenshotSlider({ screenshots = [], title = 'Project' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);
  const thumbnailContainerRef = useRef(null);

  const total = screenshots.length;

  const goToPrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  }, [total]);

  const goToNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  }, [total]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrev, goToNext, isLightboxOpen]);

  // Keep thumbnail strip scrolled into view
  useEffect(() => {
    if (!thumbnailContainerRef.current) return;
    const activeThumb = thumbnailContainerRef.current.children[currentIndex];
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [currentIndex]);

  // Touch swipe handling
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 45;
    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
  };

  if (!screenshots || screenshots.length === 0) {
    return null;
  }

  const current = screenshots[currentIndex] || screenshots[0];
  const currentUrl = current?.url || current?.previewUrl || '';
  const currentCaption = current?.caption || '';

  return (
    <div
      className="space-y-4"
      role="region"
      aria-roledescription="carousel"
      aria-label={`${title} Screenshots`}
    >
      {/* Main Showcase Stage */}
      <div
        className="relative group rounded-2xl md:rounded-3xl border border-(--border-color) bg-slate-950/80 backdrop-blur-md overflow-hidden shadow-2xl flex flex-col items-center justify-center select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top Info Bar */}
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-3 sm:p-4 bg-gradient-to-b from-slate-950/80 to-transparent pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-slate-900/90 text-cyan-400 border border-cyan-500/30 backdrop-blur-sm">
              <Layers className="w-3 h-3" />
              <span>
                {currentIndex + 1} / {total}
              </span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            aria-label="View Fullscreen"
            className="pointer-events-auto p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Display Image Container */}
        <div
          className="w-full h-[280px] sm:h-[400px] md:h-[500px] lg:h-[560px] flex items-center justify-center p-2 sm:p-4 cursor-pointer"
          onClick={() => setIsLightboxOpen(true)}
        >
          <img
            key={currentUrl}
            src={currentUrl}
            alt={currentCaption || `${title} Screenshot ${currentIndex + 1}`}
            className="max-h-full max-w-full object-contain rounded-lg drop-shadow-md transition-all duration-300 ease-out"
            loading="lazy"
          />
        </div>

        {/* Navigation Arrows (shown if > 1 screenshot) */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
              aria-label="Previous screenshot"
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-slate-900/80 hover:bg-cyan-500 text-white hover:text-slate-950 border border-white/10 hover:border-cyan-400 transition-all duration-200 cursor-pointer shadow-lg active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              aria-label="Next screenshot"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-slate-900/80 hover:bg-cyan-500 text-white hover:text-slate-950 border border-white/10 hover:border-cyan-400 transition-all duration-200 cursor-pointer shadow-lg active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Bottom Caption Bar */}
        {currentCaption && (
          <div className="w-full py-2.5 px-4 bg-slate-900/90 border-t border-(--border-color) text-center">
            <p className="text-xs sm:text-sm font-mono text-slate-300 truncate max-w-2xl mx-auto">
              {currentCaption}
            </p>
          </div>
        )}
      </div>

      {/* Thumbnail Strip (if > 1 screenshot) */}
      {total > 1 && (
        <div
          ref={thumbnailContainerRef}
          className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 px-1 scrollbar-thin scrollbar-thumb-slate-700/50"
        >
          {screenshots.map((item, idx) => {
            const thumbUrl = item?.url || item?.previewUrl || '';
            const isActive = idx === currentIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to screenshot ${idx + 1}`}
                className={`relative shrink-0 w-16 sm:w-20 md:w-24 h-12 sm:h-14 md:h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-slate-950/60 ${
                  isActive
                    ? 'border-cyan-400 shadow-md shadow-cyan-500/20 scale-105'
                    : 'border-transparent opacity-60 hover:opacity-100 hover:border-(--border-color)'
                }`}
              >
                <img
                  src={thumbUrl}
                  alt={item?.caption || `Thumb ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Screenshot Fullscreen Preview"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">
              {currentIndex + 1} / {total}
            </span>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Close fullscreen"
              className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            className="relative max-w-7xl max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentUrl}
              alt={currentCaption || `${title} Screenshot`}
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
            />
          </div>

          {currentCaption && (
            <p
              className="mt-4 text-sm font-mono text-slate-300 text-center max-w-2xl px-4"
              onClick={(e) => e.stopPropagation()}
            >
              {currentCaption}
            </p>
          )}

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrev();
                }}
                aria-label="Previous screenshot"
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-800/80 hover:bg-cyan-500 hover:text-slate-950 text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                aria-label="Next screenshot"
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-800/80 hover:bg-cyan-500 hover:text-slate-950 text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

