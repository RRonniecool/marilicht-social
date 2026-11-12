import "server-only";
import { isLocalStore, isSanityConfigured } from "@/lib/config";
import type { EditorState, ImageRef, PageContent, PublishedPage } from "@/lib/types";

/**
 * Storage contract for the site's content, implemented by Sanity
 * (production) and a local JSON store (development without Sanity keys).
 * Every method is server-only; callers check admin access first
 * (lib/auth/guards.ts).
 */
export interface Repository {
  readonly kind: "sanity" | "local";
  /** What visitors see. Null until the first publish. */
  getPublishedPage(): Promise<PublishedPage | null>;
  getEditorState(): Promise<EditorState>;
  saveDraft(content: PageContent): Promise<{ updatedAt: string }>;
  publish(): Promise<{ publishedAt: string }>;
  discardDraft(): Promise<void>;
  uploadImage(file: File): Promise<ImageRef>;
}

let repo: Promise<Repository> | null = null;

export function getRepository(): Promise<Repository> {
  if (!repo) {
    if (isSanityConfigured) repo = import("./sanity-repository").then((m) => m.createSanityRepository());
    else if (isLocalStore) repo = import("./local-repository").then((m) => m.createLocalRepository());
    // Production without Sanity: fail closed rather than serve local demo data.
    else return Promise.reject(new Error("Sanity is not configured. Set NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET and SANITY_API_WRITE_TOKEN."));
  }
  return repo;
}
