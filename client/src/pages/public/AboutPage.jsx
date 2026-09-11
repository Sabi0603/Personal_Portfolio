import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useSEO } from '../../hooks/useSEO';
import {
  getProfile,
  getResume,
  getResumeViewUrl,
  getResumeDownloadUrl,
} from '../../services/portfolioService';
import { downloadFileFromUrl } from '../../utils/downloadHelper';
import SectionHeader from '../../components/SectionHeader';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import {
  Loader2,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  UserCheck,
  User,
  ExternalLink,
  Download,
  Eye,
} from 'lucide-react';

export default function AboutPage() {
  const { data: profile, loading, error, refetch } = useFetch(getProfile);
  const { data: resumeData } = useFetch(getResume);

  const fullName = profile?.fullName || 'Sabari M';
  const title = profile?.title || 'MERN Stack Developer';
  const aboutText = profile?.about;
  const shortBio = profile?.shortBio;

  const activeResume = resumeData || profile?.resume;
  const resumeUrl = activeResume?.url;
  const resumeFileName = activeResume?.fileName || 'Sabari-M-Resume.pdf';
  const resumeViewUrl = getResumeViewUrl();
  const resumeDownloadUrl = getResumeDownloadUrl();

  const [downloading, setDownloading] = useState(false);

  const handleDownloadResume = async (e) => {
    e.preventDefault();
    if (!resumeUrl || downloading) return;
    setDownloading(true);
    try {
      await downloadFileFromUrl(resumeUrl, resumeFileName);
    } catch (err) {
      console.error('Error initiating resume download:', err);
      window.location.href = resumeDownloadUrl;
    } finally {
      setDownloading(false);
    }
  };

  useSEO({
    title: `About ${fullName} | ${title}`,
    description:
      shortBio ||
      aboutText ||
      `Learn more about ${fullName}, a professional ${title} specializing in React, Node.js, Express, and MongoDB.`,
  });

  const hasProfileData = Boolean(profile);

  return (
    <div className="space-y-12">
      <SectionHeader
        badge="About"
        category="BACKGROUND & IDENTITY"
        title="About Me"
        subtitle="Architecting resilient web applications and intuitive digital experiences with the MERN ecosystem."
      />

      {loading ? (
        <LoadingSkeleton count={2} />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !hasProfileData ? (
        <EmptyState
          icon={User}
          title="Profile Information"
          description="Profile information will appear here once updated in the database."
          actionText="View Projects"
          actionLink="/projects"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Quick Profile Info Card */}
          <div className="p-6 sm:p-8 rounded-2xl border border-(--border-color) bg-(--bg-card) backdrop-blur-md space-y-6">
            <div className="space-y-2 pb-4 border-b border-(--border-color)/60">
              <h2 className="text-2xl font-bold tracking-tight text-(--text-primary)">
                {fullName}
              </h2>
              <p className="text-sm font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
                {title}
              </p>
            </div>

            {/* Profile Meta List */}
            <div className="space-y-3.5 text-xs font-mono">
              {profile.location && (
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <MapPin className="w-4 h-4 text-cyan-500 shrink-0" />
                  <span>{profile.location}</span>
                </div>
              )}

              {profile.email && (
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <Mail className="w-4 h-4 text-cyan-500 shrink-0" />
                  <a href={`mailto:${profile.email}`} className="hover:underline">
                    {profile.email}
                  </a>
                </div>
              )}

              {profile.phone && (
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <Phone className="w-4 h-4 text-cyan-500 shrink-0" />
                  <span>{profile.phone}</span>
                </div>
              )}

              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <Briefcase className="w-4 h-4 text-cyan-500 shrink-0" />
                <span>MERN Stack Development</span>
              </div>

              {profile.availableForHire && (
                <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                  <UserCheck className="w-4 h-4 shrink-0" />
                  <span>Available for Hire</span>
                </div>
              )}
            </div>

            {/* Resume Actions - View + Download */}
            {resumeUrl && (
              <div className="pt-2 space-y-2.5">
                <a
                  href={resumeViewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>View Resume</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>

                <button
                  type="button"
                  onClick={handleDownloadResume}
                  disabled={downloading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-sm cursor-pointer disabled:opacity-75"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download Resume (PDF)</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Detailed Biography (only from backend API) */}
          <div className="lg:col-span-2 space-y-6">
            {shortBio || aboutText ? (
              <div className="p-6 sm:p-8 rounded-2xl border border-(--border-color) bg-(--bg-card) backdrop-blur-md space-y-5">
                {shortBio && (
                  <p className="text-base text-cyan-600 sm:text-lg font-medium leading-relaxed">
                    {shortBio}
                  </p>
                )}
                {aboutText && (
                  <div className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {aboutText}
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                icon={User}
                title="Biography"
                description="Biography details have not yet been published."
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
