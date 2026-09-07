import { useMemo } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useSEO } from '../../hooks/useSEO';
import { getEducation } from '../../services/portfolioService';
import SectionHeader from '../../components/SectionHeader';
import TimelineCard from '../../components/TimelineCard';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { GraduationCap } from 'lucide-react';

export default function EducationPage() {
  useSEO({
    title: 'Education & Academic Background | Sabari M',
    description:
      'Review the academic degrees, computer science education, engineering coursework, and qualifications of Sabari M.',
  });

  const { data: rawData, loading, error, refetch } = useFetch(getEducation);

  const educations = useMemo(() => {
    if (!Array.isArray(rawData)) return [];
    return rawData;
  }, [rawData]);

  return (
    <div className="py-12 md:py-20 space-y-12">
      <SectionHeader
        category="ACADEMIC BACKGROUND"
        title="Education & Credentials"
        subtitle="Foundational computer science education, engineering coursework, and formal academic training."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Loading State */}
        {loading && <LoadingSkeleton count={2} type="cards" />}

        {/* Error State */}
        {error && !loading && (
          <ErrorState
            title="Failed to Load Education"
            message={error}
            onRetry={refetch}
          />
        )}

        {/* Empty State */}
        {!loading && !error && educations.length === 0 && (
          <EmptyState
            icon={GraduationCap}
            title="No Education Records"
            description="Education entries published in the database will appear here."
            actionText="View Skills"
            actionLink="/skills"
          />
        )}

        {/* Timeline View */}
        {!loading && !error && educations.length > 0 && (
          <div className="relative pt-4">
            {educations.map((item) => (
              <TimelineCard key={item._id} item={item} type="education" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
