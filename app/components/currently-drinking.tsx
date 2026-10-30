import { SkyLitModel } from "./sky-lit-model";

/**
 * "What's brewing?" for the home page: the coffee as a 3D model the reader
 * can turn by dragging, lit by the sky (SkyLitModel). To change the coffee,
 * build a new model with tools/miniature, drop its GLB and poster in
 * public/, and update the four values below.
 *
 * The camera distance and field of view are fixed rather than auto: auto
 * frames a sphere round the model, leaving it about half the box. For the
 * Ciao pouch, 2.45m with a 25° view is the closest distance at which no
 * reachable angle (the diagonal views need the most room) comes within 5%
 * of the edge. A new model has new proportions: re-check the distance.
 */
const MODEL = "/models/ciao.glb";
const POSTER = "/images/ciao-poster.webp";
const ALT = "A silver flat-bottom pouch of BIGFACE Ciao coffee. Drag to turn it; click it, then scroll to zoom in on the print.";
const CAMERA_ORBIT = "-28deg 80deg 2.45m";

export function CurrentlyDrinking() {
  return (
    <section
      aria-labelledby="drinking-heading"
      className="mt-14 flex flex-col gap-5 min-[1120px]:absolute min-[1120px]:right-0 min-[1120px]:top-0 min-[1120px]:mt-0 min-[1120px]:w-[300px]"
    >
      <div className="flex w-[300px] max-w-full flex-col gap-4">
        <SkyLitModel src={MODEL} poster={POSTER} alt={ALT} cameraOrbit={CAMERA_ORBIT} className="drink-model" />
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
