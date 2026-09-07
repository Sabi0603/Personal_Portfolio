import { useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { useSEO } from '../../hooks/useSEO';
import { getProjectBySlug } from '../../services/portfolioService';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorState from '../../components/ErrorState';
import ProjectScreenshotSlider from '../../components/ProjectScreenshotSlider';
import {
  ArrowLeft,
  ExternalLink,
  Layers,
  Calendar,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { GithubIcon } from '../../components/SocialIcons';

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const fetchProject = useCallback(() => getProjectBySlug(slug), [slug]);
  const {
    data: project,
    loading,
    error,
    refetch,
  } = useFetch(fetchProject, [slug]);

  const projectTitle = project?.title || 'Project Details';
  const projectSummary =
    project?.summary ||
    (project?.description ? project.description.slice(0, 160) : '') ||
    'Explore project architecture, technical stack, and live demonstration.';
  const projectImage = project?.thumbnail?.url;
  const projectCanonical =
    typeof window !== 'undefined' ? `${window.location.origin}/projects/${slug}` : undefined;

  useSEO({
    title: `${projectTitle} | Sabari M`,
    description: projectSummary,
    keywords: project?.techStack,
    canonical: projectCanonical,
    ogTitle: `${projectTitle} — MERN Project by Sabari M`,
    ogDescription: projectSummary,
    ogImage: projectImage,
    ogType: 'article',
    structuredData: project
      ? {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: project.title,
          description: projectSummary,
          programmingLanguage: project.techStack || ['JavaScript'],
          codeRepository: project.githubUrl,
          author: {
            '@type': 'Person',
            name: 'Sabari M',
          },
          url: projectCanonical,
          image: projectImage,
        }
      : undefined,
  });

  return (
    <div className="py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Navigation Back Link */}
        <div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Back to Projects
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            <LoadingSkeleton count={1} type="text" />
            <LoadingSkeleton count={1} type="cards" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="py-12">
            <ErrorState
              title="Project Not Found"
              message={error || 'The requested project could not be located.'}
              onRetry={refetch}
            />
            <div className="text-center mt-6">
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors"
              >
                Browse Projects
              </Link>
            </div>
          </div>
        )}

        {/* Project Content */}
        {!loading && !error && project && (
          <article className="space-y-12">
            {/* Header / Meta */}
            <div className="space-y-6">
              {project.createdAt && (
                <div className="flex items-center gap-2 text-xs font-mono text-(--text-muted)">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(project.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </div>
              )}

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-(--text-primary)">
                {project.title}
              </h1>

              {project.summary && (
                <p className="text-base sm:text-lg text-(--text-secondary) leading-relaxed max-w-3xl">
                  {project.summary}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md hover:shadow-cyan-500/20 transition-all active:scale-95"
                  >
                    <span>Live Demo</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm border border-(--border-color) bg-(--bg-card) hover:bg-slate-100 dark:hover:bg-slate-800 text-(--text-primary) transition-all active:scale-95"
                  >
                    <GithubIcon className="w-4 h-4" />
                    <span>Source Code</span>
                  </a>
                )}
              </div>
            </div>

            {/* Thumbnail Banner */}
            {project.thumbnail?.url && (
              <div className="rounded-3xl border border-(--border-color) overflow-hidden bg-slate-950/80 backdrop-blur-md shadow-xl flex items-center justify-center p-2 sm:p-4">
                <img
                  src={project.thumbnail.url}
                  alt={`${project.title} Preview`}
                  className="w-full h-auto max-h-[500px] object-contain rounded-2xl"
                />
              </div>
            )}

            {/* Tech Stack Specs */}
            {Array.isArray(project.techStack) && project.techStack.length > 0 && (
              <div className="p-6 sm:p-8 rounded-2xl border border-(--border-color) bg-(--bg-card) backdrop-blur-md space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-cyan-500">
                  <Layers className="w-4 h-4" />
                  Technologies
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium border border-(--border-color) bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {project.description && (
              <div className="p-6 sm:p-8 rounded-2xl border border-(--border-color) bg-(--bg-card) backdrop-blur-md space-y-4">
                <h2 className="text-xl font-bold tracking-tight text-(--text-primary)">
                  Description
                </h2>
                <div className="prose dark:prose-invert max-w-none text-sm sm:text-base text-(--text-secondary) leading-relaxed whitespace-pre-line">
                  {project.description}
                </div>
              </div>
            )}

            {/* Problem Statement */}
            {project.problem && (
              <div className="p-6 sm:p-8 rounded-2xl border border-rose-500/20 bg-rose-500/5 backdrop-blur-md space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-rose-500 dark:text-rose-400">
                  <AlertCircle className="w-4 h-4" />
                  The Problem & Challenge
                </div>
                <div className="prose dark:prose-invert max-w-none text-sm sm:text-base text-(--text-secondary) leading-relaxed whitespace-pre-line">
                  {project.problem}
                </div>
              </div>
            )}

            {/* Solution & Approach */}
            {project.solution && (
              <div className="p-6 sm:p-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-md space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  The Solution & Architecture
                </div>
                <div className="prose dark:prose-invert max-w-none text-sm sm:text-base text-(--text-secondary) leading-relaxed whitespace-pre-line">
                  {project.solution}
                </div>
              </div>
            )}

            {/* Screenshot Gallery Slider */}
            {Array.isArray(project.screenshots) && project.screenshots.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-bold text-(--text-primary)">
                  <ImageIcon className="w-5 h-5 text-cyan-500" />
                  <span>Screenshots & Gallery</span>
                </div>
                <ProjectScreenshotSlider
                  screenshots={project.screenshots}
                  title={project.title}
                />
              </div>
            )}

            {/* Back to Projects Navigation */}
            <div className="pt-6 border-t border-(--border-color) flex items-center justify-between">
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-cyan-500 hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Projects
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-slate-500 hover:text-(--text-primary)"
              >
                Contact
              </Link>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
