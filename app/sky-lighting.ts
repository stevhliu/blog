/**
 * The page lit by the sky over Sebastopol right now.
 *
 * Modelled on how pengzhe.ng lights its pages. The sun's altitude picks a
 * place along a table of sky keyframes (day, golden hour, dusk, blue
 * hour, early night, late night, midnight), each a sky colour at the top
 * and one at the horizon, and the two are blended between keyframes in
 * OKLCH so the blends pass through plausible colours (a blue to an amber
 * goes through mauve, never grey). The sky changes slowly: golden hour
 * begins with the sun 24° up, hours before it sets. Every ink is then
 * solved from the sky rather than chosen: text, secondary text, dim text
 * and the link colour each take the sky's hue, faintly, at the lightness
 * that gives a set contrast against the paper. So a dozen colours move
 * together, and none can drift out of contrast.
 *
 * Every function is self-contained (no imports, no module-level names)
 * so layout.tsx can inline them as a script that runs before the
 * stylesheet paints, the way it already inlines doge().
 */

export const SEBASTOPOL_LAT = 38.4021;
export const SEBASTOPOL_LON = -122.8239;

export type SunPosition = {
  /** Degrees above the horizon (negative below). */
  altitude: number;
  /** Degrees from north through east. */
  bearing: number;
  /** The lowest the sun gets tonight, degrees; the midnight keyframe. */
  lowest: number;
};

/** The sun from a place at an instant; self-contained. */
export function sunPosition(date: Date, latitude: number, longitude: number): SunPosition {
  const rad = Math.PI / 180;
  const days = date.getTime() / 86_400_000 - 10957.5; // since J2000.0
  const meanAnomaly = rad * ((357.529 + 0.98560028 * days) % 360);
  const eclipticLongitude =
    rad * (280.459 + 0.98564736 * days + 1.915 * Math.sin(meanAnomaly) + 0.02 * Math.sin(2 * meanAnomaly));
  const obliquity = rad * (23.439 - 0.00000036 * days);
  const rightAscension = Math.atan2(Math.cos(obliquity) * Math.sin(eclipticLongitude), Math.cos(eclipticLongitude));
  const declination = Math.asin(Math.sin(obliquity) * Math.sin(eclipticLongitude));
  const siderealHours = 18.697374558 + 24.06570982441908 * days + longitude / 15;
  const hourAngle = rad * 15 * siderealHours - rightAscension;
  const lat = rad * latitude;
  const up = Math.sin(lat) * Math.sin(declination) + Math.cos(lat) * Math.cos(declination) * Math.cos(hourAngle);
  const north = Math.cos(lat) * Math.sin(declination) - Math.sin(lat) * Math.cos(declination) * Math.cos(hourAngle);
  const east = -Math.cos(declination) * Math.sin(hourAngle);
  const bearing = (Math.atan2(east, north) / rad + 360) % 360;
  return { altitude: Math.asin(up) / rad, bearing, lowest: (declination - (Math.PI / 2 - lat)) / rad };
}

export type MoonPosition = {
  /** Degrees above the horizon (negative below). */
  altitude: number;
  /** Lit fraction of the disc, 0 (new) to 1 (full). */
  fraction: number;
};

/** The moon from a place at an instant, to about a degree (Meeus's short
 * series, as SunCalc uses); self-contained. */
export function moonPosition(date: Date, latitude: number, longitude: number): MoonPosition {
  const rad = Math.PI / 180;
  const days = date.getTime() / 86_400_000 - 10957.5; // since J2000.0
  const obliquity = rad * 23.4397;
  const L = rad * (218.316 + 13.176396 * days); // mean longitude
  const M = rad * (134.963 + 13.064993 * days); // mean anomaly
  const F = rad * (93.272 + 13.22935 * days); // argument of latitude
  const l = L + rad * 6.289 * Math.sin(M);
  const b = rad * 5.128 * Math.sin(F);
  const rightAscension = Math.atan2(Math.sin(l) * Math.cos(obliquity) - Math.tan(b) * Math.sin(obliquity), Math.cos(l));
  const declination = Math.asin(Math.sin(b) * Math.cos(obliquity) + Math.cos(b) * Math.sin(obliquity) * Math.sin(l));
  const siderealHours = 18.697374558 + 24.06570982441908 * days + longitude / 15;
  const hourAngle = rad * 15 * siderealHours - rightAscension;
  const lat = rad * latitude;
  const up = Math.sin(lat) * Math.sin(declination) + Math.cos(lat) * Math.cos(declination) * Math.cos(hourAngle);
  // Phase from the moon's elongation from the sun along the ecliptic.
  const sunAnomaly = rad * ((357.529 + 0.98560028 * days) % 360);
  const sunLongitude = rad * (280.459 + 0.98564736 * days + 1.915 * Math.sin(sunAnomaly));
  return { altitude: Math.asin(up) / rad, fraction: (1 - Math.cos(l - sunLongitude)) / 2 };
}

