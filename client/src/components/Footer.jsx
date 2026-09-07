import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSocialLinks } from "../services/portfolioService";
import { Mail, Globe } from "lucide-react";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "./SocialIcons";
import saLogo from "../assets/SA-logo.svg";

const getSocialIcon = (platform = "", iconName = "") => {
    const normalized = (iconName || platform).toLowerCase();
    if (normalized.includes("github"))
        return <GithubIcon className="w-4 h-4" />;
    if (normalized.includes("linkedin"))
        return <LinkedinIcon className="w-4 h-4" />;
    if (normalized.includes("twitter") || normalized.includes("x"))
        return <TwitterIcon className="w-4 h-4" />;
    if (normalized.includes("mail") || normalized.includes("email"))
        return <Mail className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
};

export default function Footer() {
    const [socialLinks, setSocialLinks] = useState([]);

    useEffect(() => {
        let isMounted = true;
        getSocialLinks()
            .then((data) => {
                if (isMounted && Array.isArray(data)) {
                    setSocialLinks(data);
                }
            })
            .catch(() => {
                // Silently handle if backend is offline; footer remains graceful
            });
        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <footer className="border-t border-(--border-color) bg-(--bg-primary)/80 backdrop-blur-sm transition-colors duration-200 mt-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
                <div
                    className={`grid grid-cols-1 ${socialLinks.length > 0 ? "md:grid-cols-3" : "md:grid-cols-2"} gap-8 mb-8`}
                >
                    {/* Brand Col */}
                    <div className="space-y-3">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2.5 group"
                        >
                            <img
                                src={saLogo}
                                alt="SA Logo"
                                className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0 group-hover:scale-105 transition-transform duration-300"
                            />
                            <span className="whitespace-nowrap shrink-0 font-mono font-extrabold text-base tracking-widest bg-linear-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
                                SABARI M
                            </span>
                        </Link>
                        <p className="text-xs text-(--text-muted) max-w-xs leading-relaxed">
                            MERN Stack Developer
                        </p>
                    </div>

                    {/* Navigation Links */}
                    <div className="space-y-2">
                        <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                            Navigation
                        </h2>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <Link
                                to="/about"
                                className="text-(--text-muted) hover:text-cyan-500 transition-colors"
                            >
                                About
                            </Link>
                            <Link
                                to="/skills"
                                className="text-(--text-muted) hover:text-cyan-500 transition-colors"
                            >
                                Skills
                            </Link>
                            <Link
                                to="/projects"
                                className="text-(--text-muted) hover:text-cyan-500 transition-colors"
                            >
                                Projects
                            </Link>
                            <Link
                                to="/experience"
                                className="text-(--text-muted) hover:text-cyan-500 transition-colors"
                            >
                                Experience
                            </Link>
                            <Link
                                to="/education"
                                className="text-(--text-muted) hover:text-cyan-500 transition-colors"
                            >
                                Education
                            </Link>
                            <Link
                                to="/certifications"
                                className="text-(--text-muted) hover:text-cyan-500 transition-colors"
                            >
                                Certifications
                            </Link>
                            <Link
                                to="/contact"
                                className="text-(--text-muted) hover:text-cyan-500 transition-colors"
                            >
                                Contact
                            </Link>
                        </div>
                    </div>

                    {/* Social Links Col - only rendered if links exist in backend */}
                    {socialLinks.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                                Connect
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {socialLinks.map((link) => (
                                    <a
                                        key={link._id || link.url}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-lg border border-(--border-color) bg-(--bg-card) hover:text-cyan-500 hover:border-cyan-500/50 transition-all text-slate-500 dark:text-slate-400"
                                        aria-label={link.platform}
                                    >
                                        {getSocialIcon(
                                            link.platform,
                                            link.icon,
                                        )}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom copyright line */}
                <div className="border-t border-(--border-color)/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-(--text-muted) gap-4">
                    <p>
                        &copy; {new Date().getFullYear()} Sabari M. All rights
                        reserved.
                    </p>
                    <p className="flex items-center gap-1.5">
                        Designed &amp; engineered with React &amp; Tailwind CSS
                    </p>
                </div>
            </div>
        </footer>
    );
}
