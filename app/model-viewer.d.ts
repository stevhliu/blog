// JSX typing for Google's <model-viewer> custom element, which ships DOM
// types but not React ones. Attributes are passed through as strings, the
// way the element reads them; see https://modelviewer.dev/docs.
import type { DetailedHTMLProps, HTMLAttributes } from "react";

type ModelViewerAttributes = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  src?: string;
  poster?: string;
  alt?: string;
  class?: string;
  loading?: "auto" | "lazy" | "eager";
  "camera-controls"?: string;
  "disable-zoom"?: string;
  "disable-pan"?: string;
  "touch-action"?: string;
  "interaction-prompt"?: string;
  "interpolation-decay"?: string;
  "auto-rotate"?: string;
  "auto-rotate-delay"?: string;
  "rotation-per-second"?: string;
  "camera-orbit"?: string;
  "min-camera-orbit"?: string;
  "max-camera-orbit"?: string;
  "field-of-view"?: string;
  "min-field-of-view"?: string;
  "max-field-of-view"?: string;
  "environment-image"?: string;
  exposure?: string;
  "tone-mapping"?: string;
  "shadow-intensity"?: string;
  "shadow-softness"?: string;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerAttributes;
    }
  }
}
