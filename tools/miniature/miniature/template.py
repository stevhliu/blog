"""Shape templates for packaging whose construction is known.

The shape model guesses an object's depth, and for flat-bottom pouches it
guesses a loaf: a vertical front and a back that holds its depth, then rolls
over. A real flat-bottom (box) pouch is an A-frame: front and back are flat
panels leaning from the full-depth base to meet at the top seal, joined by
flat triangular gussets that fold slightly inward.

pouch() builds that shape straight from the photo:

- Every front vertex sits on the camera ray through its photo pixel, so the
  front outline is the photo's own (rounded seal corners, tear notches) and
  the projected print lands exactly.
- Depth falls in a straight line from `depth` at the base, rounding over
  into the bottom of the seal, which stays a thin flat fin; the back is the
  front mirrored through the bag's middle.
- `depth` is a fraction of the bag's width. The shape model's own estimate
  is a good start (estimate_depth); an extra photo refines it.
- Relief, when given, lifts the panels off their flat lean: the swell of
  the contents in the middle of each panel, the zipper's lip across the
  top, the airlock valve standing proud of the front. Each is a height
  added along the camera ray, so the outline and the projected print
  don't move; only the shading does, which is what a flat panel lacks as
  the bag turns.

The mesh carries a plain atlas (a regular grid unwrap) so the projection
step can treat it like any other.
"""
from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import trimesh
from PIL import Image

from .camera import Camera

ROWS = 72  # rows down the bag
COLS = 80  # columns across each panel
GUSSET_STEPS = 10  # points across each gusset
FIN = 0.0015  # half-thickness of the sealed fin, in scene units
FOLD = 0.08  # how far a gusset's middle folds in, as a fraction of the depth there
SHOULDER = 0.12  # how gradually the panels round over into the seal
EDGE_SMOOTH = 3  # rows either way the outline is smoothed over; see row_extents
CRIMP = 0.006  # of the width: outline jitter up to this is seal crimp, not shape
ATLAS = 1024
# Outline overlap lost per pixel of mean print reprojection error (fit_pouch).
REPROJECTION_PENALTY = 0.01
# Relief sizes, as fractions of the bag's width (heights) or height (the
# zipper's spread). A zipper's lip on a 150mm bag is a millimetre or so.
ZIPPER_HEIGHT = 0.006
ZIPPER_SPREAD = 0.012  # standard deviation of the lip's bell, up the bag
VALVE_HEIGHT = 0.012
VALVE_RIM = 0.3  # share of the valve's radius over which its edge rounds off
EDGE_FADE = 0.04  # how far in from the side edges a ridge dies out, across the bag


@dataclass
class Relief:
    """Departures from the flat panels, each a fraction of the bag's width
    unless said otherwise. bulge: how far the middle of each panel swells
    outward. zipper: how far up the bag the zipper runs, as a fraction of
    its height from the base. valve: the airlock's centre across and down
    the bag's box (fractions of its width and height) and its radius."""

    bulge: float = 0.0
    zipper: float | None = None
    valve: tuple[float, float, float] | None = None


def bulge_profile(u: np.ndarray, h: np.ndarray, seal: float) -> np.ndarray:
    """How much of the full bulge each point on a panel gets, 0 to 1.

    u runs 0 to 1 from the panel's left edge to its right, h from 0 at the
    base to 1 at the top; the flat seal occupies h > 1 - seal. The sides
    are seals too, and the base is a flat gusset, so the swell must reach 0
    at u = 0, u = 1, h = 0 and h = 1 - seal. Whatever is inside the bag
    settles, so the swell's peak sits below the panel's middle and the fall
    toward the seal is longer than the rise from the base.
    """
    # Across: a half-sine, flat-topped by the power so the swell stays full
    # across most of the panel and falls to the side seals over the last
    # fifth, which is how film drapes over a filled bag. Up the bag: the
    # same bell with the height skewed, so the peak sits about 40% up.
    t = np.clip(h / (1 - seal), 0, 1)
    across = np.sin(np.pi * u) ** 0.6
    up = np.sin(np.pi * t**0.6) ** 1.2
    return across * up


