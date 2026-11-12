import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getRepository } from "./repository";

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
