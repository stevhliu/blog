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

/**
 * Whether a model that has just loaded is ready to be shown. The first
 * frames a model is drawn in are slow ones (shaders compile, textures go
 * to the GPU, the shadow is drawn), so the model turns out of sight until
 * they are behind it. `frames` is how long each frame since it loaded
 * took, in milliseconds, oldest first; a smooth frame at 60Hz is 16.7.
 */
function readyToShow(frames: number[]): boolean {
  // Settled is four frames in a row under 34ms: that is two 60Hz frames,
  // so one dropped frame still fails, while a machine drawing a steady
  // 30 frames a second passes. The stalls come in a burst of two or three
  // frames, so four smooth ones means the burst is over.
  const settled = frames.length >= 4 && frames.slice(-4).every((ms) => ms < 34);
  // A machine that never draws that fast still gets its model, a second
  // after it loaded.
  const waited = frames.reduce((sum, ms) => sum + ms, 0);
  return settled || waited > 1000;
}

export type SkyLitModelProps = {
  /** The GLB. */
  src: string;
  /** An image of the composed view. It holds the space until the model
   * is ready and fades out as the model fades in; without WebGL it stays. */
  poster?: string;
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

  // The sky, redrawn every few minutes, as the model's environment. The
  // model isn't given its source until the first sky is drawn, so it is
  // never lit by a stand-in environment first: that would be a second
  // environment map to build and a change of light a moment after it
  // appears.
  const [sky, setSky] = useState<string>();
  useEffect(() => {
    let cancelled = false;
    const draw = () =>
      skyEnvironment(skyContext().at ?? new Date()).then(({ url }) => {
        if (!cancelled) setSky(url);
      });
    draw();
    const timer = window.setInterval(draw, SKY_REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  // The exposure follows the page's light whenever the page is re-lit. As
  // an attribute, so it holds whether or not model-viewer has upgraded the
  // element yet.
  useEffect(() => {
    const element = viewer.current;
    if (!element) return;
    const expose = (event: Event) => {
      const light = (event as CustomEvent<PageLight>).detail;
      element.setAttribute("exposure", exposureFor(light.adapted).toFixed(3));
    };
    const adapted = Number(getComputedStyle(document.documentElement).getPropertyValue("--sky-adapted"));
    if (!isNaN(adapted)) element.setAttribute("exposure", exposureFor(adapted).toFixed(3));
    document.addEventListener("sky-light", expose);
    return () => document.removeEventListener("sky-light", expose);
  }, []);

  // Ready: the model has loaded and the sky is lighting it. Plain
  // listeners, because React doesn't attach events to a custom element.
  // If the environment never reports (it failed to load), the model is
  // shown without it after a moment rather than not at all.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const element = viewer.current;
    if (!element) return;
    let loaded = false;
    let lit = false;
    let giveUp: number | undefined;
    const check = () => {
      if (loaded && lit) setReady(true);
    };
    const onLoad = () => {
      sharpenTextures(element);
      loaded = true;
      giveUp = window.setTimeout(onLit, 1500);
      check();
    };
    const onLit = () => {
      lit = true;
      check();
    };
    element.addEventListener("load", onLoad);
    element.addEventListener("environment-change", onLit);
    return () => {
      element.removeEventListener("load", onLoad);
      element.removeEventListener("environment-change", onLit);
      window.clearTimeout(giveUp);
    };
  }, []);

  // Shown: once ready, the model is drawn (and turns) out of sight until
  // its frames have settled, then fades in.
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!ready || shown) return;
    const frames: number[] = [];
    let last = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      frames.push(now - last);
      last = now;
      if (readyToShow(frames)) setShown(true);
      else frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [ready, shown]);

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
    <div className={`sky-lit-model ${className ?? ""}`} data-shown={shown ? "" : undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {poster && <img src={poster} alt="" aria-hidden="true" />}
      <model-viewer
        ref={viewer}
        src={sky ? src : undefined}
        alt={alt}
        camera-controls=""
        disable-zoom={focused ? undefined : ""}
        touch-action="pan-y"
        onFocus={() => setFocused(true)}
        onBlur={blur}
        interaction-prompt="none"
        interpolation-decay="20"
        auto-rotate={turning && ready ? "" : undefined}
        auto-rotate-delay="0"
        rotation-per-second="6deg"
        camera-orbit={cameraOrbit}
        min-camera-orbit={`-Infinity ${minPitch}deg ${distance}`}
        max-camera-orbit={`Infinity ${maxPitch}deg ${distance}`}
        field-of-view={`${fieldOfView}deg`}
        min-field-of-view={`${closestFieldOfView}deg`}
        max-field-of-view={`${fieldOfView}deg`}
        environment-image={sky}
        exposure="1"
        tone-mapping="neutral"
        shadow-intensity="0.6"
        shadow-softness="1"
      />
    </div>
  );
}
