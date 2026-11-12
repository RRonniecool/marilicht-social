import { revalidateTag } from "next/cache";
import { type NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { SITE_TAG } from "@/lib/data/public";

/**
 * Sanity webhook: when the page is edited directly in the Studio, refresh
 * the cached public page. Publishing from the dashboard already does this
 * itself. Configure in sanity.io/manage → API → Webhooks (filter
 * `_type == "sitePage"`) and put the same secret in SANITY_REVALIDATE_SECRET.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return new Response("Webhook secret not configured", { status: 500 });
  const { isValidSignature } = await parseBody(request, secret, true);
  if (!isValidSignature) return new Response("Invalid signature", { status: 401 });
  revalidateTag(SITE_TAG, "max");
  return Response.json({ revalidated: true });
}