/** Colour tokens as CSS values, keyed by variable name; whether the page
 * counts as dark; and how bright it is, 0 (night) to 1 (full day), which
 * anything else lit by the sky (the pouch) follows. */
export type PageLight = { vars: Record<string, string>; dark: boolean; adapted: number };

/**
 * The sky for this sun and moon under this much cloud, and the inks
 * solved from it; self-contained. clouds is cover from 0 (clear) to 1.
 */
export function pageLight(
  sun: { altitude: number; bearing: number; lowest: number },
  moon: { altitude: number; fraction: number } = { altitude: -90, fraction: 0 },
  clouds = 0,
): PageLight {
  type Rgb = [number, number, number];
  type Lch = [number, number, number];
  const clamp = (x: number, lo: number, hi: number) => Math.min(Math.max(x, lo), hi);
  const smooth = (a: number, b: number, x: number) => {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };
  // sRGB <-> OKLab (Björn Ottosson), with hue and chroma split out.
  const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  const toByte = (v: number) => {
    const c = clamp(v, 0, 1);
    return Math.round(255 * (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055));
  };
  const luminance = (c: Rgb) => 0.2126 * toLinear(c[0] / 255) + 0.7152 * toLinear(c[1] / 255) + 0.0722 * toLinear(c[2] / 255);
  const lch = (c: Rgb): Lch => {
    const [r, g, b] = c.map((v) => toLinear(v / 255));
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
    const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
    const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    return [L, Math.hypot(A, B), Math.atan2(B, A)];
  };
  const rgb = ([L, C, h]: Lch): Rgb => {
    const A = C * Math.cos(h), B = C * Math.sin(h);
    const l = Math.pow(L + 0.3963377774 * A + 0.2158037573 * B, 3);
    const m = Math.pow(L - 0.1055613458 * A - 0.0638541728 * B, 3);
    const s = Math.pow(L - 0.0894841775 * A - 1.291485548 * B, 3);
    return [
      toByte(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
      toByte(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
      toByte(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
    ];
  };
  const hex = (s: string): Rgb => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16)) as Rgb;
  // Blend in OKLCH, the hue the short way round, so a sunset's amber and
  // the blue hour meet through pink rather than grey. `straight` blends
  // in OKLab instead: for the sky's top against its horizon, which are
  // near-opposite hues (blue over cream), and should meet in a neutral,
  // not swing through green or magenta on a hair's difference.
  const mix = (a: Rgb, b: Rgb, t: number, straight = false): Rgb => {
    const [La, Ca, ha] = lch(a), [Lb, Cb, hb] = lch(b);
    if (straight) {
      const Aa = Ca * Math.cos(ha), Ba = Ca * Math.sin(ha), Ab = Cb * Math.cos(hb), Bb = Cb * Math.sin(hb);
      const A = Aa + (Ab - Aa) * t, B = Ba + (Bb - Ba) * t;
      return rgb([La + (Lb - La) * t, Math.hypot(A, B), Math.atan2(B, A)]);
    }
    let dh = hb - ha;
    if (dh > Math.PI) dh -= 2 * Math.PI;
    if (dh < -Math.PI) dh += 2 * Math.PI;
    // Between two near-greys the hue is noise; let chroma carry it.
    const w = Ca < 0.01 ? 1 : Cb < 0.01 ? 0 : t;
    // The middle of a blend loses a third of its chroma: the sky between
    // two keyframes is muted, a dusty rose between amber and blue rather
    // than a full violet.
    const mute = 1 - 0.35 * 4 * t * (1 - t);
    return rgb([La + (Lb - La) * t, (Ca + (Cb - Ca) * t) * mute, ha + dh * w]);
  };

  // The sky's colour comes from the atmosphere itself: single scattering
  // after Maxime Heckel's "On rendering the sky, sunsets, and planets",
  // the same model sky.ts marches for the pouch, here on nine rays
  // (straight up, and eight round the horizon). Air scatters blue
  // (Rayleigh), haze scatters grey and forward (Mie), ozone absorbs the
  // middle of the spectrum, and sunlight is attenuated on the way in and
  // out by Beer's law; a sun below the horizon lights the air only where
  // its rays clear the planet, so dusk reddens and dims on its own. Only
  // the hue and chroma are used: how bright the page is stays a design
  // choice, below.
  const R = 6371, H = 100, BR = [5.8e-3, 13.5e-3, 33.1e-3], BM = 3e-3, BME = BM * 1.1, G = 0.76;
  const BO = [0.65e-3, 1.881e-3, 0.085e-3], eye: Rgb = [0, R + 0.002, 0];
  const exit = (o: Rgb, d: Rgb, r: number) => {
    const b = o[0] * d[0] + o[1] * d[1] + o[2] * d[2], c = o[0] ** 2 + o[1] ** 2 + o[2] ** 2 - r * r;
    const q = b * b - c;
    return q < 0 ? -1 : -b + Math.sqrt(q);
  };
  const entry = (o: Rgb, d: Rgb, r: number) => {
    const b = o[0] * d[0] + o[1] * d[1] + o[2] * d[2], c = o[0] ** 2 + o[1] ** 2 + o[2] ** 2 - r * r;
    const q = b * b - c, t = -b - Math.sqrt(Math.max(q, 0));
    return q < 0 || t <= 0 ? -1 : t;
  };
  const density = (p: Rgb) => {
    const h = Math.max(Math.hypot(p[0], p[1], p[2]) - R, 0);
    return [Math.exp(-h / 8), Math.exp(-h / 1.2), Math.max(1 - Math.abs(h - 25) / 15, 0)];
  };
  // Transmittance from a point out to the sun: none where the planet is in
  // the way, else Beer's law over the air along the way.
  const toSun = (p: Rgb, sun: Rgb): Rgb => {
    if (entry(p, sun, R) > 0) return [0, 0, 0];
    const step = exit(p, sun, R + H) / 4;
    let a = 0, m = 0, o = 0;
    for (let i = 0; i < 4; i++) {
      const t = (i + 0.5) * step, [dr, dm, dz] = density([p[0] + sun[0] * t, p[1] + sun[1] * t, p[2] + sun[2] * t]);
      a += dr * step; m += dm * step; o += dz * step;
    }
    return [0, 1, 2].map((c) => Math.exp(-(BR[c] * a + BME * m + BO[c] * o))) as Rgb;
  };
  const radiance = (dir: Rgb, sun: Rgb): Rgb => {
    const ground = entry(eye, dir, R);
    const step = Math.min(ground > 0 ? ground : exit(eye, dir, R + H), 200) / 8;
    const mu = dir[0] * sun[0] + dir[1] * sun[1] + dir[2] * sun[2], g2 = G * G;
    const pR = (3 / (16 * Math.PI)) * (1 + mu * mu);
    const pM = (3 * (1 - g2) * (1 + mu * mu)) / (8 * Math.PI * (2 + g2) * Math.pow(Math.max(1 + g2 - 2 * G * mu, 1e-4), 1.5));
    let a = 0, m = 0, o = 0;
    const sR = [0, 0, 0], sM = [0, 0, 0];
    for (let i = 0; i < 8; i++) {
      const t = (i + 0.5) * step, p: Rgb = [eye[0] + dir[0] * t, eye[1] + dir[1] * t, eye[2] + dir[2] * t];
      const [dr, dm, dz] = density(p);
      a += dr * step; m += dm * step; o += dz * step;
      const T = toSun(p, sun);
      for (let c = 0; c < 3; c++) {
        const out = Math.exp(-(BR[c] * a + BME * m + BO[c] * o));
        sR[c] += dr * T[c] * out * step; sM[c] += dm * T[c] * out * step;
      }
    }
    // Plus starlight and the glow of a town, so night keeps a hue.
    return [0, 1, 2].map((c) => 20 * (pR * BR[c] * sR[c] + pM * BM * sM[c]) + [0.004, 0.006, 0.012][c]) as Rgb;
  };
  // Hue and chroma of a (linear, HDR) radiance: scaled to a fixed
  // brightness, then into OKLCH.
  const tone = (c: Rgb): [number, number] => {
    const peak = Math.max(c[0], c[1], c[2], 1e-9);
    const [, C, h] = lch(c.map((v) => toByte(0.6 * (v / peak))) as Rgb);
    return [C, h];
  };
  const rad = Math.PI / 180, flat = Math.cos(sun.altitude * rad);
  const sunDir: Rgb = [Math.sin(sun.bearing * rad) * flat, Math.sin(sun.altitude * rad), -Math.cos(sun.bearing * rad) * flat];
  const up = radiance([0, 1, 0], sunDir);
  const ring: Rgb = [0, 0, 0];
  for (let i = 0; i < 8; i++) {
    const az = (i / 8) * 2 * Math.PI, el = 4 * rad;
    const r = radiance([Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)], sunDir);
    for (let c = 0; c < 3; c++) ring[c] += r[c] / 8;
  }
  // A page outdoors is lit by the sun as well as the sky: direct sunlight
  // through the air, by how high the sun stands. It is what keeps a noon
  // page near white rather than sky-blue, and goes amber as the sun sets.
  const sunlight = toSun(eye, sunDir).map((v) => 20 * v * Math.max(sunDir[1], 0) * 0.12 * (1 - 0.85 * clouds));
  // Cloud turns the sky toward a grey of the same brightness (an overcast
  // sky is a white diffuser) and takes most of the direct sun.
  const overcast = (c: Rgb): Rgb => {
    const grey = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    return c.map((v) => v + (grey - v) * 0.8 * clouds) as Rgb;
  };
  const upC = overcast(up), ringC = overcast(ring);
  // Moonlight: by the lit fraction and the moon's height, a touch cool.
  // Far fainter than the night sky's floor in truth; here it is a visible
  // lift of a moonlit night over a moonless one.
  const moonlight = 0.02 * moon.fraction * Math.max(Math.sin(moon.altitude * rad), 0) * (1 - 0.7 * clouds);
  const moonColour = [0.85, 0.92, 1.0];
  const zenith = tone([0, 1, 2].map((c) => upC[c] + 0.2 * ringC[c] + moonColour[c] * moonlight) as Rgb);
  const horizon = tone([0, 1, 2].map((c) => ringC[c] + 0.5 * upC[c] + sunlight[c] + moonColour[c] * moonlight) as Rgb);

  // How bright the page is follows the light on it, the way eyes adapt:
  // a soft curve from the night's floor up to white paper, saturating
  // well below noon so the whole day reads as white and the evening's
  // fall is the long, even slide a real dusk is. One continuous function
  // of the light, so nothing about the page steps from one phase of the
  // day to the next.
  const onPage = [0, 1, 2].map((c) => (ringC[c] + 0.5 * upC[c]) * (1 - 0.5 * clouds) + sunlight[c] + moonColour[c] * moonlight);
  // Single scattering on eight steps undercounts twilight: the glow that
  // light scattered twice or more spreads over the whole sky after the
  // sun has set, which is what keeps the evening going until the sun is
  // 18° down. Added back here as brightness alone, fading out over
  // astronomical twilight.
  const glow = 0.12 * Math.pow(smooth(-18, -1, sun.altitude), 1.5);
  const irradiance = 0.2126 * onPage[0] + 0.7152 * onPage[1] + 0.0722 * onPage[2] + glow;
  // Perceived brightness goes with the log of the light (Weber-Fechner),
  // so the curve is a logistic in log10: its middle at a tenth of a
  // clear sky's light, two decades wide, so the day saturates to white
  // paper and the evening is the long, even slide a real dusk is. Night
  // sits at the floor, L 0.2.
  const adapted = 1 / (1 + Math.exp(-2.4 * (Math.log10(irradiance) + 1)));
  const bottomL = 0.15 + 0.835 * adapted;
  // The top of the sky is a little darker than the page by day (blue
  // against cream) and a little darker than it by night too.
  const topL = Math.max(bottomL - 0.08, 0.07);
  // The atmosphere's hue and chroma at that lightness. The page is paper,
  // not sky, so it takes the colour at a fraction of the chroma, and
  // never past a cap: a sunset horizon is orange; a page at sunset is
  // warm.
  let top = rgb([topL, Math.min(zenith[0] * 0.7, 0.08), zenith[1]]);
  let bottom = rgb([bottomL, Math.min(horizon[0] * 0.45, 0.05), horizon[1]]);

  // Dark or light is decided by the paper's lightness. At the switch
  // (OKLab L 0.564, where black and white ink read equally, at 4.5:1) a
  // paper within the band is pushed to the band's edge, where either
  // ink reads at 5.5:1, so the page steps across the middle in one
  // refresh instead of lingering there for the half hour the sky takes.
  const SWITCH = 0.564, BAND = 0.045;
  const settle = (c: Rgb): Rgb => {
    const [L, C, h] = lch(c);
    const d = L - SWITCH;
    return Math.abs(d) >= BAND ? c : rgb([SWITCH + (d < 0 ? -BAND : BAND), C, h]);
  };
  bottom = settle(bottom);
  const paperL = lch(bottom)[0];
  const dark = paperL < SWITCH;
  const paper = bottom;
  // The page is washed from a little of the sky's top down into the
  // paper: a blue sky over cream by day, violet over amber at dusk. A
  // fifth of the top is as much as a page of text takes.
  const wash = mix(top, bottom, 0.8, true);
  top = mix(top, bottom, 0.3, true);

  // An ink of the sky's hue at `chroma`, as light or dark as it must be
  // to read at `ratio` against the paper, or as far as sRGB can go.
  const hue = lch(wash)[2];
  const contrast = (a: Rgb, b: Rgb) => {
    const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };
  const ink = (ratio: number, chroma: number, h = hue): Rgb => {
    let lo = dark ? paperL : 0, hi = dark ? 1 : paperL;
    for (let n = 0; n < 24; n++) {
      const mid = (lo + hi) / 2;
      const ok = contrast(rgb([mid, chroma, h]), paper) >= ratio;
      if (dark) ok ? (hi = mid) : (lo = mid);
      else ok ? (lo = mid) : (hi = mid);
    }
    return rgb([dark ? hi : lo, chroma, h]);
  };
  const text = ink(13, 0.012);
  const subtext = ink(5.6, 0.03);
  const dim = ink(4.6, 0.035);
  // Links keep the site's own accents: black ink by day, its blue
  // (#58a6ff) by night, at that blue's own hue rather than the sky's,
  // and no darker than it, lifted until it reads against tonight's paper.
  const blue = lch(hex("#58a6ff"));
  const lifted = ink(5, 0.14, blue[2]);
  const accent = dark ? (lch(lifted)[0] > blue[0] ? lifted : rgb(blue)) : text;
  const css = (c: Rgb, a?: number) => `rgb(${c[0]} ${c[1]} ${c[2]}${a === undefined ? "" : ` / ${a}`})`;
  const vars: Record<string, string> = {
    "--sky-top": css(top),
    "--sky-wash": css(wash),
    "--color-page-chrome": css(wash),
    "--color-bg": css(paper),
    "--color-text": css(text),
    "--color-body": css(text),
    "--color-subtext": css(subtext),
    "--color-dim": css(dim),
    "--color-blue": css(accent),
    "--color-accent": css(accent),
    "--color-rule": css(dim),
    "--color-rule-soft": css(dim, 0.45),
    "--color-surface": css(text, dark ? 0.08 : 0.05),
    "--color-code-bg": dark ? css(text, 0.08) : css(paper),
    "--color-code-border": css(text, dark ? 0.28 : 0.14),
  };
  return { vars, dark, adapted };
}

