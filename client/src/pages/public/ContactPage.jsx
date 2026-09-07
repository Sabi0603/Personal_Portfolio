import { useFetch } from '../../hooks/useFetch';
import { useSEO } from '../../hooks/useSEO';
import { getProfile, getSocialLinks } from '../../services/portfolioService';
import SectionHeader from '../../components/SectionHeader';
import ContactForm from '../../components/ContactForm';
import {
  Mail,
  Phone,
  MapPin,
  Sparkles,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { GithubIcon, LinkedinIcon, TwitterIcon } from '../../components/SocialIcons';

const SOCIAL_ICONS = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  twitter: TwitterIcon,
  x: TwitterIcon,
  portfolio: Globe,
  default: Globe,
};

export default function ContactPage() {
  useSEO({
    title: 'Contact & Inquiries | Sabari M',
    description:
      'Get in touch with Sabari M for full-stack MERN development opportunities, software engineering inquiries, collaborations, or consultation.',
  });

  const { data: profile } = useFetch(getProfile);
  const { data: rawSocials } = useFetch(getSocialLinks);

  const socialLinks = Array.isArray(rawSocials) ? rawSocials : [];

  return (
    <div className="py-12 md:py-20 space-y-12">
      <SectionHeader
        category="START A CONVERSATION"
        title="Get In Touch"
        subtitle="Have a project in mind, opportunities to discuss, or want to connect? Send a message directly."
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Info (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl border border-(--border-color) backdrop-blur-xs space-y-6">
              {profile?.availableForHire && (
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                  </span>
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Available for Hire
                  </span>
                </div>
              )}

              <div>
                <h2 className="text-xl font-bold text-(--text-primary)">
                  Contact Information
                </h2>
                <p className="text-sm text-(--text-secondary) mt-2 leading-relaxed">
                  Feel free to reach out via the form or through the direct contact details below.
                </p>
              </div>

              {/* Direct Info List */}
              <div className="space-y-4 pt-2 border-t border-(--border-color)/60 text-sm">
                {profile?.email && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500 shrink-0 mt-0.5">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-mono text-(--text-muted) uppercase tracking-wider">
                        Email
                      </div>
                      <a
                        href={`mailto:${profile.email}`}
                        className="font-medium text-(--text-primary) hover:text-cyan-500 transition-colors"
                      >
                        {profile.email}
                      </a>
                    </div>
                  </div>
                )}

                {profile?.phone && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500 shrink-0 mt-0.5">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-mono text-(--text-muted) uppercase tracking-wider">
                        Phone
                      </div>
                      <a
                        href={`tel:${profile.phone}`}
                        className="font-medium text-(--text-primary) hover:text-cyan-500 transition-colors"
                      >
                        {profile.phone}
                      </a>
                    </div>
                  </div>
                )}

                {profile?.location && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500 shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-mono text-(--text-muted) uppercase tracking-wider">
                        Location
                      </div>
                      <div className="font-medium text-(--text-primary)">
                        {profile.location}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Social Links (only if present in DB) */}
            {socialLinks.length > 0 && (
              <div className="p-6 rounded-2xl border border-(--border-color) bg-(--bg-card) backdrop-blur-md space-y-3">
                <div className="text-xs font-mono font-semibold uppercase tracking-wider text-(--text-muted) flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                  Social Links
                </div>
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map((link) => {
                    const key = link.platform.toLowerCase();
                    const Icon = SOCIAL_ICONS[key] || SOCIAL_ICONS.default;
                    return (
                      <a
                        key={link._id || link.platform}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-(--border-color) bg-(--bg-primary) hover:border-cyan-500/50 hover:bg-cyan-500/10 text-xs font-medium text-(--text-primary) transition-all"
                      >
                        <Icon className="w-3.5 h-3.5 text-cyan-500" />
                        <span>{link.platform}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Contact Form Component (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold tracking-tight text-(--text-primary)">
                Send a Message
              </h3>
              <p className="text-xs text-(--text-muted)">
                Fill out the form below. All fields marked with * are required.
              </p>
            </div>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
