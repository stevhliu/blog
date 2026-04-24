import { readFileSync } from "fs";
import { join } from "path";

const fontsDir = join(process.cwd(), "fonts");
const publicDir = join(process.cwd(), "public");

export function font(fontFamily: string) {
  return { fontFamily };
}

export function loadGeistFont(filename: string) {
  return readFileSync(join(fontsDir, filename));
}

export function loadPublicImageDataUrl(pathname: string, mimeType: string) {
  const data = readFileSync(join(publicDir, pathname));
  return `data:${mimeType};base64,${data.toString("base64")}`;
}
