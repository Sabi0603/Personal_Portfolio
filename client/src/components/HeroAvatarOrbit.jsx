import { User } from 'lucide-react';

// Crisp inline SVGs for the 8 core technologies
const TECH_ICONS = {
  React: (
    <svg viewBox="-11.5 -10.23174 23 20.46348" className="w-4 h-4" fill="#06b6d4">
      <circle cx="0" cy="0" r="2.05" fill="#06b6d4" />
      <g stroke="#06b6d4" strokeWidth="1" fill="none">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  ),
  Node: (
    <svg viewBox="0 0 32 32" className="w-3.5 h-3.5" fill="#22c55e">
      <path d="M16 2.5l11.7 6.8v13.4L16 29.5 4.3 22.7V9.3L16 2.5z" fill="none" stroke="#22c55e" strokeWidth="2.5" />
      <text x="16" y="19" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="bold" fontFamily="monospace">JS</text>
    </svg>
  ),
  JavaScript: (
    <div className="w-3.5 h-3.5 rounded-xs bg-[#f7df1e] text-slate-950 font-black text-[9px] flex items-center justify-center font-mono leading-none">
      JS
    </div>
  ),
  MongoDB: (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="#10b981">
      <path d="M12 2C12 2 6 9 6 15c0 3.31 2.69 6 6 6s6-2.69 6-6c0-6-6-13-6-13zm0 17.5c-2.48 0-4.5-2.02-4.5-4.5 0-3.5 3-7.5 4.5-9.5 1.5 2 4.5 6 4.5 9.5 0 2.48-2.02 4.5-4.5 4.5z" />
    </svg>
  ),
  Tailwind: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#38bdf8">
      <path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z" />
    </svg>
  ),
  Express: (
    <div className="w-3.5 h-3.5 rounded-full bg-slate-800 border border-slate-600 text-white font-mono font-bold text-[8px] flex items-center justify-center tracking-tighter">
      ex
    </div>
  ),
  HTML: (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="#f97316">
      <path d="M4 2l1.6 18 6.4 2 6.4-2 1.6-18H4zm13.3 5.3h-7.6l.2 2.7h7.2l-.6 6.3-4.5 1.3-4.5-1.3-.3-3.3h2.3l.1 1.6 2.4.6 2.4-.6.3-2.7H7.7L7 5.3h10.5l-.2 2z" />
    </svg>
  ),
  CSS: (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="#3b82f6">
      <path d="M4 2l1.6 18 6.4 2 6.4-2 1.6-18H4zm13.3 5.3h-7.6l.2 2.7h7.2l-.6 6.3-4.5 1.3-4.5-1.3-.3-3.3h2.3l.1 1.6 2.4.6 2.4-.6.3-2.7H7.7L7 5.3h10.5l-.2 2z" />
    </svg>
  ),
};

export default function HeroAvatarOrbit({ avatarUrl, displayName }) {
  return (
    <div className="relative flex items-center justify-center p-10 sm:p-14 select-none">
      {/* Outer Orbit Track 1 (Clockwise) - 4 Tech Nodes: React, Node, MongoDB, JavaScript */}
      <div
        className="absolute -inset-4 sm:-inset-6 rounded-full border border-cyan-500/20 dark:border-cyan-400/20 animate-orbit-cw motion-reduce:animate-none pointer-events-none"
        aria-hidden="true"
      >
        {/* React Node (Top) */}
        <div
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-(--bg-card) border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)] backdrop-blur-md flex items-center justify-center ring-1 ring-cyan-400/30 transition-transform duration-300 pointer-events-auto"
          title="React"
        >
          {TECH_ICONS.React}
        </div>

        {/* Node.js Node (Right) */}
        <div
          className="absolute top-1/2 -right-3.5 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-(--bg-card) border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)] backdrop-blur-md flex items-center justify-center ring-1 ring-emerald-400/30 transition-transform duration-300 pointer-events-auto"
          title="Node.js"
        >
          {TECH_ICONS.Node}
        </div>

        {/* MongoDB Node (Bottom) */}
        <div
          className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-(--bg-card) border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)] backdrop-blur-md flex items-center justify-center ring-1 ring-emerald-400/30 transition-transform duration-300 pointer-events-auto"
          title="MongoDB"
        >
          {TECH_ICONS.MongoDB}
        </div>

        {/* JavaScript Node (Left) */}
        <div
          className="absolute top-1/2 -left-3.5 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-(--bg-card) border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.3)] backdrop-blur-md flex items-center justify-center ring-1 ring-amber-400/30 transition-transform duration-300 pointer-events-auto"
          title="JavaScript"
        >
          {TECH_ICONS.JavaScript}
        </div>
      </div>

      {/* Outer Orbit Track 2 (Counter-Clockwise) - 4 Tech Nodes: Tailwind, Express, HTML5, CSS3 */}
      <div
        className="absolute -inset-9 sm:-inset-12 rounded-full border border-dashed border-violet-500/20 dark:border-violet-400/20 animate-orbit-ccw motion-reduce:animate-none pointer-events-none"
        aria-hidden="true"
      >
        {/* Tailwind CSS (Top-Right ~ 45 deg) */}
        <div
          className="absolute top-[14%] right-[14%] -translate-x-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-(--bg-card) border border-sky-500/40 shadow-[0_0_12px_rgba(56,189,248,0.3)] backdrop-blur-md flex items-center justify-center ring-1 ring-sky-400/30 transition-transform duration-300 pointer-events-auto"
          title="Tailwind CSS"
        >
          {TECH_ICONS.Tailwind}
        </div>

        {/* Express (Bottom-Right ~ 135 deg) */}
        <div
          className="absolute bottom-[14%] right-[14%] -translate-x-1/2 translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-(--bg-card) border border-slate-500/40 shadow-[0_0_12px_rgba(148,163,184,0.3)] backdrop-blur-md flex items-center justify-center ring-1 ring-slate-400/30 transition-transform duration-300 pointer-events-auto"
          title="Express.js"
        >
          {TECH_ICONS.Express}
        </div>

        {/* HTML5 (Bottom-Left ~ 225 deg) */}
        <div
          className="absolute bottom-[14%] left-[14%] translate-x-1/2 translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-(--bg-card) border border-orange-500/40 shadow-[0_0_12px_rgba(249,115,22,0.3)] backdrop-blur-md flex items-center justify-center ring-1 ring-orange-400/30 transition-transform duration-300 pointer-events-auto"
          title="HTML5"
        >
          {TECH_ICONS.HTML}
        </div>

        {/* CSS3 (Top-Left ~ 315 deg) */}
        <div
          className="absolute top-[14%] left-[14%] translate-x-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-(--bg-card) border border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.3)] backdrop-blur-md flex items-center justify-center ring-1 ring-blue-400/30 transition-transform duration-300 pointer-events-auto"
          title="CSS3"
        >
          {TECH_ICONS.CSS}
        </div>
      </div>

      {/* Pure Circular Avatar Core */}
      <div className="relative z-10 w-48 h-48 sm:w-60 sm:h-60 lg:w-68 lg:h-68 rounded-full p-1.5 bg-linear-to-tr from-cyan-500/30 via-blue-500/20 to-violet-500/30 shadow-2xl shadow-cyan-500/10 transition-transform duration-500 hover:scale-[1.02]">
        <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 border-2 border-cyan-500/40 dark:border-cyan-400/50 flex items-center justify-center">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName || 'Sabari M'}
              className="w-full h-full object-cover object-top rounded-full"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-slate-800/90 flex items-center justify-center text-cyan-400">
              <User className="w-20 h-20 sm:w-24 sm:h-24 stroke-1 opacity-80" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

