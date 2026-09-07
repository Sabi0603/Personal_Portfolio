import { useMemo } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useSEO } from '../../hooks/useSEO';
import { getCertifications } from '../../services/portfolioService';
import SectionHeader from '../../components/SectionHeader';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import {
  Award,
  ExternalLink,
  Calendar,
  ShieldCheck,
} from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
};

export default function CertificationsPage() {
  useSEO({
    title: 'Certifications & Accreditations | Sabari M',
    description:
      'View verified industry certifications, cloud credentials, technical licenses, and continuous learning achievements earned by Sabari M.',
  });

  const { data: rawData, loading, error, refetch } = useFetch(getCertifications);

  const certifications = useMemo(() => {
    if (!Array.isArray(rawData)) return [];
    return rawData;
  }, [rawData]);

  return (
    <div className="py-12 md:py-20 space-y-12">
      <SectionHeader
        category="VERIFIED EXPERTISE"
        title="Certifications & Badges"
        subtitle="Industry-recognized certifications, verified technical badges, and professional course completions."
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Loading State */}
        {loading && <LoadingSkeleton count={3} type="cards" />}

        {/* Error State */}
        {error && !loading && (
          <ErrorState
            title="Failed to Load Certifications"
            message={error}
            onRetry={refetch}
          />
        )}

        {/* Empty State */}
        {!loading && !error && certifications.length === 0 && (
          <EmptyState
            icon={Award}
            title="No Certifications Listed"
            description="Certifications published in the database will appear here."
            actionText="Browse Projects"
            actionLink="/projects"
          />
        )}

        {/* Certifications Grid */}
        {!loading && !error && certifications.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.map((cert) => (
              <div
                key={cert._id}
                className="group p-6 rounded-2xl border border-(--border-color) bg-(--bg-card) backdrop-blur-md hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-4">
                  {/* Top Status Header */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-cyan-500">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                        <Award className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-(--text-muted)">
                        Credential
                      </span>
                    </div>
                    {cert.doesNotExpire ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <ShieldCheck className="w-3 h-3" />
                        No Expiry
                      </span>
                    ) : cert.expiryDate ? (
                      <span className="text-[10px] font-mono text-(--text-muted)">
                        Exp: {formatDate(cert.expiryDate)}
                      </span>
                    ) : null}
                  </div>

                  {/* Enlarged Certificate / Badge Preview */}
                  {cert.image?.url && (
                    <div className="relative w-full h-44 sm:h-48 md:h-52 rounded-xl overflow-hidden bg-slate-950/40 dark:bg-slate-900/60 border border-(--border-color)/80 flex items-center justify-center p-3 group-hover:border-cyan-500/30 transition-colors">
                      <img
                        src={cert.image.url}
                        alt={`${cert.title} certificate`}
                        className="w-full h-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Title & Issuer */}
                  <div>
                    <h3 className="font-bold text-base text-(--text-primary) group-hover:text-cyan-500 transition-colors">
                      {cert.title}
                    </h3>
                    <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 mt-1">
                      {cert.issuer}
                    </p>
                  </div>

                  {/* Issue Date & ID */}
                  <div className="space-y-1 text-xs font-mono text-(--text-muted) border-t border-(--border-color)/60 pt-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Issued: {formatDate(cert.issueDate)}</span>
                    </div>
                    {cert.credentialId && (
                      <div className="truncate">
                        <span className="text-slate-400">ID: </span>
                        <span className="text-(--text-primary) font-medium">
                          {cert.credentialId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Verification Link */}
                {cert.credentialUrl && (
                  <div className="pt-2">
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      <span>Verify Credential</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
