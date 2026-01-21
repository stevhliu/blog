"use client";

import { memo, useEffect, useRef } from "react";

type Dot = {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  alpha: number;
  captured: boolean;
  // New physics properties
  mass: number;
  angularMomentum: number;
  spin: 1 | -1;
  orbitBias: number;
  stretch: number;
  stretchAngle: number;
  trail: { x: number; y: number; alpha: number }[];
};

type Settings = {
  spacing: number;
  radius: number;
  minAlpha: number;
  maxAlpha: number;
  color: string;
  flickerRate: number;
  timeScale: number;
  centralMass: number;
  eventHorizon: number;
  schwartzschildRadius: number;
  accretionStart: number;
  dragCoefficient: number;
  tidalStrength: number;
  trailLength: number;
  orbitCouplingBase: number;
  orbitCouplingBoost: number;
  subCircularFactor: number;
  farOrbitFactor: number;
};

function getSettings(dark: boolean): Settings {
  return {
    spacing: 14,
    radius: 2.4,
    minAlpha: dark ? 0.008 : 0.012,
    maxAlpha: dark ? 0.055 : 0.07,
    color: dark ? "255, 255, 255" : "0, 0, 0",
    flickerRate: 0.06,
    timeScale: 0.35,
    // Physics constants
    centralMass: 500,
    eventHorizon: 8,
    schwartzschildRadius: 40,
    accretionStart: 400,
    dragCoefficient: 0.9998,
    tidalStrength: 0.0000006,
    trailLength: 6,
    orbitCouplingBase: 0.035,
    orbitCouplingBoost: 0.12,
    subCircularFactor: 0.92,
    farOrbitFactor: 0.32,
  };
}

