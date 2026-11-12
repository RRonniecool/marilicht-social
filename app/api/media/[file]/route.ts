import { readFile } from "node:fs/promises";
import path from "node:path";
import { isLocalStore } from "@/lib/config";
import { UPLOAD_DIR } from "@/lib/data/local-repository";

const TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
};

/** Serves images uploaded to the local development store. Always 404 in production, where Sanity's CDN serves images. */
export async function GET(_request: Request, { params }: RouteContext<"/api/media/[file]">) {
  const { file } = await params;
  const match = /^[a-z0-9]+\.([a-z0-9]+)$/i.exec(file);
  if (!isLocalStore || !match || !TYPES[match[1].toLowerCase()]) return new Response("Not found", { status: 404 });
  try {
    const body = await readFile(path.join(UPLOAD_DIR, file));
    return new Response(body, {
      headers: {
        "Content-Type": TYPES[match[1].toLowerCase()],
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
