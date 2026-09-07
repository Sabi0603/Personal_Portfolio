import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { useSEO } from '../../hooks/useSEO';
import { getProfile } from '../../services/portfolioService';
import HeroMouseFollower from '../../components/HeroMouseFollower';
import HeroAvatarOrbit from '../../components/HeroAvatarOrbit';
import { ArrowRight, Mail } from 'lucide-react';

export default function HomePage() {
  const { data: profile } = useFetch(getProfile);

  const displayName = profile?.fullName || 'Sabari M';
  const displayTitle = profile?.title || 'MERN Stack Developer';
  const description =
    profile?.shortBio ||
    profile?.about ||
    'Production-ready full-stack portfolio of Sabari M, a MERN Stack Developer crafting performant web applications.';

  useSEO({
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Person',
          '@id': 'https://personal-portfolio-eight-vert-31.vercel.app/#person',
          name: displayName,
          jobTitle: displayTitle,
          description,
          url: 'https://personal-portfolio-eight-vert-31.vercel.app',
          sameAs: [
            profile?.socialLinks?.github,
            profile?.socialLinks?.linkedin,
            profile?.socialLinks?.twitter,
          ].filter(Boolean),
        },
        {
          '@type': 'WebSite',
          '@id': 'https://personal-portfolio-eight-vert-31.vercel.app/#website',
          url: 'https://personal-portfolio-eight-vert-31.vercel.app',
          name: `${displayName} Portfolio`,
          description,
          publisher: {
            '@id': 'https://personal-portfolio-eight-vert-31.vercel.app/#person',
          },
        },
      ],
    },
  });

  return (
    <div className="relative min-h-[calc(100vh-16rem)] flex items-center justify-center py-6 sm:py-12">
      {/* Three.js Procedural Nature / Atmospheric Landscape Background */}

      {/* Mouse-Following Interactive Particle Trail */}
      <HeroMouseFollower />

      {/* Hero Section Container */}
      <section className="relative z-10 w-full flex flex-col-reverse md:flex-row items-center justify-between gap-12 lg:gap-16">
        {/* Left Column: Headlines & Action CTAs */}
        <div className="flex-1 space-y-6 text-center md:text-left">
          {profile?.availableForHire && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Available for Hire
            </div>
          )}

          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl text-nowrap font-extrabold tracking-tight leading-[1.12]">
              Hello, <br /> I&apos;m{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 via-sky-400 to-indigo-400">
                {displayName}
              </span>
            </h1>
            <p className="text-xl sm:text-2xl font-mono text-cyan-600 dark:text-cyan-400 font-semibold tracking-tight">
              &gt; {displayTitle}
            </p>
          </div>

          {profile?.shortBio && (
            <p className="text-base sm:text-lg text-(--text-muted) max-w-xl mx-auto md:mx-0 leading-relaxed">
              {profile.shortBio}
            </p>
          )}

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-md hover:shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <span>View Projects</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border border-(--border-color) bg-(--bg-card) hover:bg-slate-100 dark:hover:bg-slate-800 text-(--text-primary) transition-colors cursor-pointer"
            >
              <Mail className="w-4 h-4 text-cyan-500" />
              <span>Contact</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Pure Circular Avatar with External Orbiting Particles */}
        <div className="flex-1 flex justify-center md:justify-end">
          <HeroAvatarOrbit
            avatarUrl={profile?.avatar?.url}
            displayName={displayName}
          />
        </div>
      </section>
    </div>
  );
}
