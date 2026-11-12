"use server";

import { updateTag } from "next/cache";
import { AccessError, assertAdmin } from "@/lib/auth/guards";
import { SITE_TAG } from "@/lib/data/public";
import { getRepository } from "@/lib/data/repository";
import { pageContentSchema, type EditorState, type ImageRef, type PageContent } from "@/lib/types";

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

function failure(error: unknown): { ok: false; error: string } {
  if (error instanceof AccessError) return { ok: false, error: error.message };
  console.error(error);
  return { ok: false, error: error instanceof Error ? error.message : "Something went wrong. Try again." };
}

function validate(content: PageContent) {
  const parsed = pageContentSchema.safeParse(content);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new Error(issue ? `${issue.path.join(" › ")}: ${issue.message}` : "Some fields need attention");
  }
  return parsed.data;
}

// Every action re-checks admin access on the server: the client is never trusted.

export async function saveDraftAction(content: PageContent): Promise<ActionResult<{ updatedAt: string }>> {
  try {
    await assertAdmin();
    const repo = await getRepository();
    return { ok: true, data: await repo.saveDraft(validate(content)) };
  } catch (error) {
    return failure(error);
  }
}

export async function publishAction(content: PageContent): Promise<ActionResult<{ publishedAt: string }>> {
  try {
    await assertAdmin();
    const repo = await getRepository();
    await repo.saveDraft(validate(content));
    const result = await repo.publish();
    // The public page is cached by tag; expire it so visitors see this version now.
    updateTag(SITE_TAG);
    return { ok: true, data: result };
  } catch (error) {
    return failure(error);
  }
}

export async function discardDraftAction(): Promise<ActionResult<EditorState>> {
  try {
    await assertAdmin();
    const repo = await getRepository();
    await repo.discardDraft();
    return { ok: true, data: await repo.getEditorState() };
  } catch (error) {
    return failure(error);
  }
}

// Keep in step with serverActions.bodySizeLimit in next.config.ts (Vercel caps request bodies at 4.5 MB).
const MAX_BYTES = 4 * 1024 * 1024;

/**
 * Identifies the image from its first bytes rather than trusting the
 * browser-supplied type or file name. SVG is refused on purpose: it can
 * carry scripts.
 */
function sniffImage(bytes: Uint8Array): { type: string; ext: string } | null {
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to));
  if (bytes[0] === 0x89 && ascii(1, 4) === "PNG") return { type: "image/png", ext: "png" };
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { type: "image/jpeg", ext: "jpg" };
  if (ascii(0, 4) === "GIF8") return { type: "image/gif", ext: "gif" };
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return { type: "image/webp", ext: "webp" };
  if (ascii(4, 8) === "ftyp" && /^avi[fs]$/.test(ascii(8, 12))) return { type: "image/avif", ext: "avif" };
  return null;
}

export async function uploadImageAction(formData: FormData): Promise<ActionResult<ImageRef>> {
  try {
    await assertAdmin();
    const file = formData.get("file");
    if (!(file instanceof File)) throw new Error("Choose an image to upload");
    if (file.size > MAX_BYTES) throw new Error("Images must be 4 MB or smaller");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const kind = sniffImage(bytes);
    if (!kind) throw new Error("Use a PNG, JPG, WebP, GIF or AVIF image");
    const base = file.name.replace(/\.[^.]*$/, "").replace(/[^\w-]+/g, "-").slice(0, 60) || "image";
    const clean = new File([bytes], `${base}.${kind.ext}`, { type: kind.type });
    const repo = await getRepository();
    return { ok: true, data: await repo.uploadImage(clean) };
  } catch (error) {
    return failure(error);
  }
}