export const HomeDotPattern = memo(function HomeDotPattern() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const animationRef = useRef<number | null>(null);
  const centerRef = useRef({ x: 0, y: 0 });
  const settingsRef = useRef<Settings | null>(null);
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctxRef.current = ctx;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

    const updateSettings = () => {
      settingsRef.current = getSettings(prefersDark.matches);
    };

    let resizeRaf: number | null = null;
    const scheduleResizeAndDraw = () => {
      if (resizeRaf !== null) {
        return;
      }
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = null;
        resize();
        draw();
      });
    };

    const resize = () => {
      const settings =
        settingsRef.current ?? getSettings(prefersDark.matches);
      const { spacing, minAlpha, maxAlpha, centralMass } = settings;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;
      sizeRef.current = { width, height, dpr };

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Center mass near the bottom-right
      centerRef.current = {
        x: width * 0.9,
        y: height * 0.66,
      };

      const dots: Dot[] = [];
      for (let y = 0; y <= height; y += spacing) {
        for (let x = 0; x <= width; x += spacing) {
          const dx = x - centerRef.current.x;
          const dy = y - centerRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // All dots spin in the same direction for coherent orbiting.
          // (Use a fixed direction so the field reads as one system.)
          const spin: 1 | -1 = 1;

          // Give dots an initial tangential velocity close to a circular orbit
          // so they visibly orbit immediately, then spiral inward under drag.
          const safeDist = Math.max(dist, 1);
          const gravitationalAccel = centralMass / (safeDist * safeDist + 1000);
          const vCircular = Math.sqrt(gravitationalAccel * safeDist);
          const orbitBias = 0.82 + Math.random() * 0.28; // dot-to-dot variety

          // Tangential unit vector (perpendicular to radial)
          const tx = dist > 0 ? -dy / dist : 0;
          const ty = dist > 0 ? dx / dist : 0;

          const initialTangentialSpeed =
            dist > 60 ? spin * vCircular * orbitBias * 0.55 : 0;

          dots.push({
            x,
            y,
            originX: x,
            originY: y,
            vx: tx * initialTangentialSpeed,
            vy: ty * initialTangentialSpeed,
            alpha: minAlpha + Math.random() * (maxAlpha - minAlpha),
            captured: false,
            mass: 0.8 + Math.random() * 0.4,
            angularMomentum: initialTangentialSpeed * dist,
            spin,
            orbitBias,
            stretch: 1,
            stretchAngle: 0,
            trail: [],
          });
        }
      }
      dotsRef.current = dots;
    };

    const draw = () => {
      const settings =
        settingsRef.current ?? getSettings(prefersDark.matches);
      const { radius, color, schwartzschildRadius } = settings;
      const currentCtx = ctxRef.current;
      if (!currentCtx) {
        return;
      }
      const center = centerRef.current;

      const { width, height } = sizeRef.current;
      currentCtx.clearRect(0, 0, width, height);

      for (const dot of dotsRef.current) {
        if (dot.captured) continue;

        const dx = dot.x - center.x;
        const dy = dot.y - center.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Draw trail for fast-moving dots near center
        if (dot.trail.length > 1 && dist < 150) {
          for (let i = 0; i < dot.trail.length - 1; i++) {
            const t = dot.trail[i];
            const trailAlpha = t.alpha * (i / dot.trail.length) * 0.5;
            currentCtx.fillStyle = `rgba(${color}, ${trailAlpha})`;
            currentCtx.beginPath();
            const trailRadius = radius * 0.6 * (i / dot.trail.length);
            currentCtx.arc(t.x, t.y, trailRadius, 0, Math.PI * 2);
            currentCtx.fill();
          }
        }

        // Spaghettification: stretch dots as they approach
        const stretchFactor = dot.stretch;
        if (stretchFactor > 1.2 && dist < schwartzschildRadius * 3) {
          // Draw elongated ellipse toward center
          currentCtx.save();
          currentCtx.translate(dot.x, dot.y);
          currentCtx.rotate(dot.stretchAngle);
          currentCtx.scale(stretchFactor, 1 / Math.sqrt(stretchFactor));
          currentCtx.fillStyle = `rgba(${color}, ${dot.alpha})`;
          currentCtx.beginPath();
          currentCtx.arc(0, 0, radius, 0, Math.PI * 2);
          currentCtx.fill();
          currentCtx.restore();
        } else {
          // Normal circular dot
          currentCtx.fillStyle = `rgba(${color}, ${dot.alpha})`;
          currentCtx.beginPath();
          currentCtx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
          currentCtx.fill();
        }
      }
    };

    const tick = () => {
      const settings =
        settingsRef.current ?? getSettings(prefersDark.matches);
      const {
        flickerRate,
        minAlpha,
        maxAlpha,
        centralMass,
        eventHorizon,
        schwartzschildRadius,
        accretionStart,
        dragCoefficient,
        tidalStrength,
        trailLength,
        orbitCouplingBase,
        orbitCouplingBoost,
        subCircularFactor,
        farOrbitFactor,
        timeScale,
      } = settings;
      const dots = dotsRef.current;
      const center = centerRef.current;

      // Flicker random dots (only those far from center)
      const count = Math.max(1, Math.floor(dots.length * flickerRate));
      for (let i = 0; i < count; i += 1) {
        const index = Math.floor(Math.random() * dots.length);
        const dot = dots[index];
        if (!dot.captured) {
          const dx = dot.x - center.x;
          const dy = dot.y - center.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          // Only flicker dots outside accretion zone
          if (dist > accretionStart) {
            dot.alpha = minAlpha + Math.random() * (maxAlpha - minAlpha);
          }
        }
      }

      for (const dot of dots) {
        if (dot.captured) continue;

        const dx = center.x - dot.x;
        const dy = center.y - dot.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);

        // Event horizon capture
        if (dist < eventHorizon) {
          dot.captured = true;
          dot.alpha = 0;
          continue;
        }

        // Store trail for motion blur effect
        if (dist < 150) {
          dot.trail.push({ x: dot.x, y: dot.y, alpha: dot.alpha });
          if (dot.trail.length > trailLength) {
            dot.trail.shift();
          }
        }

        // Newtonian gravity: F = G * M * m / r^2
        // a = F/m = G * M / r^2
        const gravitationalAccel = centralMass / (distSq + 1000);

        // Unit vector toward center
        const ux = dx / dist;
        const uy = dy / dist;

        // Tangential unit vector (perpendicular, for orbital motion)
        const tx = -uy;
        const ty = ux;

        // Current tangential velocity component
        const currentTangentialVel = dot.vx * tx + dot.vy * ty;

        const proximityFactor = Math.max(0, 1 - dist / accretionStart);

        // Target a *sub-circular* orbit.
        // Circular orbit satisfies v^2 / r = a  ->  v = sqrt(a * r).
        // Slightly under-shooting vCircular makes the path spiral inward.
        const vCircular = Math.sqrt(gravitationalAccel * Math.max(dist, 1));
        const orbitFactor =
          farOrbitFactor + (1 - farOrbitFactor) * proximityFactor;
        const desiredTangentialVel =
          dot.spin * vCircular * dot.orbitBias * orbitFactor * subCircularFactor;

        // Pull the tangential component toward the desired orbit.
        // This makes the dots *visibly orbit* while still being sucked in.
        const orbitCoupling =
          orbitCouplingBase + orbitCouplingBoost * proximityFactor;
        const tangentialImpulse =
          (desiredTangentialVel - currentTangentialVel) * orbitCoupling;

        // Apply radial gravity first, then nudge tangential velocity.
        const step = timeScale;
        dot.vx += ((ux * gravitationalAccel) / dot.mass) * step;
        dot.vy += ((uy * gravitationalAccel) / dot.mass) * step;
        dot.vx += ((tx * tangentialImpulse) / dot.mass) * step;
        dot.vy += ((ty * tangentialImpulse) / dot.mass) * step;

        // Tidal forces: stretch the dot as it approaches
        // Tidal acceleration ~ 2 * G * M * r / R^3
        if (dist < schwartzschildRadius * 4) {
          const tidalForce = tidalStrength * centralMass / (dist * dist * dist);
          dot.stretch = 1 + tidalForce * 0.00001;
          dot.stretch = Math.min(dot.stretch, 4); // Cap stretching
          dot.stretchAngle = Math.atan2(dy, dx);
        } else {
          dot.stretch = 1;
        }

        // Increase alpha and glow as dots enter accretion disk
        if (dist < accretionStart) {
          const glowFactor = 1 - dist / accretionStart;
          const targetAlpha = maxAlpha + glowFactor * maxAlpha * 4;
          dot.alpha += (targetAlpha - dot.alpha) * 0.02;
          dot.alpha = Math.min(dot.alpha, maxAlpha * 5);
        }

        // Very close to horizon: intense brightening then fade
        if (dist < schwartzschildRadius) {
          const fadeZone = dist / schwartzschildRadius;
          if (fadeZone < 0.5) {
            // Start fading as it approaches capture
            dot.alpha *= 0.95;
          }
        }

        // Apply light drag
        const localDrag =
          dragCoefficient -
          proximityFactor * Math.min(0.004, (1 - dragCoefficient) * 60);
        // Apply drag in a step-invariant way so slowing time doesn't change feel.
        const steppedDrag = Math.pow(localDrag, step);
        dot.vx *= steppedDrag;
        dot.vy *= steppedDrag;

        // Update position
        dot.x += dot.vx * step;
        dot.y += dot.vy * step;

        // Preserve angular momentum (key for spiral motion)
        // L = m * v_tangential * r stays mostly constant
        const newTangentialVel = dot.vx * tx + dot.vy * ty;
        dot.angularMomentum = newTangentialVel * dist * dot.mass;
      }

      draw();
    };

    const animate = () => {
      if (prefersReducedMotion.matches) {
        draw();
        return;
      }
      tick();
      animationRef.current = requestAnimationFrame(animate);
    };

    const startAnimation = () => {
      if (document.hidden) {
        return;
      }
      if (animationRef.current || prefersReducedMotion.matches) {
        return;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    const stopAnimation = () => {
      if (!animationRef.current) {
        return;
      }
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    };

    const handleResize = () => {
      scheduleResizeAndDraw();
    };

    const handlePreferenceChange = () => {
      updateSettings();
      scheduleResizeAndDraw();
      if (prefersReducedMotion.matches) {
        stopAnimation();
        return;
      }
      if (!document.hidden) {
        startAnimation();
      }
    };

    const addMediaListener = (
      query: MediaQueryList,
      handler: () => void
    ) => {
      if (query.addEventListener) {
        query.addEventListener("change", handler);
      } else {
        query.addListener(handler);
      }
    };

    const removeMediaListener = (
      query: MediaQueryList,
      handler: () => void
    ) => {
      if (query.removeEventListener) {
        query.removeEventListener("change", handler);
      } else {
        query.removeListener(handler);
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stopAnimation();
        return;
      }
      if (!prefersReducedMotion.matches) {
        startAnimation();
      }
    };

    updateSettings();
    resize();
    draw();
    startAnimation();

    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibility);
    addMediaListener(prefersDark, handlePreferenceChange);
    addMediaListener(prefersReducedMotion, handlePreferenceChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
      removeMediaListener(prefersDark, handlePreferenceChange);
      removeMediaListener(prefersReducedMotion, handlePreferenceChange);
      if (resizeRaf !== null) {
        cancelAnimationFrame(resizeRaf);
        resizeRaf = null;
      }
      stopAnimation();
    };
  }, []);

  return (
    <canvas
      aria-hidden="true"
      ref={canvasRef}
      className="home-dot-canvas pointer-events-none"
    />
  );
});