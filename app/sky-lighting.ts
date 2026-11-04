/**
 * The page lit by the sky over Sebastopol right now.
 *
 * White by day. Through the evening the page goes pale blue, light blue,
 * dark blue and then night, when the stars come out; the morning is the
 * same run backwards. The sun's altitude picks a place between those
 * keyframes, but not the real altitude: by that, the evening's colour is
 * spent in an hour and the night after it holds still for nine, so
 * feltSun() times them from today's sunrise and sunset instead, four
 * hours each side, the way pengzhe.ng stretches its twilight. The paper
 * steps across the light/dark switch rather than lingering at it, so ink
 * always reads on it. Every ink is then solved from the sky rather
 * than chosen: text, secondary text, dim text and the link colour each
 * take the sky's hue, faintly, at the lightness that gives a set contrast
 * against the paper and the wash. So a dozen colours move together, and
 * none can drift out of contrast.
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

/**
 * The sun as the page feels it; self-contained but for sunPosition.
 *
 * By altitude alone the evening's colour is spent unevenly: the slide from
 * dusk toward night (where the paper dims to the light/dark switch) is over
 * in about eighty minutes, and the night after it holds still for nine
 * hours. So the sky follows the clock instead, timed from today's sunrise
 * or sunset, along a schedule of minutes from it to the altitude the page
 * shows: a long dusk borrowed from the night, and dawn its mirror image.
 * The bearing is the real one (it says which side of the day this is), as
 * is the lowest the sun gets tonight.
 */
export function feltSun(
  date: Date,
  latitude: number,
  longitude: number,
  // Minutes toward night from sunset (or before sunrise), and the altitude
  // shown then: four hours each side, as pengzhe.ng does, so the midday
  // frame holds about two and a half hours in November rather than five.
  schedule: number[][] = [[-240, 25], [-90, 10], [0, 0], [75, -9], [240, -25]],
): SunPosition {
  const real = sunPosition(date, latitude, longitude);
  // The nearest sunrise (morning side) or sunset (evening side): where the
  // altitude crosses zero going the right way, found on ten-minute steps
  // within fourteen hours and refined by halving.
  const rising = real.bearing < 180;
  const altAt = (ms: number) => sunPosition(new Date(ms), latitude, longitude).altitude;
  const now = date.getTime(), step = 600_000;
  let event = NaN;
  for (let k = 0; k < 84 && isNaN(event); k++) {
    for (const sign of [1, -1]) {
      const a = now + sign * k * step, b = a + step;
      const fa = altAt(a), fb = altAt(b);
      if (rising ? fa < 0 && fb >= 0 : fa >= 0 && fb < 0) {
        let lo = a, hi = b;
        for (let n = 0; n < 12; n++) {
          const mid = (lo + hi) / 2;
          if ((altAt(mid) < 0) === (fa < 0)) lo = mid; else hi = mid;
        }
        event = (lo + hi) / 2;
        break;
      }
    }
  }
  // A polar day or night has no event: the real sun it is.
  if (isNaN(event)) return real;
  // Minutes toward night: after sunset, or before sunrise.
  const minutes = ((rising ? event - now : now - event) / 60_000);
  let altitude: number;
  const first = schedule[0], last = schedule[schedule.length - 1];
  // Beyond the schedule the felt sun moves as the real one does, from where
  // the schedule left it, so the stars' timetable carries on unbroken.
  const realAt = (m: number) => altAt(rising ? event - m * 60_000 : event + m * 60_000);
  if (minutes <= first[0]) altitude = first[1] + (real.altitude - realAt(first[0]));
  else if (minutes >= last[0]) altitude = last[1] + (real.altitude - realAt(last[0]));
  else {
    let i = 0;
    while (minutes > schedule[i + 1][0]) i++;
    const [m0, a0] = schedule[i], [m1, a1] = schedule[i + 1];
    altitude = a0 + ((minutes - m0) / (m1 - m0)) * (a1 - a0);
  }
  return { altitude, bearing: real.bearing, lowest: real.lowest };
}

/** Colour tokens as CSS values, keyed by variable name; whether the page
 * counts as dark; how bright it is, 0 (night) to 1 (full day), which
 * anything else lit by the sky (the pouch) follows; the sun's
 * altitude in degrees, with the lowest it reaches tonight, which is the
 * stars' timetable; and how much moonlight there is, 0 to 1, which
 * washes the faint stars out. */
export type PageLight = {
  vars: Record<string, string>;
  dark: boolean;
  adapted: number;
  altitude: number;
  lowest: number;
  moon: number;
};

/**
 * The sky for this sun and moon, and the inks solved from it;
 * self-contained.
 */
