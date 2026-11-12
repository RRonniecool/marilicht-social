import "server-only";
import { createClient, type SanityClient } from "next-sanity";
import type { EditorState, ImageRef, PageContent } from "@/lib/types";
import { normalizeContent } from "./normalize";
import type { Repository } from "./repository";

/**
 * Sanity model: one `sitePage` document.
 *   - `sitePage`         the published page visitors see
 *   - `drafts.sitePage`  the dashboard's unpublished draft (Sanity's own draft system)
 * The write token never leaves the server: this module is server-only and
 * the token is read from a non-public env var.
 */

export const SITE_DOC_ID = "sitePage";
const DRAFT_ID = `drafts.${SITE_DOC_ID}`;

const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-02-19";

function client(): SanityClient {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) throw new Error("SANITY_API_WRITE_TOKEN is not set");
  return createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion,
    token,
    useCdn: false,
    perspective: "raw",
  });
}

const IMAGE = `{ "url": asset->url, "assetId": asset->_id, alt, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height }`;

const CONTENT = `
  _id,
  _updatedAt,
  profile{ ..., logo${IMAGE}, cover${IMAGE} },
  website{ ..., previewImage${IMAGE} },
  "socials": socials[]{ "id": _key, platform, url, label },
  "products": products[]{ "id": _key, name, description, size, price, orderUrl, badge, image${IMAGE} },
  contact{ ..., "hours": hours[]{ day, open, close, closed } },
  "promotions": promotions[]{ "id": _key, kind, title, body, ctaLabel, url, active, image${IMAGE} },
  "links": links[]{ "id": _key, label, description, url },
  appearance
`;

type Doc = Record<string, unknown>;
type Fetched = Doc & { _id: string; _updatedAt: string };

/** Sanity image object from our ImageRef. Non-Sanity URLs are dropped. */
function toSanityImage(image: ImageRef | null | undefined) {
  if (!image?.assetId) return undefined;
  return { _type: "image", asset: { _type: "reference", _ref: image.assetId }, alt: image.alt ?? "" };
}

/** Drops our client-side `id`; Sanity uses `_key` for array items. */
function withoutId<T extends { id: string }>(item: T): Omit<T, "id"> {
  const copy: Partial<T> = { ...item };
  delete copy.id;
  return copy as Omit<T, "id">;
}

function toSanityContent(content: PageContent): Doc {
  const keyed = <T extends { id: string }>(items: T[], map: (item: T) => Doc) => items.map((item) => ({ _key: item.id, ...map(item) }));
  return {
    profile: { ...content.profile, logo: toSanityImage(content.profile.logo), cover: toSanityImage(content.profile.cover) },
    website: { ...content.website, previewImage: toSanityImage(content.website.previewImage) },
    socials: keyed(content.socials, ({ platform, url, label }) => ({ _type: "socialLink", platform, url, label })),
    products: keyed(content.products, (p) => ({ _type: "product", ...withoutId(p), image: toSanityImage(p.image) })),
    contact: { ...content.contact, hours: content.contact.hours.map((h) => ({ _key: `d${h.day}`, _type: "openingHours", ...h })) },
    promotions: keyed(content.promotions, (p) => ({ _type: "promotion", ...withoutId(p), image: toSanityImage(p.image) })),
    links: keyed(content.links, (l) => ({ _type: "customLink", ...withoutId(l) })),
    appearance: content.appearance,
  };
}

const strip = <T,>(doc: T): T => JSON.parse(JSON.stringify(doc));

export function createSanityRepository(): Repository {
  const sanity = client();

  return {
    kind: "sanity",

    async getPublishedPage() {
      const doc = await sanity.fetch<Fetched | null>(`*[_id == $id][0]{ ${CONTENT} }`, { id: SITE_DOC_ID }, { perspective: "published" });
      return doc ? { content: normalizeContent(doc), publishedAt: doc._updatedAt } : null;
    },

    async getEditorState(): Promise<EditorState> {
      const docs = await sanity.fetch<Fetched[]>(`*[_id in [$pub, $draft]]{ ${CONTENT} }`, { pub: SITE_DOC_ID, draft: DRAFT_ID });
      const pub = docs.find((d) => d._id === SITE_DOC_ID);
      const draft = docs.find((d) => d._id === DRAFT_ID);
      const published = pub ? normalizeContent(pub) : null;
      return {
        draft: draft ? normalizeContent(draft) : (published ?? normalizeContent(null)),
        published,
        hasUnpublishedChanges: Boolean(draft) || !published,
        draftUpdatedAt: draft?._updatedAt,
        publishedAt: pub?._updatedAt,
      };
    },

    async saveDraft(content) {
      const doc = await sanity.createOrReplace(strip({ _id: DRAFT_ID, _type: "sitePage", ...toSanityContent(content) }));
      return { updatedAt: doc._updatedAt };
    },

    async publish() {
      const draft = await sanity.getDocument(DRAFT_ID);
      const publishedAt = new Date().toISOString();
      if (draft) {
        const { _id, _rev, _createdAt, _updatedAt, ...body } = draft;
        void _id;
        void _rev;
        void _createdAt;
        void _updatedAt;
        await sanity.transaction().createOrReplace({ ...body, _id: SITE_DOC_ID, _type: "sitePage" }).delete(DRAFT_ID).commit();
      }
      return { publishedAt };
    },

    async discardDraft() {
      await sanity.delete(DRAFT_ID);
    },

    async uploadImage(file: File): Promise<ImageRef> {
      const asset = await sanity.assets.upload("image", Buffer.from(await file.arrayBuffer()), {
        filename: file.name,
        contentType: file.type,
      });
      return {
        url: asset.url,
        assetId: asset._id,
        alt: "",
        width: asset.metadata?.dimensions?.width,
        height: asset.metadata?.dimensions?.height,
      };
    },
  };
}
