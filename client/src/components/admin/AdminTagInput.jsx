import { useState } from 'react';
import { X } from 'lucide-react';

export default function AdminTagInput({
  tags = [],
  onChange,
  placeholder = 'Add keyword...',
  disabled = false,
}) {
  const [inputVal, setInputVal] = useState('');

  const addTag = (text) => {
    const clean = text.trim();
    if (!clean) return;
    if (!tags.includes(clean)) {
      onChange([...tags, clean]);
    }
    setInputVal('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputVal);
    } else if (e.key === 'Backspace' && !inputVal && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const removeTag = (indexToRemove) => {
    if (disabled) return;
    onChange(tags.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 p-2.5 rounded-xl border border-(--border-color) bg-(--bg-primary) min-h-[46px] items-center focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
        {tags.map((tag, idx) => (
          <span
            key={`${tag}-${idx}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20"
          >
            <span>{tag}</span>
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(idx)}
                className="hover:text-rose-500 transition-colors cursor-pointer"
                aria-label={`Remove keyword ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}

        {!disabled && (
          <div className="flex-1 min-w-[120px] flex items-center">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => inputVal && addTag(inputVal)}
              placeholder={tags.length === 0 ? placeholder : ''}
              className="w-full bg-transparent border-none text-xs font-mono text-(--text-primary) placeholder:text-slate-400 focus:outline-none p-1"
            />
          </div>
        )}
      </div>

      <p className="text-[11px] font-mono text-(--text-muted)">
        Press Enter or comma to add a keyword tag.
      </p>
    </div>
  );
}
