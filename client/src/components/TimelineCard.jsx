import { Calendar, MapPin, Building2, GraduationCap, ExternalLink } from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return 'Present';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
};

export default function TimelineCard({ item, type = 'experience' }) {
  if (!item) return null;

  const isEdu = type === 'education';

  const title = item.title || item.degree;
  const subtitle = item.company || item.institution;
  const startDate = formatDate(item.startDate);
  const endDate = item.isCurrent ? 'Present' : formatDate(item.endDate);
  const location = item.location;
  const description = item.description;
  const techStack = item.techStack || [];
  const grade = item.grade;
  const fieldOfStudy = item.fieldOfStudy;
  const companyUrl = item.companyUrl;

  return (
    <div className="relative pl-8 sm:pl-10 pb-10 last:pb-2 group">
      {/* Vertical Connecting Line */}
      <div
        className="absolute left-3 sm:left-3.5 top-3 bottom-0 w-[2px] bg-slate-200 dark:bg-slate-800 group-last:hidden"
        aria-hidden="true"
      />

      {/* Node Dot */}
      <div
        className="absolute left-1.5 sm:left-2 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-cyan-500 bg-(--bg-primary) group-hover:scale-125 group-hover:bg-cyan-500 transition-all duration-300 shadow-sm"
        aria-hidden="true"
      />

      {/* Card Content */}
      <div className="p-6 rounded-2xl border border-(--border-color) bg-(--bg-card) backdrop-blur-md hover:border-cyan-500/40 transition-all duration-300 space-y-4">
        {/* Header line */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-(--border-color)/60 pb-3">
          <div className="space-y-1">
            <h3 className="text-lg font-bold tracking-tight text-(--text-primary)">
              {title}
            </h3>
            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-600 dark:text-cyan-400">
              {isEdu ? <GraduationCap className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
              {companyUrl ? (
                <a
                  href={companyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline flex items-center gap-1"
                >
                  {subtitle}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span>{subtitle}</span>
              )}
              {fieldOfStudy && (
                <span className="text-xs text-(--text-muted) font-normal">
                  &bull; {fieldOfStudy}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400 shrink-0 mt-1 sm:mt-0">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-500" />
              {startDate} &mdash; {endDate}
            </span>
            {location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {location}
              </span>
            )}
          </div>
        </div>

        {/* Grade info for education */}
        {grade && (
          <div className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400">
            Grade / CGPA: {grade}
          </div>
        )}

        {/* Description bullets */}
        {Array.isArray(description) && description.length > 0 && (
          <ul className="space-y-1.5 text-sm text-(--text-secondary) list-disc pl-5 leading-relaxed">
            {description.map((bullet, idx) => (
              <li key={idx}>{bullet}</li>
            ))}
          </ul>
        )}

        {typeof description === 'string' && description.trim() && (
          <p className="text-sm text-(--text-secondary) leading-relaxed">
            {description}
          </p>
        )}

        {/* Tech Stack Chips */}
        {techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 rounded-md text-[11px] font-mono border border-(--border-color) bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
