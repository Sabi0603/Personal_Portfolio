import { useState, useMemo } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useSEO } from '../../hooks/useSEO';
import { getSkills } from '../../services/portfolioService';
import SectionHeader from '../../components/SectionHeader';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import {
  Code2,
  Server,
  Database,
  Cpu,
  Wrench,
  Sparkles,
  Layers,
} from 'lucide-react';

const CATEGORY_ICONS = {
  Frontend: Code2,
  Backend: Server,
  Database: Database,
  DevOps: Cpu,
  Tools: Wrench,
  Other: Sparkles,
};

export default function SkillsPage() {
  useSEO({
    title: 'Skills & Technologies | Sabari M',
    description:
      'Explore the technical skills, programming languages, frameworks, and modern developer tools used by Sabari M, including React, Node.js, Express, MongoDB, and Tailwind CSS.',
  });

  const { data: rawSkills, loading, error, refetch } = useFetch(getSkills);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const skillsList = useMemo(() => {
    if (!rawSkills) return [];
    if (Array.isArray(rawSkills)) return rawSkills;
    if (Array.isArray(rawSkills.skills)) return rawSkills.skills;
    return [];
  }, [rawSkills]);

  const categories = useMemo(() => {
    const cats = ['All'];
    skillsList.forEach((s) => {
      if (s.category && !cats.includes(s.category)) {
        cats.push(s.category);
      }
    });
    return cats;
  }, [skillsList]);

  const filteredSkills = useMemo(() => {
    if (selectedCategory === 'All') return skillsList;
    return skillsList.filter((s) => s.category === selectedCategory);
  }, [skillsList, selectedCategory]);

  return (
    <div className="py-12 md:py-20 space-y-12">
      <SectionHeader
        category="TECHNICAL CAPABILITIES"
        title="Skills & Technologies"
        subtitle="Full-stack engineering stack, architectural capabilities, and modern technologies."
      />

      {loading && (
        <div className="max-w-6xl mx-auto px-4">
          <LoadingSkeleton count={6} type="cards" />
        </div>
      )}

      {error && !loading && (
        <div className="max-w-xl mx-auto px-4">
          <ErrorState
            title="Failed to Load Skills"
            message={error}
            onRetry={refetch}
          />
        </div>
      )}

      {!loading && !error && skillsList.length === 0 && (
        <div className="max-w-xl mx-auto px-4">
          <EmptyState
            icon={Sparkles}
            title="No Skills Published Yet"
            description="Technical skills, frameworks, and proficiencies will appear here once published from the admin command center."
          />
        </div>
      )}

      {!loading && !error && skillsList.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          {/* Category Filter Tabs */}
          {categories.length > 2 && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-mono font-medium transition-all duration-200 border cursor-pointer ${
                      isActive
                        ? 'bg-cyan-500/15 border-cyan-500 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                        : 'border-(--border-color) bg-(--bg-card) backdrop-blur-md text-(--text-muted) hover:text-(--text-primary) hover:border-cyan-500/40'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}

          {/* Transparent Glass Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map((skill) => {
              const FallbackIcon = CATEGORY_ICONS[skill.category] || Layers;
              const proficiency = Math.min(100, Math.max(0, Number(skill.proficiency) || 0));

              return (
                <div
                  key={skill._id}
                  className="group relative p-6 rounded-2xl border border-(--border-color) bg-(--bg-card) backdrop-blur-md hover:border-cyan-500/40 hover:shadow-[0_8px_30px_rgba(6,182,212,0.1)] transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header: Icon, Name & Category */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 group-hover:scale-105 transition-transform duration-300 shrink-0">
                          {skill.icon?.url || (typeof skill.icon === 'string' && skill.icon) ? (
                            <img
                              src={skill.icon.url || skill.icon}
                              alt={skill.name}
                              className="w-6 h-6 object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) {
                                  e.target.nextSibling.style.display = 'block';
                                }
                              }}
                            />
                          ) : null}
                          <FallbackIcon
                            className={`w-5 h-5 ${skill.icon?.url || (typeof skill.icon === 'string' && skill.icon) ? 'hidden' : 'block'}`}
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-(--text-primary) group-hover:text-cyan-400 transition-colors">
                            {skill.name}
                          </h3>
                          <span className="text-xs font-mono text-(--text-muted)">
                            {skill.category}
                          </span>
                        </div>
                      </div>

                      {/* Percentage Badge */}
                      <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 shrink-0">
                        {proficiency}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="h-1.5 w-full rounded-full bg-slate-200/50 dark:bg-slate-800/60 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-cyan-500 to-blue-500 transition-all duration-700 ease-out"
                          style={{ width: `${proficiency}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