export function pageLight(
  sun: { altitude: number; bearing: number; lowest: number },
  moon: { altitude: number; fraction: number } = { altitude: -90, fraction: 0 },
): PageLight {
  type Rgb = [number, number, number];
  type Lch = [number, number, number];
  const clamp = (x: number, lo: number, hi: number) => Math.min(Math.max(x, lo), hi);
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

  // White by day; through the evening a pale blue, a light blue, a dark
  // blue, and night; the morning is the same run backwards. Each key is a
  // felt altitude, the wash at the top of the page, and the paper.
  type Key = [number, string, string];
  const keys: Key[] = [
    [-25, "#050e25", "#111c34"], // night
    [-18, "#162c55", "#2a426a"], // dark blue
    [-12, "#78a3cf", "#9bbbdd"], // blue hour
    [-6, "#c0dbf4", "#d8ebfb"], // light blue
    [0, "#e4f0fb", "#f1f8fd"], // sunset
    [10, "#f7fafe", "#ffffff"], // late day
    [25, "#ffffff", "#ffffff"], // day
  ];
  const alt = clamp(sun.altitude, -25, 25);
  let k = 0;
  while (k < keys.length - 2 && alt > keys[k + 1][0]) k++;
  const t = (alt - keys[k][0]) / (keys[k + 1][0] - keys[k][0]);
  const at = (i: number): Rgb => mix(hex(keys[k][i] as string), hex(keys[k + 1][i] as string), t, true);
  const sky = at(2);
  const top = at(1);
  const rad = Math.PI / 180;
  // Dark or light by the sky's lightness, where black and white ink read
  // equally (OKLab L 0.564, at 4.5:1). A paper within the band about it is
  // pushed to the band's edge, where either ink reads at 5.5:1, so the
  // page steps across the middle instead of lingering grey on grey.
  const SWITCH = 0.564, BAND = 0.045;
  const [skyL, skyC, skyH] = lch(sky);
  const dark = skyL < SWITCH;
  const paperL = Math.abs(skyL - SWITCH) >= BAND ? skyL : SWITCH + (dark ? -BAND : BAND);
  const paper = rgb([paperL, skyC, skyH]);
  // The wash stays on the paper's side of the switch, outside the band.
  const [washL, washC, washH] = lch(at(1));
  const wash = rgb([dark ? Math.min(washL, paperL) : Math.max(washL, SWITCH + BAND), washC, washH]);
  const adapted = clamp((paperL - 0.15) / 0.835, 0, 1);

  // An ink of the sky's hue at `chroma`, as light or dark as it must be
  // to read at `ratio` against the paper, or as far as sRGB can go. White
  // has no hue, only rounding noise, which left daytime ink a warm,
  // faintly olive grey; so below a trace of chroma the ink takes the blue
  // the evening goes to.
  const [, washTrace, washHue] = lch(wash);
  const hue = washTrace > 0.01 ? washHue : (250 * Math.PI) / 180;
  const contrast = (a: Rgb, b: Rgb) => {
    const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };
  const ink = (ratio: number, chroma: number, h = hue): Rgb => {
    let lo = dark ? paperL : 0, hi = dark ? 1 : paperL;
    for (let n = 0; n < 24; n++) {
      const mid = (lo + hi) / 2;
      const c = rgb([mid, chroma, h]);
      const ok = contrast(c, paper) >= ratio && contrast(c, wash) >= ratio;
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
  // Moonlight for the stars: the lit fraction by how high the moon stands,
  // so a full moon overhead is 1 and a crescent on the horizon is nothing.
  const moonUp = moon.fraction * Math.max(Math.sin(moon.altitude * rad), 0);
  return { vars, dark, adapted, altitude: sun.altitude, lowest: sun.lowest, moon: moonUp };
}

/** Write the lit page into the document, and tell anything else lit by
 * the sky (a "sky-light" event on the document, with the light as its
 * detail; `--sky-adapted`, `--sky-moon`, `--sky-sun` and
 * `--sky-sun-lowest` on the root for CSS, which is how the stars
 * (stars.tsx, globals.css) know to come out). Self-contained. */
export function applyPageLight(light: PageLight): void {
  const root = document.documentElement;
  // Ease only changes big enough to see: a light/dark flip. A minute of
  // sun is about one level in 255 and goes in as
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
  root.style.setProperty("--sky-sun", String(Math.round(light.altitude * 100) / 100));
  root.style.setProperty("--sky-sun-lowest", String(Math.round(light.lowest * 100) / 100));
  root.style.setProperty("--sky-moon", String(Math.round(light.moon * 100) / 100));
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
};

/** What the page is lit for; self-contained. */
export function skyContext(): SkyContext {
  const out: SkyContext = { at: null };
  try {
    const params = new URLSearchParams(location.search);
    const at = params.get("sky");
    if (at && !isNaN(new Date(at).getTime())) out.at = new Date(at);
  } catch {
    // no location (tests): now
  }
  return out;
}

/** Light the document for its context; self-contained. The three
 * numbers are the place and the one before them the instant. */
export function lightDocument(latitude: number, longitude: number): void {
  const context = skyContext();
  const at = context.at || new Date();
  applyPageLight(pageLight(feltSun(at, latitude, longitude), moonPosition(at, latitude, longitude)));
}

/** The script that lights the page before the stylesheet's first paint,
 * so a night-time reader never sees it white. Served as /sky-light.js
 * (app/sky-light.js/route.ts) and loaded blocking from the head. */
export function pageLightScript(): string {
  // Each function is declared under the name the build gave it (the
  // minifier shortens them, consistently across the module), so the
  // references between them, and the call at the end, line up.
  const parts = [sunPosition, feltSun, moonPosition, pageLight, applyPageLight, skyContext, lightDocument];
  return `(function(){${parts.map((f) => `var ${f.name}=${f.toString()};`).join("")}try{${lightDocument.name}(${SEBASTOPOL_LAT},${SEBASTOPOL_LON})}catch(e){}})();`;
}
