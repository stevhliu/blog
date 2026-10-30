"use client";

import { useEffect, useRef, useState } from "react";

// Built by tools/miniature with the flat-bottom pouch template: Bigface's
// studio photo for the film and lighting, reprinted with the print from
// photos of the Ciao bag itself (tools/miniature/reprint_ciao.py). The
// viewer settings below are the ones the pipeline calibrated the material
// against; change them together.
const MODEL = "/models/ciao.glb";
// Shown until the model loads, and in place of it without WebGL.
const POSTER = "/images/ciao-poster.webp";
// The composed view, and how far the reader can zoom into it. The zoom
// narrows the field of view with the distance held, so 5° shows the pouch
// five times larger than 25°: the small print at about 60px tall on a 2x
// screen, where the 4096px texture still has two texels a pixel.
const FIELD_OF_VIEW = "25deg";
const CLOSEST_FIELD_OF_VIEW = "5deg";

/**
 * model-viewer gives every texture an anisotropy of 4. GPUs allow 16, which
 * keeps the print legible as the front turns toward edge-on, but it isn't
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
 * "What's brewing?" for the home page: the coffee pouch as a 3D model the
 * reader can turn by dragging.
 *
 * The camera follows the pengzhe.ng buildings: it orbits around the vertical
 * axis only, kept between 78° and 90° of pitch, with zoom and pan off.
 * The distance and field of view are fixed rather than auto: auto frames a
 * sphere round the pouch, leaving it about half the box. 2.45m with a 25°
 * view is the closest distance at which no reachable angle (the diagonal
 * views need the most room) comes within 5% of the edge. Looking down from
 * higher shows the top seal but adds the base's depth to the height, so it
 * needs more distance: 70° pitch costs about 9% of the pouch's size. Size
 * won. A new model has new proportions: re-check the distance.
 * touch-action pan-y leaves vertical swipes to the page, so phones can still
 * scroll past it.
 *
 * Zoom is for reading the print. It's off until the reader clicks the
 * pouch, because model-viewer takes every wheel event over it, and a reader
 * scrolling past the home page would find the page stop and the pouch grow
 * instead. Once the pouch has focus, the wheel (or a pinch) zooms and a
 * right-, shift- or two-finger drag pans to the corner they want to read.
 * Clicking away puts the composed view back, so the page never shows a
 * pouch left zoomed onto one word.
 *
 * The pouch turns slowly on its own (one turn a minute) so it reads as
 * something that moves. model-viewer pauses the turn while it is dragged and
 * picks it up again as soon as it's released. It stays still for readers who ask for
 * reduced motion; model-viewer doesn't check that itself.
 */
export function CurrentlyDrinking() {
  // model-viewer (and the three.js it carries) registers itself on import.
  // Loading it here keeps it out of the server render and out of every page
  // that doesn't show the pouch.
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
  const [focused, setFocused] = useState(false);
  const blur = () => {
    setFocused(false);
    if (viewer.current) {
      viewer.current.fieldOfView = FIELD_OF_VIEW;
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

  return (
    <section
      aria-labelledby="drinking-heading"
      className="mt-14 flex flex-col gap-5 min-[1120px]:absolute min-[1120px]:right-0 min-[1120px]:top-0 min-[1120px]:mt-0 min-[1120px]:w-[300px]"
    >
      <div className="flex w-[300px] max-w-full flex-col gap-4">
        <model-viewer
          ref={viewer}
          src={MODEL}
          poster={POSTER}
          alt="A silver flat-bottom pouch of BIGFACE Ciao coffee. Drag to turn it; click it, then scroll to zoom in on the print."
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
          camera-orbit="-28deg 80deg 2.45m"
          min-camera-orbit="-Infinity 78deg 2.45m"
          max-camera-orbit="Infinity 90deg 2.45m"
          field-of-view={FIELD_OF_VIEW}
          min-field-of-view={CLOSEST_FIELD_OF_VIEW}
          max-field-of-view={FIELD_OF_VIEW}
          environment-image="neutral"
          exposure="1"
          tone-mapping="neutral"
          shadow-intensity="0.6"
          shadow-softness="1"
          class="drink-model"
        />
        <div className="text-center text-[18px] leading-[1.5] text-[var(--color-text)]">
          <h2 id="drinking-heading" className="m-0 inline text-[18px] font-normal opacity-70">
            What&rsquo;s brewing?
          </h2>{" "}
          <a
            href="https://www.bigfacebrand.com/collections/coffee"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link no-underline text-inherit"
          >
            BIGFACE Ciao
          </a>
        </div>
      </div>
    </section>
  );
}