def smoothstep(x: np.ndarray) -> np.ndarray:
    t = np.clip(x, 0, 1)
    return t * t * (3 - 2 * t)


def row_extents(alpha: np.ndarray, rows: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Left and right edges of the object along each image row, lightly
    smoothed so a stray pixel doesn't kink the outline.

    Each row's edge is the median over every pixel row in its band (half
    the spacing either side), not the single pixel row it sits on. A
    crimped seal along an edge is a fine sawtooth; sampled one pixel row
    per mesh row, it aliases into a zigzag that shades as ripples."""
    mask = alpha > 127
    half = max(1, int((rows[1] - rows[0]) / 2)) if len(rows) > 1 else 1
    lo, hi = [], []
    for y in range(mask.shape[0]):
        xs = np.nonzero(mask[y])[0]
        lo.append(xs.min() if len(xs) else np.nan)
        hi.append(xs.max() + 1 if len(xs) else np.nan)
    lo, hi = np.array(lo, float), np.array(hi, float)
    left, right = [], []
    for r in rows.astype(int):
        band = slice(max(r - half, 0), r + half + 1)
        left.append(np.nanmedian(lo[band]) if np.isfinite(lo[band]).any() else np.nan)
        right.append(np.nanmedian(hi[band]) if np.isfinite(hi[band]).any() else np.nan)
    left, right = np.array(left, float), np.array(right, float)
    for edge in (left, right):
        ok = ~np.isnan(edge)
        edge[~ok] = np.interp(np.nonzero(~ok)[0], np.nonzero(ok)[0], edge[ok])
    # The medians still carry the crimp (its period is close to the row
    # spacing), and a gusset built on a jittering edge zigzags row to row,
    # which lights as ribbing down the whole side. So the edge is smoothed
    # (a box of EDGE_SMOOTH rows either way, twice over, ends mirrored so
    # the top and base rows stay put), but only the small departures from
    # that smooth line are dropped: anything beyond CRIMP of the width is a
    # real feature of the outline, a wide tooth or a corner, and is kept,
    # so a bag with a coarse seal or a bulging side still fits its photo.
    width = float(np.nanmedian(right - left))
    k = np.ones(2 * EDGE_SMOOTH + 1) / (2 * EDGE_SMOOTH + 1)

    def smooth(e: np.ndarray) -> np.ndarray:
        line = e.copy()
        for _ in range(2):
            padded = np.concatenate([line[EDGE_SMOOTH:0:-1], line, line[-2 : -EDGE_SMOOTH - 2 : -1]])
            line = np.convolve(padded, k, "valid")
        residual = e - line
        return line + np.sign(residual) * np.maximum(np.abs(residual) - CRIMP * width, 0)

    return smooth(left), smooth(right)


class PouchFrame:
    """The geometry shared by the template and anything that needs a 3D
    point for a photo pixel: camera rays, the bag's extent in the photo and
    the depth profile (full at the base, nothing from the seal up)."""

    def __init__(
        self, prepared: Image.Image, camera: Camera, depth: float, seal: float, relief: Relief | None = None
    ):
        self.alpha = np.asarray(prepared.getchannel("A"))
        ys = np.nonzero((self.alpha > 127).any(1))[0]
        self.top, self.bottom = ys.min(), ys.max() + 1
        self.r, _ = camera.world_to_camera()
        self.eye = camera.eye()
        self.focal = camera.focal
        self.c = camera.size / 2
        self.seal = seal
        self.relief = relief or Relief()

        # Width in scene units, measured on the middle plane (z = 0).
        mid = (self.top + self.bottom) / 2
        xs = np.nonzero(self.alpha[int(mid)] > 127)[0]
        span = self.ray(np.array([xs.min(), xs.max() + 1.0]), np.array([mid, mid]))
        hits = self.eye + span * ((0 - self.eye[2]) / span[:, 2])[:, None]
        self.width = np.linalg.norm(hits[1] - hits[0])
        self.base_depth = depth * self.width
        # The bag's left and right edge on every pixel row, so any photo
        # pixel can be placed across its panel (0 at the left edge, 1 at
        # the right) for the relief.
        self.edge_rows = np.arange(self.top, self.bottom, dtype=float)
        self.left, self.right = row_extents(self.alpha, self.edge_rows)
        # The width in pixels on the middle row, for the valve's circle.
        self.width_px = float(xs.max() + 1 - xs.min())

    def ray(self, px: np.ndarray, py: np.ndarray) -> np.ndarray:
        d = np.stack([(px - self.c) / self.focal, (py - self.c) / self.focal, np.ones_like(px)], axis=-1)
        return d @ self.r  # camera space to world

    def half_depth(self, py: np.ndarray) -> np.ndarray:
        """Half the depth at each image row: a straight lean from the base,
        rounding over into the seal instead of meeting it at a crease (real
        film curves at that shoulder), then the thin fin."""
        h = (self.bottom - py) / (self.bottom - self.top)  # 0 at the base, 1 at the top
        rest = np.clip(1 - h / (1 - self.seal), 0, 1)  # 1 at the base, 0 at the seal
        lean = rest * (1 - np.exp(-rest / SHOULDER))
        return np.maximum(self.base_depth / 2 * lean, FIN)

    def relief_height(self, px: np.ndarray, py: np.ndarray, valve: bool) -> np.ndarray:
        """How far each pixel's point stands out from the flat panel, in
        scene units. The valve is on the front only."""
        relief = self.relief
        h = (self.bottom - py) / (self.bottom - self.top)
        left = np.interp(py, self.edge_rows, self.left)
        right = np.interp(py, self.edge_rows, self.right)
        u = np.clip((px - left) / np.maximum(right - left, 1), 0, 1)
        out = np.zeros_like(px, dtype=float)
        if relief.bulge:
            out += relief.bulge * self.width * bulge_profile(u, h, self.seal)
        if relief.zipper is not None:
            bell = np.exp(-0.5 * ((h - relief.zipper) / ZIPPER_SPREAD) ** 2)
            fade = smoothstep(u / EDGE_FADE) * smoothstep((1 - u) / EDGE_FADE)
            out += ZIPPER_HEIGHT * self.width * bell * fade
        if valve and relief.valve is not None:
            cx, cy, radius = relief.valve
            # Distance from the valve's centre in units of the bag's width,
            # with the vertical measured in pixels so the circle is round.
            dx = u - cx
            dy = ((1 - h) - cy) * (self.bottom - self.top) / self.width_px
            dist = np.sqrt(dx * dx + dy * dy)
            out += VALVE_HEIGHT * self.width * smoothstep((radius - dist) / (VALVE_RIM * radius))
        return out

    def front(self, px: np.ndarray, py: np.ndarray, valve: bool = True) -> np.ndarray:
        """The front panel's 3D point under each photo pixel. With
        valve=False it is the back's twin before mirroring: the same relief
        without the valve."""
        d = self.ray(px, py)
        z = -(self.half_depth(py) + self.relief_height(px, py, valve))
        return self.eye + d * ((z - self.eye[2]) / d[:, 2])[:, None]


def pouch(
    prepared: Image.Image, camera: Camera, depth: float, seal: float, relief: Relief | None = None
) -> trimesh.Trimesh:
    """A flat-bottom pouch fitted to the photo's outline.

    depth: base depth as a fraction of the bag's width.
    seal: height of the flat sealed strip at the top, as a fraction of the
    bag's height; the gussets close to nothing where it begins.
    relief: the swell, zipper and valve that lift the panels off flat."""
    frame = PouchFrame(prepared, camera, depth, seal, relief)
    top, bottom = frame.top, frame.bottom
    rows = np.linspace(top + 0.5, bottom - 0.5, ROWS)
    left, right = row_extents(frame.alpha, rows)
    half = frame.half_depth(rows)
    eye = frame.eye

    loop = 2 * COLS + 2 * GUSSET_STEPS
    verts = np.zeros((ROWS, loop + 1, 3))
    for i, py in enumerate(rows):
        cols, row = np.linspace(left[i], right[i], COLS), np.full(COLS, py)
        front = frame.front(cols, row)
        back = frame.front(cols, row, valve=False) * np.array([1, 1, -1])  # mirrored through z = 0
        fold = FOLD * 2 * half[i]

        def gusset(a: np.ndarray, b: np.ndarray, inward: float) -> np.ndarray:
            s = np.linspace(0, 1, GUSSET_STEPS + 2)[1:-1, None]
            g = a * (1 - s) + b * s
            g[:, 0] += inward * np.sin(np.pi * s[:, 0]) * fold
            return g

        ring = np.concatenate(
            [front, gusset(front[-1], back[-1], -1), back[::-1], gusset(back[0], front[0], 1)], axis=0
        )
        verts[i, :loop] = ring
        verts[i, loop] = ring[0]  # duplicated so the atlas seam has its own UVs

    # Atlas: the tube unrolled into the top 88% of the texture.
    u = np.linspace(0, 1, loop + 1)
    v = np.linspace(1, 0.12, ROWS)
    uv = np.stack(np.meshgrid(u, v), axis=-1)

    faces = []
    for i in range(ROWS - 1):
        for j in range(loop):
            a = i * (loop + 1) + j
            b = a + 1
            c2 = a + loop + 1
            d2 = c2 + 1
            faces += [[a, c2, b], [b, c2, d2]]
    positions = verts.reshape(-1, 3)
    uvs = uv.reshape(-1, 2)

    # Caps: the base and the top edge, each a fan, with its own small patch
    # of the atlas.
    def cap(ring: np.ndarray, corner: float) -> None:
        nonlocal positions, uvs
        start = len(positions)
        centre = ring.mean(0)
        flat = ring[:, [0, 2]]
        lo, hi = flat.min(0), flat.max(0)
        cap_uv = corner + 0.1 * (flat - lo) / np.maximum(hi - lo, 1e-9)
        positions = np.vstack([positions, centre, ring])
        uvs = np.vstack([uvs, cap_uv.mean(0), cap_uv])
        n = len(ring)
        for j in range(n):
            faces.append([start, start + 1 + j, start + 1 + (j + 1) % n])

    cap(verts[-1, :loop], 0.0)
    cap(verts[0, :loop], 0.5)

    mesh = trimesh.Trimesh(positions, np.array(faces), process=False)
    # Face outward: the front's normals must point at the camera.
    front_face = mesh.face_normals[: 2 * COLS].mean(0)
    if front_face @ (eye - positions[: COLS].mean(0)) < 0:
        mesh.faces = mesh.faces[:, ::-1]
    # Caps were wound independently; point each away from the middle. Only
    # the caps: a relief's slope that leans toward the middle (the lower
    # side of the zipper's lip) is wound right already, and turning it
    # would hand it to the back.
    centre = positions.mean(0)
    tube = 2 * (ROWS - 1) * loop
    flip = np.einsum("ij,ij->i", mesh.face_normals, mesh.triangles_center - centre) < 0
    flip[:tube] = False
    mesh.faces[flip] = mesh.faces[flip][:, ::-1]

    mesh.visual = trimesh.visual.TextureVisuals(
        uv=uvs,
        material=trimesh.visual.material.PBRMaterial(
            baseColorTexture=Image.new("RGB", (ATLAS, ATLAS), (200, 200, 200)),
            metallicFactor=0.0,
            roughnessFactor=0.5,
        ),
    )
    return mesh


def estimate_depth(shape: trimesh.Trimesh, camera: Camera) -> float:
    """The shape model's base depth as a fraction of its width: the extent
    along the camera's view axis over the bottom tenth of the object."""
    r, _ = camera.world_to_camera()
    right, down, forward = r
    v = np.asarray(shape.vertices)
    height = v @ -down
    low = height < height.min() + 0.1 * np.ptp(height)
    return float(np.ptp(v[low] @ forward) / np.ptp(v @ right))


