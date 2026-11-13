"use client";

import { useEffect, useState } from "react";

import { SkyLitModel } from "./sky-lit-model";

export type Book = {
  title: string;
  author: string;
  /** Cover image, front only. Without one, a plain cover is drawn from the
   * title and author in `color`. */
  cover?: string;
  /** Spine image, head at the top (rotate a photo of a spine lying on its
   * side so the title reads downward). Without one, the spine is lettered
   * from the title and author. */
  spine?: string;
  /** Back cover image. Without one, the back is plain `color`. */
  back?: string;
  /** Trim size in millimetres, as the publisher lists it. Only the ratios
   * matter: the book is scaled to 1m tall, so the camera distance below
   * holds for any book. */
  width: number;
  height: number;
  thickness: number;
  /** Cover and spine colour, CSS. */
  color: string;
  /** Lettering colour, CSS. */
  ink?: string;
};

/**
 * The composed view, as for the coffee pouch: the camera a little left of
 * front (so the spine shows) and a little above. The tallest the book is
 * drawn is when it turns edge-on: its near edge is then half a width
 * (about 0.3m) closer than its centre, and perspective makes it that much
 * larger. At 25° and 2.6m that fills 99.6% of the box's height, so the
 * bottom clips; 2.95m keeps every angle and tilt at least 5% clear, as for
 * the pouch (measured every 15° at 78°, 80° and 90° of tilt). A different
 * book (a taller or wider one) needs this checked.
 */
const CAMERA_ORBIT = "-28deg 80deg 2.95m";

function coverCanvas(book: Book, px: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = px;
  canvas.height = Math.round((px * book.height) / book.width);
  const g = canvas.getContext("2d")!;
  g.fillStyle = book.color;
  g.fillRect(0, 0, canvas.width, canvas.height);
  g.fillStyle = book.ink ?? "#f4efe4";
  g.textBaseline = "top";
  const margin = px * 0.1;
  g.font = `${px * 0.085}px Georgia, serif`;
  wrap(g, book.title, margin, margin, canvas.width - 2 * margin, px * 0.1);
  g.font = `${px * 0.05}px Georgia, serif`;
  g.fillText(book.author, margin, canvas.height - margin - px * 0.05);
  return canvas;
}

function wrap(g: CanvasRenderingContext2D, text: string, x: number, y: number, width: number, lineHeight: number) {
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (g.measureText(next).width > width && line) {
      g.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else {
      line = next;
    }
  }
  g.fillText(line, x, y);
}

/** The spine, lettered top to bottom as English books are. */
function spineCanvas(book: Book, length: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(8, Math.round((length * book.thickness) / book.height));
  canvas.height = length;
  const g = canvas.getContext("2d")!;
  g.fillStyle = book.color;
  g.fillRect(0, 0, canvas.width, canvas.height);
  g.save();
  g.translate(canvas.width / 2, 0);
  g.rotate(Math.PI / 2);
  g.fillStyle = book.ink ?? "#f4efe4";
  g.textBaseline = "middle";
  // The title from the head and the author to the tail, each held to its
  // own share of the length so a long title or a thick book can't run one
  // into the other.
  g.font = `${canvas.width * 0.36}px Georgia, serif`;
  g.fillText(book.title, canvas.height * 0.06, 0, canvas.height * 0.56);
  g.textAlign = "right";
  g.font = `${canvas.width * 0.26}px Georgia, serif`;
  g.fillText(book.author, canvas.height * 0.94, 0, canvas.height * 0.26);
  g.restore();
  return canvas;
}

/**
 * Page edges: the newsprint-ish stock of a mass-market paperback, with a
 * faint line where each few leaves meet, and the cover's card showing as a
 * hairline at either side. The leaves are parallel to the cover, so the
 * lines run across the thickness: along the canvas's `across` axis, spaced
 * along the other. Which axis is the thickness depends on the face (the
 * fore-edge's thickness runs along u, the head and tail's along v).
 */
function pagesCanvas(book: Book, thicknessAlong: "u" | "v"): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const long = 512;
  const short = 128;
  canvas.width = thicknessAlong === "u" ? long : short;
  canvas.height = thicknessAlong === "u" ? short : long;
  const g = canvas.getContext("2d")!;
  g.fillStyle = "#ece3cf";
  g.fillRect(0, 0, canvas.width, canvas.height);
  const leaf = (at: number, size: number, style: string) => {
    g.fillStyle = style;
    if (thicknessAlong === "u") g.fillRect(at, 0, size, canvas.height);
    else g.fillRect(0, at, canvas.width, size);
  };
  for (let at = 0; at < long; at += 2) leaf(at, 1, `rgba(110, 90, 60, ${0.04 + Math.random() * 0.08})`);
  // The cover card, about 0.3mm of a book's thickness, at least a pixel.
  const card = Math.max(2, Math.round((long * 0.3) / book.thickness));
  leaf(0, card, book.color);
  leaf(long - card, card, book.color);
  return canvas;
}

