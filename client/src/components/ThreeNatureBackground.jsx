import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../hooks/useTheme';

/**
 * Helper to detect WebGL availability in the client browser.
 */
function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export default function ThreeNatureBackground() {
  const containerRef = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Graceful fallback if WebGL is unavailable
    if (!isWebGLAvailable()) {
      return;
    }

    // Accessibility check: user motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // 1. Scene, Camera, Renderer Setup
    const scene = new THREE.Scene();
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 1000);
    camera.position.set(0, 4.2, 19);
    camera.lookAt(0, 1.2, 0);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return; // WebGL initialization failure fallback
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // 2. Dynamic Atmosphere & Natural Fog
    // Light mode: soft daylight alpine/valley atmosphere with gentle green-sky tint
    // Dark mode: cinematic nocturnal deep sky with starlit horizon
    const lightFogColor = new THREE.Color(0xf1f8f6);
    const darkFogColor = new THREE.Color(0x070b13);
    scene.fog = new THREE.FogExp2(
      isDark ? darkFogColor : lightFogColor,
      isDark ? 0.032 : 0.026
    );

    // ==========================================
    // 3. LAYER 1: PRIMARY VALLEY & MOUNTAIN RIDGES
    // ==========================================
    const terrainWidth = 64;
    const terrainDepth = 54;
    const segmentsX = 46;
    const segmentsY = 38;

    const terrainGeo = new THREE.PlaneGeometry(
      terrainWidth,
      terrainDepth,
      segmentsX,
      segmentsY
    );
    terrainGeo.rotateX(-Math.PI / 2);

    const pos = terrainGeo.attributes.position;
    const originalY = new Float32Array(pos.count);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Distance from center creates a natural valley floor for readable content
      const distFromCenter = Math.abs(x) / (terrainWidth * 0.5);

      // Multi-frequency natural terrain harmonics
      let y =
        Math.sin(x * 0.18 + 1.2) * Math.cos(z * 0.14) * 2.0 +
        Math.sin(x * 0.38 - z * 0.28) * 0.9 +
        Math.cos(x * 0.09 - z * 0.07) * 2.4;

      // Amplify ridges on the flanks (majestic mountains framing the page)
      y += Math.pow(distFromCenter, 2.2) * 6.2;

      // Smooth downward taper at the immediate foreground
      if (z > 6) {
        y -= (z - 6) * 0.45;
      }

      pos.setY(i, y);
      originalY[i] = y;
    }
    terrainGeo.computeVertexNormals();

    // Natural landscape color grading
    // Light mode: lush alpine emerald / fresh teal contours
    // Dark mode: bioluminescent cyan aurora ridges
    const lightTerrainColor = new THREE.Color(0x0d9488); // Emerald-teal
    const darkTerrainColor = new THREE.Color(0x06b6d4); // Cyan glow

    const terrainMat = new THREE.MeshBasicMaterial({
      color: isDark ? darkTerrainColor : lightTerrainColor,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.24 : 0.20,
    });

    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.position.set(0, -3.8, -4);
    scene.add(terrain);

    // ==========================================
    // 4. LAYER 2: DISTANT ALPINE HORIZON RIDGES
    // ==========================================
    const bgRidgeGeo = new THREE.PlaneGeometry(76, 32, 36, 18);
    bgRidgeGeo.rotateX(-Math.PI / 2);
    const bgPos = bgRidgeGeo.attributes.position;
    for (let i = 0; i < bgPos.count; i++) {
      const x = bgPos.getX(i);
      const z = bgPos.getZ(i);
      const y =
        Math.sin(x * 0.14 + 2.2) * Math.cos(z * 0.18) * 3.8 +
        Math.cos(x * 0.28) * 1.8;
      bgPos.setY(i, y);
    }
    bgRidgeGeo.computeVertexNormals();

    // Light: soft sky blue; Dark: deep indigo cosmic silhouette
    const lightRidgeColor = new THREE.Color(0x0284c7);
    const darkRidgeColor = new THREE.Color(0x6366f1);

    const bgRidgeMat = new THREE.MeshBasicMaterial({
      color: isDark ? darkRidgeColor : lightRidgeColor,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.14 : 0.10,
    });
    const bgRidge = new THREE.Mesh(bgRidgeGeo, bgRidgeMat);
    bgRidge.position.set(0, -1.2, -24);
    scene.add(bgRidge);

    // ==========================================
    // 5. ATMOSPHERIC NATURE PARTICLES (FLORA SPORES / CELESTIAL STARS)
    // ==========================================
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 44;
      particlePositions[i * 3 + 1] = Math.random() * 18 - 2;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 40;

      // Gentle natural upward breeze with slight lateral drift
      particleVelocities[i * 3] = (Math.random() - 0.5) * 0.005;
      particleVelocities[i * 3 + 1] = Math.random() * 0.007 + 0.0025;
      particleVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
    }
    particleGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(particlePositions, 3)
    );

    // Light mode: golden-emerald sunlit pollen spores
    // Dark mode: glowing celestial starlight particles
    const lightParticleColor = new THREE.Color(0x059669);
    const darkParticleColor = new THREE.Color(0x22d3ee);

    const particleMat = new THREE.PointsMaterial({
      color: isDark ? darkParticleColor : lightParticleColor,
      size: isDark ? 0.18 : 0.15,
      transparent: true,
      opacity: isDark ? 0.70 : 0.45,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ==========================================
    // 6. INTERACTIVE PARALLAX (MOUSE & PAGE SCROLL)
    // ==========================================
    let mouseX = 0;
    let mouseY = 0;
    let scrollOffset = 0;
    let targetCameraX = 0;
    let targetCameraY = 4.2;

    const handleMouseMove = (e) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      mouseX = (e.clientX - windowHalfX) / windowHalfX;
      mouseY = (e.clientY - windowHalfY) / windowHalfY;
    };

    const handleScroll = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight || 1;
      scrollOffset = Math.min(window.scrollY / maxScroll, 1);
    };

    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (isFinePointer) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Handle Window Resize
    const handleResize = () => {
      if (!container || !renderer) return;
      const newWidth = container.clientWidth || window.innerWidth;
      const newHeight = container.clientHeight || window.innerHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // ==========================================
    // 7. ANIMATION RENDER LOOP
    // ==========================================
    let animationFrameId = null;
    const clock = new THREE.Clock();

    const animate = () => {
      if (prefersReducedMotion) {
        renderer.render(scene, camera);
        return;
      }

      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Subtle breeze ripples across mountain terrain
      const positions = terrainGeo.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const u = positions.getX(i);
        const v = positions.getZ(i);
        const wave =
          Math.sin(elapsedTime * 0.45 + u * 0.28 + v * 0.18) * 0.22;
        positions.setY(i, originalY[i] + wave);
      }
      positions.needsUpdate = true;

      // Natural floating pollen/star drift
      const pPos = particleGeo.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pPos[i * 3] += particleVelocities[i * 3];
        pPos[i * 3 + 1] += particleVelocities[i * 3 + 1];
        pPos[i * 3 + 2] += particleVelocities[i * 3 + 2];

        // Wrap particles back when drifting beyond bounds
        if (pPos[i * 3 + 1] > 15) {
          pPos[i * 3 + 1] = -2;
        }
        if (Math.abs(pPos[i * 3]) > 22) {
          pPos[i * 3] = -pPos[i * 3] * 0.95;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Smooth camera interpolation with mouse & scroll parallax
      targetCameraX = mouseX * 2.2;
      // Scroll gently elevates camera perspective on long pages
      targetCameraY = 4.2 - mouseY * 1.0 + scrollOffset * 1.5;

      camera.position.x += (targetCameraX - camera.position.x) * 0.035;
      camera.position.y += (targetCameraY - camera.position.y) * 0.035;
      camera.lookAt(0, 1.2 + scrollOffset * 0.5, 0);

      renderer.render(scene, camera);
    };

    animate();

    // ==========================================
    // 8. STRICT CLEANUP ON UNMOUNT (ZERO MEMORY LEAKS)
    // ==========================================
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      if (isFinePointer) {
        window.removeEventListener('mousemove', handleMouseMove);
      }

      // Dispose Geometries and Materials
      terrainGeo.dispose();
      terrainMat.dispose();
      bgRidgeGeo.dispose();
      bgRidgeMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();

      // Dispose Renderer and Detach DOM Canvas
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isDark]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    />
  );
}

