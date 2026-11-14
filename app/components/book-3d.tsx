"use client";

import { useEffect, useState } from "react";
import type { Texture } from "three";

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

/**
 * How much of each face is shown as printed, whatever the light, with the
 * rest lit by the sky. Lit only, the book is far darker than its cover:
 * the sky map gives a face about a sixth of full light, so the white
 * lettering drew at 109 of 255 and the dark cover lost its pattern. It is
 * the pouch's model (tools/miniature/miniature/lighting.py),
 *
 *     colour = shown * print + (1 - shown) * print * light + reflection
 *
 * through glTF's emissive channel, and at the pouch's ceiling of 0.8,
 * which keeps a fifth of the light for shape. Exposure scales this share
 * too, so the book still dims with the page at night.
 */
const SELF_LIT = 0.8;

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

/**
 * The book as a glTF, built in the browser: a three.js box exported with
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
 *
 * The exporter writes every texture into the file as a PNG, which for
 * three cover-sized images took about 330ms and was then decoded again by
 * the viewer. So a face with an image is exported with a 2px stand-in, and
 * the file is written as JSON with the stand-in's address swapped for the
 * image's own: the viewer loads the image the browser already has.
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
  // Material name to the image it shows, for the swap after export.
  const images = new Map<string, string>();
  // Each printed face is its image, fitted to the face, or the drawn
  // stand-in if there is no image or it fails to load.
  const face = async (name: string, src: string | undefined, aspect: number, fallback: () => HTMLCanvasElement) => {
    if (src) {
      try {
        const image = await new THREE.ImageLoader().loadAsync(src);
        images.set(name, new URL(src, location.href).href);
        // The image is cropped to the face's proportions (width over
        // height), like CSS object-fit: cover, so a cover scanned at
        // another trim size (a trade edition's art on a mass-market book),
        // or a photo cropped a little loose, is trimmed at the edges
        // rather than squeezed. The crop is a texture transform: the face
        // shows the middle `across` of the width and `down` of the height.
        // A glTF image's first row is its top, where three.js puts v = 1,
        // so the height is also flipped.
        const across = Math.min(1, (image.height * aspect) / image.width);
        const down = Math.min(1, image.width / aspect / image.height);
        const standIn = document.createElement("canvas");
        standIn.width = standIn.height = 2;
        const t = texture(standIn);
        t.flipY = false;
        t.repeat.set(across, -down);
        t.offset.set((1 - across) / 2, (1 + down) / 2);
        return t;
      } catch {
        // Fall through to the stand-in.
      }
    }
    return texture(fallback());
  };
  const plainBack = () => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 4;
    const g = canvas.getContext("2d")!;
    g.fillStyle = book.color;
    g.fillRect(0, 0, 4, 4);
    return canvas;
  };
  const [coverMap, spineMap, backMap] = await Promise.all([
    face("front", book.cover, book.width / book.height, () => coverCanvas(book, 1024)),
    face("spine", book.spine, book.thickness / book.height, () => spineCanvas(book, 1024)),
    face("back", book.back, book.width / book.height, plainBack),
  ]);

  // A paperback's cover is laminated card, a little glossier than the
  // uncoated pages.
  const gloss = 0.4;
  const material = (name: string, map: Texture, roughness: number) =>
    new THREE.MeshStandardMaterial({
      name,
      map,
      roughness,
      color: new THREE.Color().setScalar(1 - SELF_LIT),
      emissive: 0xffffff,
      emissiveMap: map,
      emissiveIntensity: SELF_LIT,
    });
  const front = material("front", coverMap, gloss);
  const back = material("back", backMap, gloss);
  const spine = material("spine", spineMap, gloss);
  const foreEdge = material("foreEdge", texture(pagesCanvas(book, "u")), 0.9);
  const headTail = material("headTail", texture(pagesCanvas(book, "v")), 0.9);
  const materials = [foreEdge, spine, headTail, headTail, front, back];

  // World units: the book is 1 tall. Box faces: +x, -x, +y, -y, +z, -z.
  // model-viewer's front camera sits on +z, so the cover faces +z and the
  // spine, on the cover's left as seen from the front, is at -x.
  const w = book.width / book.height;
  const d = book.thickness / book.height;
  const radius = 1.5 / book.height;
  const geometry = new RoundedBoxGeometry(w, 1, d, 4, radius);
  const mesh = new THREE.Mesh(geometry, materials);

  type Gltf = {
    materials: { name?: string; pbrMetallicRoughness?: { baseColorTexture?: { index: number } } }[];
    textures: { source: number }[];
    images: { uri?: string; mimeType?: string }[];
  };
  const gltf = (await new GLTFExporter().parseAsync(mesh, { binary: false })) as unknown as Gltf;
  for (const material of gltf.materials) {
    const url = images.get(material.name ?? "");
    const index = material.pbrMetallicRoughness?.baseColorTexture?.index;
    if (url && index !== undefined) gltf.images[gltf.textures[index].source] = { uri: url };
  }

  geometry.dispose();
  for (const m of [front, back, spine, foreEdge, headTail]) {
    m.map?.dispose();
    m.dispose();
  }
  return URL.createObjectURL(new Blob([JSON.stringify(gltf)], { type: "model/gltf+json" }));
}

/**
 * A book that turns like the coffee pouch above it, because it is the same
 * viewer: SkyLitModel, lit by the sky over Sebastopol, dragged to turn,
 * turning slowly on its own, and zoomed after a click. Until the model is
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
  // No poster: the flat cover is not the composed view, and a flat cover
  // turning into an angled book reads as a jump.
  return <SkyLitModel src={src} alt={alt} cameraOrbit={CAMERA_ORBIT} className={className} />;
}
