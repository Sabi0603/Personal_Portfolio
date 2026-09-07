import ThreeNatureBackground from './ThreeNatureBackground';

export default function AtmosphericBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Full-Page Three.js Nature Landscape Background */}
      <ThreeNatureBackground />
      {/* Background Neural Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b20_1px,transparent_1px),linear-gradient(to_bottom,#1e293b20_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Top Cyan Ambient Glow Orb */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] rounded-full bg-cyan-500/10 dark:bg-cyan-500/15 blur-[120px] will-change-transform motion-reduce:hidden animate-pulse duration-[8000ms]" />

      {/* Violet Glow Accent */}
      <div className="absolute top-[20%] -left-32 w-[28rem] h-[28rem] rounded-full bg-violet-500/10 dark:bg-violet-600/10 blur-[140px] will-change-transform motion-reduce:hidden" />

      {/* Emerald Subtle Base Glow */}
      <div className="absolute bottom-10 -right-20 w-[24rem] h-[24rem] rounded-full bg-emerald-500/8 dark:bg-emerald-500/10 blur-[130px] will-change-transform motion-reduce:hidden" />
    </div>
  );
}
