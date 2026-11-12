import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Shared primitives                                                   */
/* ------------------------------------------------------------------ */

export const imageRefSchema = z.object({
  url: z.string(),
  alt: z.string().optional(),
  /** Sanity asset id (image-xxx) when stored in Sanity. */
  assetId: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});
export type ImageRef = z.infer<typeof imageRefSchema>;

const optionalImage = imageRefSchema.nullish();

const text = (max: number) => z.string().max(max, `Keep this under ${max} characters`);

/* ------------------------------------------------------------------ */
/* Page content (admin editable, has draft + published versions)       */
/* ------------------------------------------------------------------ */

export const SOCIAL_PLATFORMS = [
  "instagram",
  "tiktok",
  "facebook",
  "youtube",
  "whatsapp",
  "x",
  "snapchat",
  "linkedin",
  "telegram",
  "custom",
] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const socialLinkSchema = z.object({
  id: z.string(),
  platform: z.enum(SOCIAL_PLATFORMS),
  url: text(500),
  label: text(40).optional(),
});
export type SocialLink = z.infer<typeof socialLinkSchema>;

export const productSchema = z.object({
  id: z.string(),
  name: text(80),
  description: text(400).default(""),
  size: text(40).default(""),
  price: text(40).default(""),
  image: optionalImage,
  orderUrl: text(500).default(""),
  badge: text(24).default(""),
});
export type Product = z.infer<typeof productSchema>;

export const PROMOTION_KINDS = ["offer", "announcement", "banner"] as const;
export type PromotionKind = (typeof PROMOTION_KINDS)[number];

export const promotionSchema = z.object({
  id: z.string(),
  kind: z.enum(PROMOTION_KINDS),
  title: text(90),
  body: text(280).default(""),
  image: optionalImage,
  ctaLabel: text(30).default(""),
  url: text(500).default(""),
  active: z.boolean().default(true),
});
export type Promotion = z.infer<typeof promotionSchema>;

export const customLinkSchema = z.object({
  id: z.string(),
  label: text(60),
  description: text(120).default(""),
  url: text(500),
});
export type CustomLink = z.infer<typeof customLinkSchema>;

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

export const openingHoursSchema = z.object({
  /** 0 = Monday … 6 = Sunday */
  day: z.number().int().min(0).max(6),
  open: z.string().default("08:00"),
  close: z.string().default("18:00"),
  closed: z.boolean().default(false),
});
export type OpeningHours = z.infer<typeof openingHoursSchema>;

export const BACKGROUNDS = ["depth", "mist", "light", "deep"] as const;
export const BUTTON_SHAPES = ["pill", "rounded", "square"] as const;
export const BUTTON_FILLS = ["solid", "soft", "outline"] as const;
export const CARD_STYLES = ["raised", "outlined", "glass", "flat"] as const;
export const FONT_PAIRINGS = ["tide", "atelier", "harbor", "studio"] as const;

export type BackgroundTheme = (typeof BACKGROUNDS)[number];
export type ButtonShape = (typeof BUTTON_SHAPES)[number];
export type ButtonFill = (typeof BUTTON_FILLS)[number];
export type CardStyle = (typeof CARD_STYLES)[number];
export type FontPairing = (typeof FONT_PAIRINGS)[number];

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex color like #0A2342");

export const appearanceSchema = z.object({
  primary: hex,
  accent: hex,
  background: z.enum(BACKGROUNDS),
  buttonShape: z.enum(BUTTON_SHAPES),
  buttonFill: z.enum(BUTTON_FILLS),
  cardStyle: z.enum(CARD_STYLES),
  font: z.enum(FONT_PAIRINGS),
});
export type Appearance = z.infer<typeof appearanceSchema>;

export const pageContentSchema = z.object({
  profile: z.object({
    name: text(60).min(1, "Add your business name"),
    tagline: text(90).default(""),
    description: text(600).default(""),
    location: text(80).default(""),
    logo: optionalImage,
    cover: optionalImage,
  }),
  website: z.object({
    url: text(300).default(""),
    title: text(80).default(""),
    description: text(240).default(""),
    previewImage: optionalImage,
    storeUrl: text(300).default(""),
    storeLabel: text(40).default(""),
  }),
  socials: z.array(socialLinkSchema).default([]),
  products: z.array(productSchema).default([]),
  contact: z.object({
    whatsapp: text(30).default(""),
    whatsappMessage: text(200).default(""),
    phone: text(30).default(""),
    email: text(120).default(""),
    address: text(200).default(""),
    mapsUrl: text(500).default(""),
    hours: z.array(openingHoursSchema).default([]),
    hoursNote: text(120).default(""),
  }),
  promotions: z.array(promotionSchema).default([]),
  links: z.array(customLinkSchema).default([]),
  appearance: appearanceSchema,
});
export type PageContent = z.infer<typeof pageContentSchema>;

/* ------------------------------------------------------------------ */
/* The single site                                                     */
/* ------------------------------------------------------------------ */

/** The published page, as the public site sees it. */
export type PublishedPage = {
  content: PageContent;
  publishedAt?: string;
};

/** Everything the dashboard editor needs. */
export type EditorState = {
  draft: PageContent;
  published: PageContent | null;
  hasUnpublishedChanges: boolean;
  draftUpdatedAt?: string;
  publishedAt?: string;
};