def fit_pouch(
    prepared: Image.Image,
    camera: Camera,
    depth: float,
    extras: list[Image.Image],
    seal: float = 0.15,
    relief: Relief | None = None,
) -> tuple[trimesh.Trimesh, float, float, list[Camera | None], dict]:
    """Refine depth and seal height against extra photos. Returns the mesh,
    the chosen depth and seal, and a camera per extra photo (None where the
    photo shared too little print to place).

    Each extra photo's camera comes from print matched against the primary
    photo (match.py): the front panel's points are known in 3D for any
    candidate shape, so the camera follows by solving perspective-n-point.
    Matched points on a near-flat front can't tell a wide lens at a steep
    angle from a long lens head-on, so the lens is searched along with the
    two numbers the front can't see, the base depth and the seal height.
    Each combination is scored by how well the outline then matches the
    photo, less a small penalty for reprojecting the print badly. Extra
    photos with too little shared print are skipped."""
    from .align import iou
    from .match import match, reliable, solve_with
    from .raster import silhouette

    if not extras:
        return pouch(prepared, camera, depth, seal, relief), depth, seal, [], {}

    matches = [match(prepared, image) for image in extras]
    usable = [i for i, (a, _) in enumerate(matches) if len(a) >= 12]
    stats = {"matches": [len(a) for a, _ in matches]}
    if not usable:
        return pouch(prepared, camera, depth, seal, relief), depth, seal, [None] * len(extras), stats

    start = PouchFrame(prepared, camera, depth, seal, relief)
    kept = {}
    for i in usable:
        a, b = matches[i]
        idx = reliable(start.front(a[:, 0], a[:, 1]), b, extras[i].width)
        kept[i] = (a[idx], b[idx])
    targets = {i: np.asarray(extras[i].getchannel("A")) > 127 for i in usable}

    best = None
    for d in np.arange(0.15, 0.65, 0.05):
        for s in (0.1, 0.15, 0.2, 0.25):
            frame = PouchFrame(prepared, camera, d, s, relief)
            mesh = pouch(prepared, camera, d, s, relief)
            verts, faces = np.asarray(mesh.vertices), np.asarray(mesh.faces)
            score, cams, fits, errors = 0.0, [], [], []
            for i in usable:
                a, b = kept[i]
                points = frame.front(a[:, 0], a[:, 1])
                options = []
                for fov in (15, 20, 25, 30, 35, 40, 50):
                    cam, error = solve_with(points, b, extras[i].width, fov)
                    fit = iou(silhouette(cam.project(verts)[0], faces, cam.size), targets[i])
                    options.append((fit - REPROJECTION_PENALTY * error, fit, cam, error))
                value, fit, cam, error = max(options, key=lambda o: o[0])
                score += value
                cams.append(cam)
                fits.append(fit)
                errors.append(error)
            if best is None or score > best[0]:
                best = (score, d, s, cams, fits, errors)
    _, d, s, found, fits, errors = best
    cams: list[Camera | None] = [None] * len(extras)
    for i, cam in zip(usable, found):
        cams[i] = cam
    stats.update(
        silhouette_iou=[round(f, 4) for f in fits],
        reprojection_px=[round(e, 2) for e in errors],
        field_of_view=[c.fovy for c in found],
    )
    return pouch(prepared, camera, d, s, relief), float(d), float(s), cams, stats
