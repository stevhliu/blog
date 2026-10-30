/**
 * The sky over Sebastopol right now, as an environment map for the pouch.
 *
 * Two parts. sunPosition() is the usual low-precision solar ephemeris
 * (good to about a quarter of a degree, which is a thirtieth of the sun's
 * hourly travel). renderSky() is single-scattering atmosphere rendering
 * after Maxime Heckel's "On rendering the sky, sunsets, and planets":
 * every direction's colour is sunlight scattered toward the eye by air
 * (Rayleigh, blue-heavy, wavelength to the fourth) and haze (Mie, grey
 * and forward-leaning), each attenuated on the way in from the sun and
 * on the way out to the eye by Beer's law over the air it crossed, with
 * ozone absorbing the middle of the spectrum so twilight goes purple.
 * The sun below the horizon isn't special-cased: its rays simply hit the
 * planet before the air, so the sky dims and reddens on its own.
 *
 * The map is small (a pouch's film doesn't resolve more) and in LDR,
 * because model-viewer only reads HDR from a .hdr URL and this one comes
 * out of a canvas. ACES tone mapping folds the sun into white.
 */

export const SEBASTOPOL = { latitude: 38.4021, longitude: -122.8239 };

// Scene units are kilometres. Coefficients per km at sea level.
const PLANET_RADIUS = 6371;
const ATMOSPHERE_HEIGHT = 100;
const RAYLEIGH_BETA = [5.8e-3, 13.5e-3, 33.1e-3];
const RAYLEIGH_SCALE_HEIGHT = 8;
const MIE_BETA = 3e-3;
const MIE_EXTINCTION = MIE_BETA * 1.1; // haze absorbs a tenth of what it scatters
const MIE_SCALE_HEIGHT = 1.2;
const MIE_G = 0.76; // how forward-leaning the haze's scattering is
const OZONE_BETA = [0.65e-3, 1.881e-3, 0.085e-3];
const OZONE_CENTRE = 25; // km; a tent-shaped layer
const OZONE_HALF_WIDTH = 15;
const SUN_INTENSITY = 20;
const SUN_RADIUS = (0.53 / 2) * (Math.PI / 180); // angular, radians
const VIEW_STEPS = 12;
const LIGHT_STEPS = 4;
// A ray grazing the horizon crosses hundreds of km of the densest air;
// capped, as the article does, so the horizon row is a bright band rather
// than a one-pixel line of pure haze.
const VIEW_DISTANCE = 200;
// Not in the model: starlight and the glow of a town, so a night sky isn't
// a black hole. About a hundredth of a clear noon, blue like night is.
const NIGHT_FLOOR = [0.004, 0.006, 0.012];
const GROUND_ALBEDO = 0.3;

export type SunPosition = { elevation: number; azimuth: number };

/**
 * Where the sun is from a place at an instant: elevation above the
 * horizon and azimuth from north through east, both in radians.
 */
export function sunPosition(date: Date, latitude: number, longitude: number): SunPosition {
  const rad = Math.PI / 180;
  const days = date.getTime() / 86_400_000 - 10957.5; // since J2000.0
  const meanAnomaly = rad * ((357.529 + 0.98560028 * days) % 360);
  const meanLongitude = 280.459 + 0.98564736 * days;
  const eclipticLongitude =
    rad * (meanLongitude + 1.915 * Math.sin(meanAnomaly) + 0.02 * Math.sin(2 * meanAnomaly));
  const obliquity = rad * (23.439 - 0.00000036 * days);
  const rightAscension = Math.atan2(Math.cos(obliquity) * Math.sin(eclipticLongitude), Math.cos(eclipticLongitude));
  const declination = Math.asin(Math.sin(obliquity) * Math.sin(eclipticLongitude));
  const siderealHours = 18.697374558 + 24.06570982441908 * days + longitude / 15;
  const hourAngle = rad * 15 * siderealHours - rightAscension;
  const lat = rad * latitude;
  const up = Math.sin(lat) * Math.sin(declination) + Math.cos(lat) * Math.cos(declination) * Math.cos(hourAngle);
  const north = Math.cos(lat) * Math.sin(declination) - Math.sin(lat) * Math.cos(declination) * Math.cos(hourAngle);
  const east = -Math.cos(declination) * Math.sin(hourAngle);
  return { elevation: Math.asin(up), azimuth: Math.atan2(east, north) };
}

type Vec = [number, number, number];

