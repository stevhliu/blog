"use client";

import { useEffect, useRef, useState } from "react";

import { skyEnvironment } from "../sky";
import { skyContext, type PageLight } from "../sky-lighting";

// The sky is redrawn this often. The sun moves a quarter of a degree a
// minute, so five minutes is just over a degree: under what a model's
// surface shows.
const SKY_REFRESH_MS = 5 * 60_000;

/**
 * Exposure for a model under the page's light, from how bright the page
 * is (0 night to 1 day, from sky-lighting.ts). Exposure scales a model's
 * emissive share too, so it can't be used to lift a night scene much; a
 * fifth less at night lets a model sit in the dark page rather than
 * glow in front of it, and the day keeps the exposure a model's
 * material was calibrated at.
 */
function exposureFor(adapted: number): number {
  return 0.8 + 0.2 * adapted;
}

/**
 * model-viewer gives every texture an anisotropy of 4. GPUs allow 16, which
 * keeps print legible as a surface turns toward edge-on, but it isn't
 * exposed, so this finds the three.js scene the element keeps under a
 * symbol key and sets it on every texture. Guarded: if model-viewer's
 * internals change, the model just stays at 4.
 */
function sharpenTextures(viewer: HTMLElement) {
  type Textured = { isScene?: boolean; traverse?: (fn: (o: Textured) => void) => void; material?: { map?: { anisotropy: number; needsUpdate: boolean } } };
  const scene = Object.getOwnPropertySymbols(viewer)
    .map((key) => (viewer as unknown as Record<symbol, Textured>)[key])
    .find((value) => value?.isScene);
  scene?.traverse?.((object) => {
    const texture = object.material?.map;
    if (texture) {
      texture.anisotropy = 16;
      texture.needsUpdate = true;
    }
  });
}

export type SkyLitModelProps = {
  /** The GLB. */
  src: string;
  /** Shown until the model loads, and in place of it without WebGL. */
  poster: string;
  alt: string;
  /** model-viewer's camera-orbit for the composed view. The distance is
   * held, so zoom narrows the field of view; check it fits a new model
   * at every reachable angle. */
  cameraOrbit: string;
  /** Pitch limits, degrees. */
  minPitch?: number;
  maxPitch?: number;
  /** The composed view's field of view and the closest the reader can
   * zoom to. 25° and 5° show a model five times larger at full zoom. */
  fieldOfView?: number;
  closestFieldOfView?: number;
  className?: string;
};

/**
 * Any GLB, lit by the sky over Sebastopol right now: the sky is
 * ray-marched into an environment map (sky.ts), and the exposure follows
 * the page's own light, so a model and the page it sits on never disagree
 * about how dark it is. The viewer orbits around the vertical axis only,
 * with zoom off until the reader clicks (model-viewer takes every wheel
 * event over it, and a reader scrolling past would find the page stop
 * and the model grow); once focused, the wheel or a pinch zooms, a
 * right-, shift- or two-finger drag pans, and clicking away restores the
 * composed view. It turns slowly on its own, pausing while dragged, and
 * stays still for readers who ask for reduced motion.
 */
export function SkyLitModel({
  src,
  poster,
  alt,
  cameraOrbit,
  minPitch = 78,
  maxPitch = 90,
  fieldOfView = 25,
  closestFieldOfView = 5,
  className,
}: SkyLitModelProps) {
  // model-viewer (and the three.js it carries) registers itself on import.
  // Loading it here keeps it out of the server render and out of every page
  // that doesn't show a model.
  useEffect(() => {
    import("@google/model-viewer");
  }, []);

  const viewer = useRef<HTMLElement & { fieldOfView: string; cameraTarget: string }>(null);

  // A plain listener: React doesn't attach onLoad to a custom element.
  useEffect(() => {
    const element = viewer.current;
    if (!element) return;
    const sharpen = () => sharpenTextures(element);
    element.addEventListener("load", sharpen);
    return () => element.removeEventListener("load", sharpen);
  }, []);

  // The sky, redrawn every few minutes, as the model's environment; the
  // exposure follows the page's light whenever the page is re-lit. Both
  // as attributes, so they hold whether or not model-viewer has upgraded
  // the element yet. The first draw waits for an idle moment: it takes
  // about 200ms of main thread.
  useEffect(() => {
    const element = viewer.current;
    if (!element) return;
    const sky = () => {
      const context = skyContext();
      element.setAttribute("environment-image", skyEnvironment(context.at ?? new Date(), context.clouds).url);
    };
    const expose = (event: Event) => {
      const light = (event as CustomEvent<PageLight>).detail;
      element.setAttribute("exposure", exposureFor(light.adapted).toFixed(3));
    };
    const adapted = Number(getComputedStyle(document.documentElement).getPropertyValue("--sky-adapted"));
    if (!isNaN(adapted)) element.setAttribute("exposure", exposureFor(adapted).toFixed(3));
    document.addEventListener("sky-light", expose);
    const idle = window.requestIdleCallback?.(sky) ?? window.setTimeout(sky, 0);
    const timer = window.setInterval(sky, SKY_REFRESH_MS);
    return () => {
      document.removeEventListener("sky-light", expose);
      (window.cancelIdleCallback ?? window.clearTimeout)(idle);
      window.clearInterval(timer);
    };
  }, []);

  const [focused, setFocused] = useState(false);
  const blur = () => {
    setFocused(false);
    if (viewer.current) {
      viewer.current.fieldOfView = `${fieldOfView}deg`;
      viewer.current.cameraTarget = "auto";
    }
  };

  // Starts false so the server render and the reduced-motion case agree.
  const [turning, setTurning] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setTurning(!reduce.matches);
    update();
    reduce.addEventListener("change", update);
    return () => reduce.removeEventListener("change", update);
  }, []);

  const distance = cameraOrbit.trim().split(/\s+/)[2] ?? "auto";
  return (
    <model-viewer
      ref={viewer}
      src={src}
      poster={poster}
      alt={alt}
      camera-controls=""
      disable-zoom={focused ? undefined : ""}
      touch-action="pan-y"
      onFocus={() => setFocused(true)}
      onBlur={blur}
      interaction-prompt="none"
      interpolation-decay="20"
      auto-rotate={turning ? "" : undefined}
      auto-rotate-delay="0"
      rotation-per-second="6deg"
      camera-orbit={cameraOrbit}
      min-camera-orbit={`-Infinity ${minPitch}deg ${distance}`}
      max-camera-orbit={`Infinity ${maxPitch}deg ${distance}`}
      field-of-view={`${fieldOfView}deg`}
      min-field-of-view={`${closestFieldOfView}deg`}
      max-field-of-view={`${fieldOfView}deg`}
      environment-image="neutral"
      exposure="1"
      tone-mapping="neutral"
      shadow-intensity="0.6"
      shadow-softness="1"
      class={className}
    />
  );
}
