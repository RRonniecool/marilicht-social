import { defineArrayMember, defineField, defineType } from "sanity";

const image = (name: string, title?: string) =>
  defineField({ name, title, type: "image", options: { hotspot: true }, fields: [defineField({ name: "alt", type: "string" })] });

/**
 * The whole public page, as one singleton document (id "sitePage").
 * Sanity's draft system provides draft/publish: the dashboard writes
 * `drafts.sitePage`, and publishing copies it to `sitePage`. The public site
 * only ever reads the published document.
 */
export const sitePage = defineType({
  name: "sitePage",
  title: "Site page",
  type: "document",
  groups: [
    { name: "profile", title: "Profile", default: true },
    { name: "content", title: "Content" },
    { name: "contact", title: "Contact" },
    { name: "style", title: "Appearance" },
  ],
  fields: [
    defineField({
      name: "profile",
      type: "object",
      group: "profile",
      fields: [
        defineField({ name: "name", type: "string", validation: (r) => r.required() }),
        defineField({ name: "tagline", type: "string" }),
        defineField({ name: "description", type: "text", rows: 4 }),
        defineField({ name: "location", type: "string" }),
        image("logo"),
        image("cover"),
      ],
    }),
    defineField({
      name: "website",
      type: "object",
      group: "content",
      fields: [
        defineField({ name: "url", type: "string" }),
        defineField({ name: "title", type: "string" }),
        defineField({ name: "description", type: "text", rows: 2 }),
        image("previewImage", "Preview image"),
        defineField({ name: "storeUrl", title: "Online store link", type: "string" }),
        defineField({ name: "storeLabel", title: "Store button label", type: "string" }),
      ],
    }),
    defineField({ name: "socials", type: "array", group: "content", of: [defineArrayMember({ type: "socialLink" })] }),
    defineField({ name: "products", type: "array", group: "content", of: [defineArrayMember({ type: "product" })] }),
    defineField({ name: "promotions", type: "array", group: "content", of: [defineArrayMember({ type: "promotion" })] }),
    defineField({ name: "links", title: "Link buttons", type: "array", group: "content", of: [defineArrayMember({ type: "customLink" })] }),
    defineField({
      name: "contact",
      type: "object",
      group: "contact",
      fields: [
        defineField({ name: "whatsapp", type: "string" }),
        defineField({ name: "whatsappMessage", type: "string" }),
        defineField({ name: "phone", type: "string" }),
        defineField({ name: "email", type: "string" }),
        defineField({ name: "address", type: "string" }),
        defineField({ name: "mapsUrl", title: "Google Maps link", type: "string" }),
        defineField({ name: "hours", type: "array", of: [defineArrayMember({ type: "openingHours" })] }),
        defineField({ name: "hoursNote", type: "string" }),
      ],
    }),
    defineField({ name: "appearance", type: "appearance", group: "style" }),
  ],
  preview: { select: { title: "profile.name", media: "profile.logo" } },
});
