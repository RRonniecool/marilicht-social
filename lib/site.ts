import { SITE_NAME } from "@/lib/config";
import type { Appearance, PageContent } from "@/lib/types";

/** Section wording on the public page. */
export const SITE_COPY = {
  productsHeading: "Our range",
  productsIntro: "Bottles, packs and refills for home, work and events.",
  sizeLabel: "Size",
  orderVerb: "Order",
  contactHeading: "Find us",
  websiteHeading: "Visit our website",
} as const;

export const DEFAULT_APPEARANCE: Appearance = {
  primary: "#0A2342",
  accent: "#3CC3E3",
  background: "depth",
  buttonShape: "pill",
  buttonFill: "solid",
  cardStyle: "glass",
  font: "tide",
};

export const defaultWhatsappMessage = (name: string) => `Hello ${name}, I'd like to place an order.`;

/** Empty but valid content, used before anything has been saved. */
export function starterContent(name = SITE_NAME): PageContent {
  return {
    profile: { name, tagline: "", description: "", location: "", logo: null, cover: null },
    website: { url: "", title: "", description: "", previewImage: null, storeUrl: "", storeLabel: "" },
    socials: [],
    products: [],
    contact: {
      whatsapp: "",
      whatsappMessage: defaultWhatsappMessage(name),
      phone: "",
      email: "",
      address: "",
      mapsUrl: "",
      hours: Array.from({ length: 7 }, (_, day) => ({ day, open: "08:00", close: "18:00", closed: day === 6 })),
      hoursNote: "",
    },
    promotions: [],
    links: [],
    appearance: { ...DEFAULT_APPEARANCE },
  };
}
