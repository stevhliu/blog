"use client";

import { useEffect, useRef } from "react";

type Dot = {
  x: number;
  y: number;
  alpha: number;
};

export function HomeDotPattern() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const intervalRef = useRef<number | null>(null);
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

    const getSettings = () => {
      const dark = prefersDark.matches;
      return {
        spacing: 14,
        radius: 2.4,
        minAlpha: dark ? 0.008 : 0.012,
        maxAlpha: dark ? 0.055 : 0.07,
        color: dark ? "255, 255, 255" : "0, 0, 0",
        flickerRate: 0.06,
      };
    };

    const resize = () => {
      const { spacing, minAlpha, maxAlpha } = getSettings();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const dots: Dot[] = [];
      for (let y = 0; y <= height; y += spacing) {
        for (let x = 0; x <= width; x += spacing) {
          dots.push({
            x,
            y,
            alpha: minAlpha + Math.random() * (maxAlpha - minAlpha),
          });
        }
      }
      dotsRef.current = dots;
    };

    const draw = () => {
      const { radius, color } = getSettings();
      const currentCtx = ctxRef.current;
      if (!currentCtx) {
        return;
      }
      currentCtx.clearRect(0, 0, canvas.width, canvas.height);
      for (const dot of dotsRef.current) {
        currentCtx.fillStyle = `rgba(${color}, ${dot.alpha})`;
        currentCtx.beginPath();
        currentCtx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        currentCtx.fill();
      }
    };

    const tick = () => {
      const { flickerRate, minAlpha, maxAlpha } = getSettings();
      const dots = dotsRef.current;
      const count = Math.max(1, Math.floor(dots.length * flickerRate));
      for (let i = 0; i < count; i += 1) {
        const index = Math.floor(Math.random() * dots.length);
        dots[index].alpha = minAlpha + Math.random() * (maxAlpha - minAlpha);
      }
      draw();
    };

    const startFlicker = () => {
      if (intervalRef.current || prefersReducedMotion.matches) {
        return;
      }
      intervalRef.current = window.setInterval(tick, 140);
    };

    const stopFlicker = () => {
      if (!intervalRef.current) {
        return;
      }
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };

    const handleResize = () => {
      resize();
      draw();
    };

    const handlePreferenceChange = () => {
      handleResize();
      if (prefersReducedMotion.matches) {
        stopFlicker();
        return;
      }
      if (!document.hidden) {
        startFlicker();
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
        stopFlicker();
        return;
      }
      if (!prefersReducedMotion.matches) {
        startFlicker();
      }
    };

    resize();
    draw();
    startFlicker();

    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibility);
    addMediaListener(prefersDark, handlePreferenceChange);
    addMediaListener(prefersReducedMotion, handlePreferenceChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
      removeMediaListener(prefersDark, handlePreferenceChange);
      removeMediaListener(prefersReducedMotion, handlePreferenceChange);
      stopFlicker();
    };
  }, []);

  return (
    <canvas
      aria-hidden="true"
      ref={canvasRef}
      className="home-dot-canvas pointer-events-none"
    />
  );
}
