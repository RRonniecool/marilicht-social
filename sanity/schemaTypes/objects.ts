import { defineArrayMember, defineField, defineType } from "sanity";

const HEX = /^#[0-9a-fA-F]{6}$/;

export const socialLink = defineType({
  name: "socialLink",
  title: "Social link",
  type: "object",
  fields: [
    defineField({
      name: "platform",
      type: "string",
      options: { list: ["instagram", "tiktok", "facebook", "youtube", "whatsapp", "x", "snapchat", "linkedin", "telegram", "custom"] },
      validation: (r) => r.required(),
    }),
    defineField({ name: "url", type: "string", validation: (r) => r.required() }),
    defineField({ name: "label", type: "string", description: "Only used for custom links" }),
  ],
  preview: { select: { title: "platform", subtitle: "url" } },
});

export const product = defineType({
  name: "product",
  type: "object",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required().max(80) }),
    defineField({ name: "image", type: "image", options: { hotspot: true }, fields: [defineField({ name: "alt", type: "string" })] }),
    defineField({ name: "size", type: "string" }),
    defineField({ name: "price", type: "string" }),
    defineField({ name: "description", type: "text", rows: 3 }),
    defineField({ name: "badge", type: "string" }),
    defineField({ name: "orderUrl", title: "Order link", type: "string", description: "Leave empty to order on WhatsApp" }),
  ],
  preview: { select: { title: "name", subtitle: "size", media: "image" } },
});

export const promotion = defineType({
  name: "promotion",
  type: "object",
  fields: [
    defineField({ name: "kind", type: "string", options: { list: ["offer", "announcement", "banner"], layout: "radio" }, initialValue: "offer" }),
    defineField({ name: "title", type: "string", validation: (r) => r.required().max(90) }),
    defineField({ name: "body", type: "text", rows: 3 }),
    defineField({ name: "image", type: "image", fields: [defineField({ name: "alt", type: "string" })] }),
    defineField({ name: "ctaLabel", title: "Button text", type: "string" }),
    defineField({ name: "url", title: "Button link", type: "string" }),
    defineField({ name: "active", type: "boolean", initialValue: true }),
  ],
  preview: { select: { title: "title", subtitle: "kind", media: "image" } },
});

export const customLink = defineType({
  name: "customLink",
  title: "Link button",
  type: "object",
  fields: [
    defineField({ name: "label", type: "string", validation: (r) => r.required().max(60) }),
    defineField({ name: "description", type: "string" }),
    defineField({ name: "url", type: "string", validation: (r) => r.required() }),
  ],
});

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const openingHours = defineType({
  name: "openingHours",
  type: "object",
  fields: [
    defineField({ name: "day", type: "number", description: "0 = Monday … 6 = Sunday", validation: (r) => r.min(0).max(6).integer() }),
    defineField({ name: "open", type: "string", initialValue: "08:00" }),
    defineField({ name: "close", type: "string", initialValue: "18:00" }),
    defineField({ name: "closed", type: "boolean", initialValue: false }),
  ],
  preview: {
    select: { day: "day", open: "open", close: "close", closed: "closed" },
    prepare: ({ day, open, close, closed }) => ({ title: DAY_NAMES[day] ?? "Day", subtitle: closed ? "Closed" : `${open}–${close}` }),
  },
});

export const appearance = defineType({
  name: "appearance",
  type: "object",
  fields: [
    defineField({ name: "primary", type: "string", validation: (r) => r.regex(HEX, { name: "hex color" }) }),
    defineField({ name: "accent", type: "string", validation: (r) => r.regex(HEX, { name: "hex color" }) }),
    defineField({ name: "background", type: "string", options: { list: ["depth", "mist", "light", "deep"] } }),
    defineField({ name: "buttonShape", type: "string", options: { list: ["pill", "rounded", "square"] } }),
    defineField({ name: "buttonFill", type: "string", options: { list: ["solid", "soft", "outline"] } }),
    defineField({ name: "cardStyle", type: "string", options: { list: ["raised", "outlined", "glass", "flat"] } }),
    defineField({ name: "font", type: "string", options: { list: ["tide", "atelier", "harbor", "studio"] } }),
  ],
});

export const objectTypes = [socialLink, product, promotion, customLink, openingHours, appearance];
export { defineArrayMember };
