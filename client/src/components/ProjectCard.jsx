import { Link } from 'react-router-dom';
import { ExternalLink, ArrowUpRight, FolderGit2, Star } from 'lucide-react';
import { GithubIcon } from './SocialIcons';

export default function ProjectCard({ project }) {
  if (!project) return null;

  const {
    title,
    slug,
    summary,
    thumbnail,
    techStack = [],
    demoUrl,
    githubUrl,
    featured,
  } = project;

  return (
    <article className="group relative flex flex-col rounded-2xl border border-(--border-color) bg-(--bg-card) backdrop-blur-md overflow-hidden hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300 hover:-translate-y-1">
      {/* Featured Badge */}
      {featured && (
        <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-cyan-500/90 text-slate-950 shadow-sm backdrop-blur">
          <Star className="w-3 h-3 fill-current" />
          Featured
        </div>
      )}

      <div className="relative w-full aspect-video bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border-b border-(--border-color) overflow-hidden flex items-center justify-center">
        {thumbnail?.url ? (
          <img
            src={thumbnail.url}
            alt={`${title} thumbnail`}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-2">
            <FolderGit2 className="w-10 h-10 stroke-1" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Project</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
        <div className="space-y-2.5">
          <h2 className="text-xl font-bold tracking-tight text-(--text-primary) group-hover:text-cyan-500 transition-colors">
            <Link to={`/projects/${slug}`} className="focus:outline-none">
              <span className="absolute inset-0" aria-hidden="true" />
              {title}
            </Link>
          </h2>

          {summary && (
            <p className="text-sm text-(--text-secondary) line-clamp-3 leading-relaxed">
              {summary}
            </p>
          )}
        </div>

        {/* Tech Stack Chips */}
        {techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium border border-(--border-color) bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-(--border-color)/60 flex items-center justify-between z-10">
          <Link
            to={`/projects/${slug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline underline-offset-2"
          >
            View Project
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center gap-2">
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-slate-500 hover:text-(--text-primary) hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label={`${title} GitHub Repository`}
                onClick={(e) => e.stopPropagation()}
              >
                <GithubIcon className="w-4 h-4" />
              </a>
            )}
            {demoUrl && (
              <a
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label={`${title} Live Demo`}
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
