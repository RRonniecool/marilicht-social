import type { ImageRef } from "@/lib/types";

/**
 * Sanity's CDN resizes and re-encodes on the fly via query params, so we
 * request roughly the rendered size (×2 for retina). Other URLs pass through.
 */
export function imageSrc(image: ImageRef | null | undefined, width?: number) {
  if (!image?.url) return "";
  if (!width || !image.url.includes("cdn.sanity.io")) return image.url;
  const url = new URL(image.url);
  url.searchParams.set("w", String(Math.round(width * 2)));
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "max");
  return url.toString();
}