/**
 * The sun's direction in the pouch's world. The reader looks north at
 * the pouch, so its front faces south: +x is east, +y up, -z north. The
 * sun crosses in front of the bag through the day, rising on the right.
 */
export function sunVector({ elevation, azimuth }: SunPosition): Vec {
  const flat = Math.cos(elevation);
  return [Math.sin(azimuth) * flat, Math.sin(elevation), -Math.cos(azimuth) * flat];
}

/** Distance along a ray from `origin` to where it leaves a sphere about
 * the origin of radius r, or -1 if it never enters. Ignores the entry. */
function exitDistance(origin: Vec, dir: Vec, r: number): number {
  const b = origin[0] * dir[0] + origin[1] * dir[1] + origin[2] * dir[2];
  const c = origin[0] ** 2 + origin[1] ** 2 + origin[2] ** 2 - r * r;
  const disc = b * b - c;
  if (disc < 0) return -1;
  return -b + Math.sqrt(disc);
}

/** Distance to the first hit on a sphere ahead of the ray, or -1. */
function entryDistance(origin: Vec, dir: Vec, r: number): number {
  const b = origin[0] * dir[0] + origin[1] * dir[1] + origin[2] * dir[2];
  const c = origin[0] ** 2 + origin[1] ** 2 + origin[2] ** 2 - r * r;
  const disc = b * b - c;
  if (disc < 0) return -1;
  const t = -b - Math.sqrt(disc);
  return t > 0 ? t : -1;
}

function densities(point: Vec): [number, number, number] {
  const h = Math.max(Math.hypot(point[0], point[1], point[2]) - PLANET_RADIUS, 0);
  return [
    Math.exp(-h / RAYLEIGH_SCALE_HEIGHT),
    Math.exp(-h / MIE_SCALE_HEIGHT),
    Math.max(1 - Math.abs(h - OZONE_CENTRE) / OZONE_HALF_WIDTH, 0),
  ];
}

/** Transmittance from a point out to the sun: 0 where the planet is in
 * the way, otherwise Beer's law over the air along the way. */
function sunTransmittance(point: Vec, sun: Vec): Vec {
  if (entryDistance(point, sun, PLANET_RADIUS) > 0) return [0, 0, 0];
  const length = exitDistance(point, sun, PLANET_RADIUS + ATMOSPHERE_HEIGHT);
  const step = length / LIGHT_STEPS;
  let air = 0, haze = 0, ozone = 0;
  for (let i = 0; i < LIGHT_STEPS; i++) {
    const t = (i + 0.5) * step;
    const [r, m, o] = densities([point[0] + sun[0] * t, point[1] + sun[1] * t, point[2] + sun[2] * t]);
    air += r * step;
    haze += m * step;
    ozone += o * step;
  }
  return [0, 1, 2].map((c) =>
    Math.exp(-(RAYLEIGH_BETA[c] * air + MIE_EXTINCTION * haze + OZONE_BETA[c] * ozone)),
  ) as Vec;
}

/** Light arriving at the eye from one direction of sky, in linear units
 * before tone mapping. Directions below the horizon see the ground. */
