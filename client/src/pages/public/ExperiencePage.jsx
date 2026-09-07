import { useMemo } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useSEO } from '../../hooks/useSEO';
import { getExperience } from '../../services/portfolioService';
import SectionHeader from '../../components/SectionHeader';
import TimelineCard from '../../components/TimelineCard';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { Briefcase } from 'lucide-react';

export default function ExperiencePage() {
  useSEO({
    title: 'Experience & Career Trajectory | Sabari M',
    description:
      'Explore the professional software engineering experience, roles, employment milestones, and full-stack system delivery of Sabari M.',
  });

  const { data: rawData, loading, error, refetch } = useFetch(getExperience);

  const experiences = useMemo(() => {
    if (!Array.isArray(rawData)) return [];
    return rawData;
  }, [rawData]);

  return (
    <div className="py-12 md:py-20 space-y-12">
      <SectionHeader
        category="CAREER TRAJECTORY"
        title="Professional Experience"
        subtitle="Engineering milestones, roles, and real-world system delivery across teams and projects."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Loading State */}
        {loading && <LoadingSkeleton count={3} type="cards" />}

        {/* Error State */}
        {error && !loading && (
          <ErrorState
            title="Failed to Load Experience"
            message={error}
            onRetry={refetch}
          />
        )}

        {/* Empty State */}
        {!loading && !error && experiences.length === 0 && (
          <EmptyState
            icon={Briefcase}
            title="No Experience Records"
            description="Experience entries published in the database will appear here."
            actionText="Browse Projects"
            actionLink="/projects"
          />
        )}

        {/* Timeline View */}
        {!loading && !error && experiences.length > 0 && (
          <div className="relative pt-4">
            {experiences.map((item) => (
              <TimelineCard key={item._id} item={item} type="experience" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
