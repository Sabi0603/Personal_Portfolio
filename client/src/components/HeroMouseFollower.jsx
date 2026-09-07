import { useEffect, useRef } from 'react';

const PARTICLES = [
  { size: 10, mass: 1.0, k: 0.12, damping: 0.82, color: 'bg-cyan-400', glow: 'shadow-[0_0_16px_rgba(6,182,212,0.6)]' },
  { size: 7, mass: 1.2, k: 0.09, damping: 0.80, color: 'bg-blue-400', glow: 'shadow-[0_0_14px_rgba(96,165,250,0.5)]' },
  { size: 8, mass: 1.4, k: 0.07, damping: 0.78, color: 'bg-violet-400', glow: 'shadow-[0_0_14px_rgba(167,139,250,0.5)]' },
  { size: 5, mass: 0.8, k: 0.14, damping: 0.85, color: 'bg-emerald-400', glow: 'shadow-[0_0_12px_rgba(52,211,153,0.5)]' },
  { size: 6, mass: 1.6, k: 0.06, damping: 0.75, color: 'bg-cyan-300', glow: 'shadow-[0_0_12px_rgba(103,232,249,0.5)]' },
];

export default function HeroMouseFollower() {
  const containerRef = useRef(null);
  const particleRefs = useRef([]);
  const mousePos = useRef({ x: -200, y: -200, isOver: false });
  const states = useRef(
    PARTICLES.map((_, i) => ({
      x: -200,
      y: -200,
      vx: 0,
      vy: 0,
      angle: (i * (2 * Math.PI)) / PARTICLES.length,
    }))
  );

  useEffect(() => {
    // Only enable on desktop pointer devices and when motion is allowed
    // Check for pointer precision and reduced motion preference
    const isPointerFine = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (!isPointerFine || prefersReducedMotion) return;

    const handleMouseMove = (e) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
      mousePos.current.isOver = true;
    };

    const handleMouseLeave = () => {
      mousePos.current.isOver = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    let animationFrameId = null;

    const update = () => {
      const { x: targetX, y: targetY, isOver } = mousePos.current;

      if (isOver && targetX > 0) {
        states.current.forEach((st, idx) => {
          const p = PARTICLES[idx];
          const el = particleRefs.current[idx];
          if (!el) return;

          // Target position with subtle orbiting offset
          st.angle += 0.02 + idx * 0.005;
          const orbitRadius = 14 + idx * 4;
          const offsetX = Math.cos(st.angle) * orbitRadius;
          const offsetY = Math.sin(st.angle) * orbitRadius;

          const desiredX = targetX + offsetX;
          const desiredY = targetY + offsetY;

          // Spring Force: F = -k * dx
          const fx = (desiredX - st.x) * p.k;
          const fy = (desiredY - st.y) * p.k;

          // Acceleration: a = F / mass
          const ax = fx / p.mass;
          const ay = fy / p.mass;

          // Update velocity with damping
          st.vx = (st.vx + ax) * p.damping;
          st.vy = (st.vy + ay) * p.damping;

          // Repulsion from other particles
          states.current.forEach((other, oIdx) => {
            if (idx === oIdx) return;
            const distDx = st.x - other.x;
            const distDy = st.y - other.y;
            const distSq = distDx * distDx + distDy * distDy;
            if (distSq > 0 && distSq < 400) {
              const dist = Math.sqrt(distSq);
              const repulse = (20 - dist) * 0.05;
              st.vx += (distDx / dist) * repulse;
              st.vy += (distDy / dist) * repulse;
            }
          });

          // Update position
          st.x += st.vx;
          st.y += st.vy;

          // Apply hardware-accelerated transform
          el.style.transform = `translate3d(${st.x - p.size / 2}px, ${
            st.y - p.size / 2
          }px, 0)`;
        });
      }

      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-20 overflow-hidden"
      aria-hidden="true"
    >
      {PARTICLES.map((p, idx) => (
        <div
          key={idx}
          ref={(el) => (particleRefs.current[idx] = el)}
          className={`fixed top-0 left-0 rounded-full blur-[0.5px] will-change-transform ${p.color} ${p.glow}`}
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: 0.6,
            transform: 'translate3d(-200px, -200px, 0)',
          }}
        />
      ))}
    </div>
  );
}

