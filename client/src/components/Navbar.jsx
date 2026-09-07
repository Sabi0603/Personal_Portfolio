import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { Sun, Moon, Menu, X } from 'lucide-react';
import saLogo from '../assets/SA-logo.svg';

const NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/skills', label: 'Skills' },
  { path: '/projects', label: 'Projects' },
  { path: '/experience', label: 'Experience' },
  { path: '/education', label: 'Education' },
  { path: '/certifications', label: 'Certifications' },
  { path: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-(--bg-primary)/85 border-b border-(--border-color) transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Identity */}
        <Link
          to="/"
          onClick={closeMobileMenu}
          className="shrink-0 flex items-center gap-2 sm:gap-2.5 group transition-opacity hover:opacity-95"
          aria-label="Sabari M - Homepage"
        >
          <img
            src={saLogo}
            alt="SA Logo"
            className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0 group-hover:scale-105 transition-transform duration-300"
          />
          <span className="whitespace-nowrap shrink-0 text-base sm:text-lg font-mono font-extrabold tracking-widest select-none text-transparent bg-clip-text bg-linear-to-r from-cyan-400 via-sky-400 to-indigo-400">
            SABARI M
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Main Navigation">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-cyan-500 bg-cyan-500/10 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-(--text-primary) hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Actions: Theme Toggle + Mobile Menu Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-(--border-color) bg-(--bg-card) hover:bg-slate-100 dark:hover:bg-slate-800 text-(--text-primary) transition-colors cursor-pointer"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            type="button"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-90" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 transition-transform duration-300 hover:-rotate-12" />
            )}
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-lg border border-(--border-color) bg-(--bg-card) hover:bg-slate-100 dark:hover:bg-slate-800 text-(--text-primary) transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            type="button"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-(--border-color) bg-(--bg-primary)/95 backdrop-blur-xl px-4 py-4 space-y-1 animate-slide-in-top">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-cyan-500 bg-cyan-500/10 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-(--text-primary) hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