/** Write the lit page into the document, and tell anything else lit by
 * the sky (a "sky-light" event on the document, with the light as its
 * detail; `--sky-adapted` on the root for CSS). Self-contained. */
export function applyPageLight(light: PageLight): void {
  const root = document.documentElement;
  // Ease only changes big enough to see: a light/dark flip, or clouds
  // rolling in. A minute of sun is about one level in 255 and goes in as
  // is, because easing it recalculates every element's style on every
  // frame for eight seconds. The first lighting has nothing to ease from.
  const channels = (value: string) => (value.match(/[\d.]+/g) || []).map(Number);
  // "Big enough to see" is judged the way eyes judge it, in OKLab, where
  // equal distances look equally different: one level in 255 is invisible
  // on white paper but can show in near-black ink. 0.02 is the
  // just-noticeable difference CSS Color 4 uses for gamut mapping. A
  // translucent colour (a rule, a surface tint) shows only as much of its
  // change as its alpha lets through, plus any change in the alpha itself.
  const oklab = (c: number[]): number[] => {
    const [r, g, b] = c.slice(0, 3).map((v) => {
      const s = v / 255;
      return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [
      0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
      1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
      0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
    ];
  };
  const isVisibleChange = (from: number[], to: number[]): boolean => {
    const a = oklab(from);
    const b = oklab(to);
    const distance = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    const fromAlpha = from.length > 3 ? from[3] : 1;
    const toAlpha = to.length > 3 ? to[3] : 1;
    return distance * Math.max(fromAlpha, toAlpha) + Math.abs(fromAlpha - toAlpha) > 0.02;
  };
  const lit = root.dataset.night !== undefined;
  let ease = lit && light.dark !== (root.dataset.night === "true");
  for (const name in light.vars) {
    const before = root.style.getPropertyValue(name);
    if (lit && before && isVisibleChange(channels(before), channels(light.vars[name]))) ease = true;
  }
  root.dataset.skyEase = ease ? "true" : "false";
  for (const name in light.vars) root.style.setProperty(name, light.vars[name]);
  root.style.setProperty("--sky-adapted", String(Math.round(light.adapted * 1000) / 1000));
  root.style.colorScheme = light.dark ? "dark" : "light";
  root.dataset.night = light.dark ? "true" : "false";
  const metas = document.querySelectorAll('meta[name="theme-color"]');
  for (let i = 0; i < metas.length; i++) metas[i].setAttribute("content", light.vars["--sky-wash"]);
  document.dispatchEvent(new CustomEvent("sky-light", { detail: light }));
}

export type SkyContext = {
  /** The instant to light for; null means now. `?sky=<ISO time>` pins it
   * (and stops the refresh). */
  at: Date | null;
  /** Cloud cover 0..1: `?clouds=` if given, else the last fetched value
   * (sky-refresh.tsx keeps it in sessionStorage for the next page), else 0. */
  clouds: number;
};

/** What the page is lit for; self-contained. */
export function skyContext(): SkyContext {
  const out: SkyContext = { at: null, clouds: 0 };
  try {
    const params = new URLSearchParams(location.search);
    const at = params.get("sky");
    if (at && !isNaN(new Date(at).getTime())) out.at = new Date(at);
    const clouds = params.get("clouds");
    if (clouds !== null && !isNaN(Number(clouds))) out.clouds = Math.min(Math.max(Number(clouds), 0), 1);
    else {
      const kept = JSON.parse(sessionStorage.getItem("sky-clouds") || "null");
      if (kept && Date.now() - kept.at < 3_600_000) out.clouds = kept.cover;
    }
  } catch {
    // no location or storage (tests, private windows): clear sky, now
  }
  return out;
}

/** Light the document for its context; self-contained. The three
 * numbers are the place and the one before them the instant. */
export function lightDocument(latitude: number, longitude: number): void {
  const context = skyContext();
  const at = context.at || new Date();
  applyPageLight(pageLight(sunPosition(at, latitude, longitude), moonPosition(at, latitude, longitude), context.clouds));
}

/** The script that lights the page before the stylesheet's first paint,
 * so a night-time reader never sees it white. Served as /sky-light.js
 * (app/sky-light.js/route.ts) and loaded blocking from the head. */
export function pageLightScript(): string {
  // Each function is declared under the name the build gave it (the
  // minifier shortens them, consistently across the module), so the
  // references between them, and the call at the end, line up.
  const parts = [sunPosition, moonPosition, pageLight, applyPageLight, skyContext, lightDocument];
  return `(function(){${parts.map((f) => `var ${f.name}=${f.toString()};`).join("")}try{${lightDocument.name}(${SEBASTOPOL_LAT},${SEBASTOPOL_LON})}catch(e){}})();`;
}
