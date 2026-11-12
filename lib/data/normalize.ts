import { SITE_NAME } from "@/lib/config";
import { starterContent } from "@/lib/site";
import { pageContentSchema, type PageContent } from "@/lib/types";

type Loose = Record<string, unknown> | null | undefined;

/**
 * Coerces stored content (which may predate schema changes or be partially
 * filled in the Studio) into a complete PageContent. Missing sections fall
 * back to defaults so the public page never crashes on bad data.
 */
export function normalizeContent(raw: unknown): PageContent {
  const base = starterContent();
  const input = (raw ?? {}) as Record<string, Loose>;
  const merged = {
    ...base,
    ...input,
    profile: { ...base.profile, ...(input.profile ?? {}) },
    website: { ...base.website, ...(input.website ?? {}) },
    contact: { ...base.contact, ...(input.contact ?? {}) },
    appearance: { ...base.appearance, ...(input.appearance ?? {}) },
    socials: Array.isArray(input.socials) ? input.socials : base.socials,
    products: Array.isArray(input.products) ? input.products : base.products,
    promotions: Array.isArray(input.promotions) ? input.promotions : base.promotions,
    links: Array.isArray(input.links) ? input.links : base.links,
  };
  stripNulls(merged);
  const parsed = pageContentSchema.safeParse(merged);
  if (parsed.success) return parsed.data;
  // Fall back field by field: keep what validates, default the rest.
  const appearance = pageContentSchema.shape.appearance.safeParse(merged.appearance);
  return {
    ...base,
    profile: { ...base.profile, name: String(merged.profile?.name || SITE_NAME) },
    appearance: appearance.success ? appearance.data : base.appearance,
  };
}

/** GROQ returns null for unset fields; zod defaults only apply to undefined. */
function stripNulls(value: unknown) {
  if (Array.isArray(value)) value.forEach(stripNulls);
  else if (value && typeof value === "object") {
    for (const [key, v] of Object.entries(value)) {
      if (v === null && !["logo", "cover", "previewImage", "image"].includes(key)) {
        delete (value as Record<string, unknown>)[key];
      } else stripNulls(v);
    }
  }
}
