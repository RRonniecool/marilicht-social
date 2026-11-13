import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { headers } from "next/headers";
import { createClient, type SanityClient } from "next-sanity";
import { SITE_URL } from "@/lib/config";
import type { EditorState, ImageRef, PageContent } from "@/lib/types";
import { normalizeContent } from "./normalize";
import type { Repository } from "./repository";
import { seedContent } from "./seed";

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

type ResolveImage = (image: ImageRef | null | undefined) => Promise<Doc | undefined>;

/** Only the bundled sample artwork may be imported this way (no arbitrary URLs). */
const SAMPLE_IMAGE = /^\/demo\/marilicht\/[a-z0-9.-]+\.svg$/;

/** Bytes of a bundled sample image: from disk when available, else from this deployment over HTTP. */
async function loadSampleImage(url: string): Promise<Buffer> {
  try {
    return await readFile(path.join(process.cwd(), "public", url));
  } catch {
    // Serverless hosts don't always ship /public alongside functions.
    let origin = SITE_URL;
    try {
      const h = await headers();
      const host = h.get("x-forwarded-host") ?? h.get("host");
      if (host) origin = `${h.get("x-forwarded-proto") ?? "https"}://${host}`;
    } catch {
      /* not in a request: fall back to the public site */
    }
    const response = await fetch(new URL(url, origin));
    if (!response.ok) throw new Error(`Couldn't load sample image ${url} (${response.status})`);
    return Buffer.from(await response.arrayBuffer());
  }
}

/** Drops our client-side `id`; Sanity uses `_key` for array items. */
function withoutId<T extends { id: string }>(item: T): Omit<T, "id"> {
  const copy: Partial<T> = { ...item };
  delete copy.id;
  return copy as Omit<T, "id">;
}

async function toSanityContent(content: PageContent, toImage: ResolveImage): Promise<Doc> {
  const keyed = <T extends { id: string }>(items: T[], map: (item: T) => Promise<Doc> | Doc) =>
    Promise.all(items.map(async (item) => ({ _key: item.id, ...(await map(item)) })));
  return {
    profile: { ...content.profile, logo: await toImage(content.profile.logo), cover: await toImage(content.profile.cover) },
    website: { ...content.website, previewImage: await toImage(content.website.previewImage) },
    socials: await keyed(content.socials, ({ platform, url, label }) => ({ _type: "socialLink", platform, url, label })),
    products: await keyed(content.products, async (p) => ({ _type: "product", ...withoutId(p), image: await toImage(p.image) })),
    contact: { ...content.contact, hours: content.contact.hours.map((h) => ({ _key: `d${h.day}`, _type: "openingHours", ...h })) },
    promotions: await keyed(content.promotions, async (p) => ({ _type: "promotion", ...withoutId(p), image: await toImage(p.image) })),
    links: await keyed(content.links, (l) => ({ _type: "customLink", ...withoutId(l) })),
    appearance: content.appearance,
  };
}

const strip = <T,>(doc: T): T => JSON.parse(JSON.stringify(doc));

export function createSanityRepository(): Repository {
  const sanity = client();

  // Sample artwork (/demo/marilicht/*.svg) becomes a real Sanity asset the
  // first time the owner saves a draft built from the sample content, so the
  // pictures survive. Sanity de-duplicates identical files, and this cache
  // avoids re-uploading on every autosave.
  const sampleAssets = new Map<string, Promise<string>>();
  function sampleAssetId(url: string) {
    let pending = sampleAssets.get(url);
    if (!pending) {
      pending = loadSampleImage(url)
        .then((bytes) => sanity.assets.upload("image", bytes, { filename: path.basename(url), contentType: "image/svg+xml" }))
        .then((asset) => asset._id);
      pending.catch(() => sampleAssets.delete(url));
      sampleAssets.set(url, pending);
    }
    return pending;
  }

  /** Sanity image object from our ImageRef. Unknown non-Sanity URLs are dropped. */
  const toImage: ResolveImage = async (image) => {
    if (!image?.url && !image?.assetId) return undefined;
    const ref = image.assetId ?? (SAMPLE_IMAGE.test(image.url) ? await sampleAssetId(image.url) : undefined);
    if (!ref) return undefined;
    return { _type: "image", asset: { _type: "reference", _ref: ref }, alt: image.alt ?? "" };
  };

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
        // Nothing saved yet: start from the sample page so the owner edits, rather than builds, it.
        draft: draft ? normalizeContent(draft) : (published ?? normalizeContent(seedContent)),
        published,
        hasUnpublishedChanges: Boolean(draft) || !published,
        draftUpdatedAt: draft?._updatedAt,
        publishedAt: pub?._updatedAt,
      };
    },

    async saveDraft(content) {
      const doc = await sanity.createOrReplace(strip({ _id: DRAFT_ID, _type: "sitePage", ...(await toSanityContent(content, toImage)) }));
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
