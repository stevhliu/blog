import { Caption } from "./caption";
import NextImage from "next/image";

export async function Image({
  src,
  alt: originalAlt,
  width = null,
  height = null,
  className,
}: {
  src: string;
  alt?: string;
  width: number | null;
  height: number | null;
  className?: string;
}) {
  const isDataImage = src.startsWith("data:");

  let alt: string | null = null;
  let dividedBy = 100;

  if ("string" === typeof originalAlt) {
    const match = originalAlt.match(/(.*) (\[(\d+)%\])?$/);
    if (match != null) {
      alt = match[1];
      dividedBy = match[3] ? parseInt(match[3]) : 100;
    }
  } else {
    alt = originalAlt ?? null;
  }

  const factor = dividedBy / 100;

  if (isDataImage) {
    /* eslint-disable @next/next/no-img-element */
    return <img src={src} alt={originalAlt ?? ""} />;
  }

  if (width === null || height === null) {
    return (
      <span className="my-5 flex flex-col items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt ?? ""}
          style={{ width: `${factor * 100}%` }}
          className="h-auto"
        />

        {alt && <Caption>{alt}</Caption>}
      </span>
    );
  } else {
    return (
      <span className="my-5 flex flex-col items-center">
        <NextImage
          width={width * factor}
          height={height * factor}
          alt={alt ?? ""}
          src={src}
          unoptimized={src.endsWith(".gif")}
          className={className}
        />

        {alt && <Caption>{alt}</Caption>}
      </span>
    );
  }
}