/** An image cropped to a face's proportions (width over height), like CSS
 * object-fit: cover, so a cover scanned at another trim size (a trade
 * edition's art on a mass-market book), or a photo cropped a little loose,
 * is trimmed at the edges rather than squeezed. */
function fit(image: CanvasImageSource & { width: number; height: number }, aspect: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.height = Math.min(image.height, 2048);
  canvas.width = Math.round(canvas.height * aspect);
  const sw = Math.min(image.width, image.height * aspect);
  const sh = sw / aspect;
  canvas
    .getContext("2d")!
    .drawImage(image, (image.width - sw) / 2, (image.height - sh) / 2, sw, sh, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/**
 * The book as a GLB, built in the browser: a three.js box exported with
 * GLTFExporter, returned as a blob URL. A mass-market paperback is trimmed
 * after binding, so the cover is flush with the pages on three sides and
 * the whole book really is one block; it is one rounded box, with the cover
 * on the front, the spine on the left, and the page edges on the rest. The
 * rounding, about 1.5mm, is what a paperback's soft card does at the spine
 * and the corners. One box also means no two faces share a plane: separate
 * parts touching face to face z-fight, and the depth test picks a
 * different winner from frame to frame as the book turns, which reads as
 * flicker. Building it here rather than shipping a file means changing the
 * book is a change to the values in currently-reading.tsx and nothing else.
 */
async function buildBook(book: Book): Promise<string> {
  const [THREE, { GLTFExporter }, { RoundedBoxGeometry }] = await Promise.all([
    import("three"),
    import("three/addons/exporters/GLTFExporter.js"),
    import("three/addons/geometries/RoundedBoxGeometry.js"),
  ]);

  const texture = (source: HTMLCanvasElement) => {
    const t = new THREE.CanvasTexture(source);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  // Each printed face is its image, fitted to the face, or the drawn
  // stand-in if there is no image or it fails to load.
  const face = async (src: string | undefined, aspect: number, fallback: () => HTMLCanvasElement) => {
    if (src) {
      try {
        return fit(await new THREE.ImageLoader().loadAsync(src), aspect);
      } catch {
        // Fall through to the stand-in.
      }
    }
    return fallback();
  };
  const plainBack = () => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 4;
    const g = canvas.getContext("2d")!;
    g.fillStyle = book.color;
    g.fillRect(0, 0, 4, 4);
    return canvas;
  };
  const [coverSource, spineSource, backSource] = await Promise.all([
    face(book.cover, book.width / book.height, () => coverCanvas(book, 1024)),
    face(book.spine, book.thickness / book.height, () => spineCanvas(book, 1024)),
    face(book.back, book.width / book.height, plainBack),
  ]);

  // A paperback's cover is laminated card, a little glossier than the
  // uncoated pages.
  const gloss = 0.4;
  const front = new THREE.MeshStandardMaterial({ map: texture(coverSource), roughness: gloss });
  const back = new THREE.MeshStandardMaterial({ map: texture(backSource), roughness: gloss });
  const spine = new THREE.MeshStandardMaterial({ map: texture(spineSource), roughness: gloss });
  const foreEdge = new THREE.MeshStandardMaterial({ map: texture(pagesCanvas(book, "u")), roughness: 0.9 });
  const headTail = new THREE.MeshStandardMaterial({ map: texture(pagesCanvas(book, "v")), roughness: 0.9 });
  const materials = [foreEdge, spine, headTail, headTail, front, back];

  // World units: the book is 1 tall. Box faces: +x, -x, +y, -y, +z, -z.
  // model-viewer's front camera sits on +z, so the cover faces +z and the
  // spine, on the cover's left as seen from the front, is at -x.
  const w = book.width / book.height;
  const d = book.thickness / book.height;
  const radius = 1.5 / book.height;
  const geometry = new RoundedBoxGeometry(w, 1, d, 4, radius);
  const mesh = new THREE.Mesh(geometry, materials);

  const glb = (await new GLTFExporter().parseAsync(mesh, { binary: true })) as ArrayBuffer;

  geometry.dispose();
  for (const m of [front, back, spine, foreEdge, headTail]) {
    m.map?.dispose();
    m.dispose();
  }
  return URL.createObjectURL(new Blob([glb], { type: "model/gltf-binary" }));
}

/**
 * A book that turns like the coffee pouch above it, because it is the same
 * viewer: SkyLitModel, lit by the sky over Sebastopol, dragged to turn,
 * turning slowly on its own, and zoomed after a click. Until the GLB is
 * built (three.js loads on demand), an empty box of the same size holds the
 * space so nothing below it moves.
 */
export function Book3D({ book, alt, className }: { book: Book; alt: string; className?: string }) {
  const [src, setSrc] = useState<string>();

  useEffect(() => {
    let url: string | undefined;
    let cancelled = false;
    buildBook(book).then((built) => {
      url = built;
      if (cancelled) URL.revokeObjectURL(built);
      else setSrc(built);
    });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [book]);

  if (!src) return <div role="img" aria-label={alt} className={className} />;
  return <SkyLitModel src={src} poster={book.cover} alt={alt} cameraOrbit={CAMERA_ORBIT} className={className} />;
}
