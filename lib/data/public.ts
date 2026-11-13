import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { PageContent } from "@/lib/types";
import { normalizeContent } from "./normalize";
import { getRepository } from "./repository";
import { seedContent } from "./seed";

export const SITE_TAG = "site";

/**
 * The published page. Cached for the long term and tagged, so a publish
 * (or a Sanity webhook) refreshes it instantly without a redeploy.
 */
export async function getPublishedPage() {
  "use cache";
  cacheLife("max");
  cacheTag(SITE_TAG);
  const repo = await getRepository();
  return repo.getPublishedPage();
}

export type PublicPage = { content: PageContent; publishedAt?: string; isSample: boolean };

/**
 * What visitors see: the published page when one exists, otherwise the
 * sample Marilicht page, so the site never looks empty. The sample is only
 * rendered, never stored; real published content always takes priority.
 */
export async function getPublicPage(): Promise<PublicPage> {
  const published = await getPublishedPage();
  if (published) return { ...published, isSample: false };
  return { content: normalizeContent(seedContent), isSample: true };
}