function skyRadiance(dir: Vec, sun: Vec, eye: Vec): Vec {
  const toGround = entryDistance(eye, dir, PLANET_RADIUS);
  const length = Math.min(
    toGround > 0 ? toGround : exitDistance(eye, dir, PLANET_RADIUS + ATMOSPHERE_HEIGHT),
    VIEW_DISTANCE,
  );
  const step = length / VIEW_STEPS;
  const mu = dir[0] * sun[0] + dir[1] * sun[1] + dir[2] * sun[2];
  const phaseR = (3 / (16 * Math.PI)) * (1 + mu * mu);
  const g2 = MIE_G * MIE_G;
  const phaseM =
    (3 * (1 - g2) * (1 + mu * mu)) / (8 * Math.PI * (2 + g2) * Math.pow(Math.max(1 + g2 - 2 * MIE_G * mu, 1e-4), 1.5));

  let air = 0, haze = 0, ozone = 0;
  const sumR: Vec = [0, 0, 0], sumM: Vec = [0, 0, 0];
  for (let i = 0; i < VIEW_STEPS; i++) {
    const t = (i + 0.5) * step;
    const point: Vec = [eye[0] + dir[0] * t, eye[1] + dir[1] * t, eye[2] + dir[2] * t];
    const [r, m, o] = densities(point);
    air += r * step;
    haze += m * step;
    ozone += o * step;
    const fromSun = sunTransmittance(point, sun);
    for (let c = 0; c < 3; c++) {
      const toEye = Math.exp(-(RAYLEIGH_BETA[c] * air + MIE_EXTINCTION * haze + OZONE_BETA[c] * ozone));
      sumR[c] += r * fromSun[c] * toEye * step;
      sumM[c] += m * fromSun[c] * toEye * step;
    }
  }
  const colour = [0, 1, 2].map(
    (c) => SUN_INTENSITY * (phaseR * RAYLEIGH_BETA[c] * sumR[c] + phaseM * MIE_BETA * sumM[c]) + NIGHT_FLOOR[c],
  ) as Vec;

  if (toGround > 0) {
    // Ground: a flat, grey-ish plane lit by the sun and the sky. The sun's
    // share is its transmittance at the ground times how high it stands;
    // the sky's share is taken as the zenith's colour. Both then dim by
    // the albedo, and the air in front adds what it scattered (colour).
    const hit: Vec = [eye[0] + dir[0] * toGround, eye[1] + dir[1] * toGround, eye[2] + dir[2] * toGround];
    const sunHere = sunTransmittance(hit, sun);
    const cosine = Math.max(sun[1], 0);
    const zenith = skyRadiance([0, 1, 0], sun, eye);
    for (let c = 0; c < 3; c++) {
      const toEye = Math.exp(-(RAYLEIGH_BETA[c] * air + MIE_EXTINCTION * haze + OZONE_BETA[c] * ozone));
      colour[c] += GROUND_ALBEDO * (SUN_INTENSITY * sunHere[c] * cosine * 0.1 + zenith[c]) * toEye;
    }
    return colour;
  }
  // The sun's disc, seen through the air in front of it.
  const disc = smoothstep(Math.cos(SUN_RADIUS * 3), Math.cos(SUN_RADIUS), mu);
  if (disc > 0) {
    const fromSun = sunTransmittance(eye, sun);
    for (let c = 0; c < 3; c++) colour[c] += disc * SUN_INTENSITY * fromSun[c];
  }
  return colour;
}

function smoothstep(a: number, b: number, x: number): number {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
}

/** ACES filmic curve (Narkowicz's fit), then sRGB gamma, to a byte. */
function toneMap(x: number): number {
  const mapped = (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14);
  return Math.round(255 * Math.pow(Math.min(Math.max(mapped, 0), 1), 1 / 2.2));
}

/**
 * The sky as equirectangular RGBA pixels, width x height, laid out the
 * way three.js reads an environment map: the top row is straight up,
 * and a column's longitude runs from +x round through +z.
 */
export function renderSky(sun: Vec, width: number, height: number): Uint8ClampedArray<ArrayBuffer> {
  const eye: Vec = [0, PLANET_RADIUS + 0.002, 0]; // two metres up
  const pixels = new Uint8ClampedArray(new ArrayBuffer(width * height * 4));
  for (let row = 0; row < height; row++) {
    const elevation = (0.5 - (row + 0.5) / height) * Math.PI;
    const flat = Math.cos(elevation);
    for (let col = 0; col < width; col++) {
      const longitude = ((col + 0.5) / width - 0.5) * 2 * Math.PI;
      const dir: Vec = [Math.cos(longitude) * flat, Math.sin(elevation), Math.sin(longitude) * flat];
      const colour = skyRadiance(dir, sun, eye);
      const at = (row * width + col) * 4;
      pixels[at] = toneMap(colour[0]);
      pixels[at + 1] = toneMap(colour[1]);
      pixels[at + 2] = toneMap(colour[2]);
      pixels[at + 3] = 255;
    }
  }
  return pixels;
}

export const SKY_WIDTH = 256;
export const SKY_HEIGHT = 128;

/** The sky over Sebastopol at `date`, as an image URL model-viewer can
 * take for environment-image, and the sun's elevation in degrees. Browser
 * only: it draws through a canvas. */
export function skyEnvironment(date: Date): { url: string; elevation: number } {
  const position = sunPosition(date, SEBASTOPOL.latitude, SEBASTOPOL.longitude);
  const pixels = renderSky(sunVector(position), SKY_WIDTH, SKY_HEIGHT);
  const canvas = document.createElement("canvas");
  canvas.width = SKY_WIDTH;
  canvas.height = SKY_HEIGHT;
  canvas.getContext("2d")!.putImageData(new ImageData(pixels, SKY_WIDTH, SKY_HEIGHT), 0, 0);
  return { url: canvas.toDataURL("image/png"), elevation: (position.elevation * 180) / Math.PI };
}
