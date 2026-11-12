/**
 * Copies the Marilicht demo content into your Sanity dataset as the
 * published `sitePage` document, uploading the demo artwork as Sanity image
 * assets. Run once after connecting Sanity, then edit from /dashboard.
 *
 *   node scripts/seed-sanity.ts
 *
 * Reads NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET and
 * SANITY_API_WRITE_TOKEN from .env.local. Refuses to overwrite an existing
 * page unless you pass --force.
 */
import { createClient } from "@sanity/client";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { seedContent } from "../lib/data/seed.ts";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !dataset || !token) {
  console.error("Set NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET and SANITY_API_WRITE_TOKEN in .env.local first.");
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion: "2025-02-19", useCdn: false });
const uploaded = new Map<string, string>();

type Img = { url: string; alt?: string } | null | undefined;

async function image(img: Img) {
  if (!img?.url) return undefined;
  let id = uploaded.get(img.url);
  if (!id) {
    const file = path.join(process.cwd(), "public", img.url);
    const asset = await client.assets.upload("image", readFileSync(file), { filename: path.basename(file), contentType: "image/svg+xml" });
    id = asset._id;
    uploaded.set(img.url, id);
    console.log("  uploaded", img.url);
  }
  return { _type: "image", asset: { _type: "reference", _ref: id }, alt: img.alt ?? "" };
}

async function main() {
  const existing = await client.getDocument("sitePage");
  if (existing && !process.argv.includes("--force")) {
    console.error("A published sitePage already exists. Re-run with --force to replace it with the demo content.");
    process.exit(1);
  }

  const c = seedContent;
  console.log(`Seeding ${c.profile.name} into ${projectId}/${dataset}`);
  const page = {
    _id: "sitePage",
    _type: "sitePage",
    profile: { ...c.profile, logo: await image(c.profile.logo), cover: await image(c.profile.cover) },
    website: { ...c.website, previewImage: await image(c.website.previewImage) },
    socials: c.socials.map(({ id, ...s }) => ({ _key: id, _type: "socialLink", ...s })),
    products: await Promise.all(c.products.map(async ({ id, image: img, ...p }) => ({ _key: id, _type: "product", ...p, image: await image(img) }))),
    promotions: await Promise.all(c.promotions.map(async ({ id, image: img, ...p }) => ({ _key: id, _type: "promotion", ...p, image: await image(img) }))),
    links: c.links.map(({ id, ...l }) => ({ _key: id, _type: "customLink", ...l })),
    contact: { ...c.contact, hours: c.contact.hours.map((h) => ({ _key: `d${h.day}`, _type: "openingHours", ...h })) },
    appearance: c.appearance,
  };

  await client.createOrReplace(JSON.parse(JSON.stringify(page)));
  console.log("Done. Open /dashboard to replace the demo content with your own.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
