import { useState, useMemo } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useSEO } from '../../hooks/useSEO';
import { getProjects } from '../../services/portfolioService';
import SectionHeader from '../../components/SectionHeader';
import ProjectCard from '../../components/ProjectCard';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import Pagination from '../../components/Pagination';
import { Search, FolderGit2, X, Filter } from 'lucide-react';

export default function ProjectsPage() {
  useSEO({
    title: 'Projects & Work Showcase | Sabari M',
    description:
      'Explore featured full-stack web applications, open-source repositories, and software engineering projects built by Sabari M using modern web technologies.',
  });

  const { data: rawProjects, loading, error, refetch } = useFetch(getProjects);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTech, setSelectedTech] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Normalize projects array
  const projects = useMemo(() => {
    if (!Array.isArray(rawProjects)) return [];
    return rawProjects;
  }, [rawProjects]);

  // Extract all unique tech tags across all projects
  const allTechTags = useMemo(() => {
    const set = new Set();
    projects.forEach((p) => {
      if (Array.isArray(p.techStack)) {
        p.techStack.forEach((t) => set.add(t));
      }
    });
    return Array.from(set).sort();
  }, [projects]);

  // Filter projects by search query and selected tech
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.title?.toLowerCase().includes(q) ||
        p.summary?.toLowerCase().includes(q) ||
        (Array.isArray(p.techStack) && p.techStack.some((t) => t.toLowerCase().includes(q)));

      const matchesTech =
        selectedTech === 'ALL' ||
        (Array.isArray(p.techStack) && p.techStack.includes(selectedTech));

      return matchesSearch && matchesTech;
    });
  }, [projects, searchQuery, selectedTech]);

  const totalPages = Math.ceil(filteredProjects.length / pageSize) || 1;
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredProjects.slice(startIndex, startIndex + pageSize);
  }, [filteredProjects, currentPage, pageSize]);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleTechChange = (val) => {
    setSelectedTech(val);
    setCurrentPage(1);
  };

  return (
    <div className="py-12 md:py-20 space-y-12">
      <SectionHeader
        category="Portfolio"
        title="Projects"
        subtitle="Web applications and software projects."
        category="PORTFOLIO HIGHLIGHTS"
        title="Featured Projects"
        subtitle="Full-stack web applications, scalable platforms, and architectural experiments built with modern standards."
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Search & Filter Toolbar */}
        {!loading && projects.length > 0 && (
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between p-4 rounded-2xl border border-(--border-color) bg-(--bg-card)/70 backdrop-blur-md">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-9 py-2 rounded-xl text-sm border border-(--border-color) bg-(--bg-primary) text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-(--text-primary)"
                  aria-label="Clear search input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Tech Stack Pills */}
            {allTechTags.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
                <button
                  type="button"
                  onClick={() => setSelectedTech('ALL')}
                  onClick={() => handleTechChange('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all shrink-0 cursor-pointer ${
                    selectedTech === 'ALL'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'border border-(--border-color) bg-(--bg-primary) text-slate-500 hover:text-(--text-primary)'
                  }`}
                >
                  All ({projects.length})
                </button>
                {allTechTags.map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => setSelectedTech(tech)}
                    onClick={() => handleTechChange(tech)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all shrink-0 cursor-pointer ${
                      selectedTech === tech
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                        : 'border border-(--border-color) bg-(--bg-primary) text-slate-500 hover:text-(--text-primary)'
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && <LoadingSkeleton count={6} type="cards" />}

        {/* Error State */}
        {error && !loading && (
          <ErrorState
            title="Failed to Load Projects"
            message={error}
            onRetry={refetch}
          />
        )}

        {/* Empty Collection State (DB has 0 projects) */}
        {!loading && !error && projects.length === 0 && (
          <EmptyState
            icon={FolderGit2}
            title="No Projects Published Yet"
            description="Projects published in the database will appear here."
            actionText="Contact"
            actionLink="/contact"
          />
        )}

        {/* Filtered 0 Matches State */}
        {!loading && !error && projects.length > 0 && filteredProjects.length === 0 && (
          <div className="text-center py-16 px-8 rounded-2xl border border-dashed border-(--border-color) bg-(--bg-card)/30 max-w-md mx-auto space-y-3">
            <p className="text-sm font-semibold text-(--text-primary)">
              No matching projects found
            </p>
            <p className="text-xs text-(--text-muted)">
              Try adjusting your search query or reset the tech stack filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedTech('ALL');
                handleSearchChange('');
                handleTechChange('ALL');
              }}
              className="inline-flex items-center text-xs font-mono font-semibold text-cyan-500 hover:underline pt-2 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Project Grid */}
        {!loading && !error && paginatedProjects.length > 0 && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProjects.map((project) => (
                <ProjectCard key={project._id || project.slug} project={project} />
              ))}
            </div>

            {/* Pagination Controls */}
            {filteredProjects.length > pageSize && (
              <div className="pt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredProjects.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
