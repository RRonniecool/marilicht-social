import type { PageContent } from "@/lib/types";

/**
 * Sample content for Marilicht.
 *
 * Shown on the public homepage only while nothing has been published, and
 * used as the starting draft in the dashboard so the owner edits a finished
 * page instead of building one from scratch. It is never written to Sanity
 * on its own: it only becomes stored content when the owner saves or
 * publishes from the dashboard.
 *
 * Contact details are deliberate placeholders (+234 800 000 0000,
 * hello@example.com, "Sample Street"). Social icons point to each
 * platform's home page. No claims, offers or certifications are made.
 */

/** Placeholder WhatsApp number (0800 range), clearly not a real contact. */
const SAMPLE_WHATSAPP = "+234 800 000 0000";
const waLink = (text: string) => `https://wa.me/2348000000000?text=${encodeURIComponent(text)}`;

const img = (file: string, alt: string, width: number, height: number) => ({
  url: `/demo/marilicht/${file}`,
  alt,
  width,
  height,
});

export const seedContent: PageContent = {
  profile: {
    name: "Marilicht",
    tagline: "Premium table water. Pure by nature, refined for you.",
    description:
      "Marilicht Premium Table Water is bottled with care for homes, offices and events. Order single packs, family sizes and dispenser refills, and we'll arrange delivery to your door.",
    location: "Lagos, Nigeria",
    logo: img("logo.svg", "Marilicht logo", 256, 256),
    cover: img("cover.svg", "Sunlight falling through clear water", 1600, 900),
  },
  website: {
    url: "https://marilicht.social",
    title: "Marilicht",
    description: "Everything about Marilicht in one place: our range, how to order and how to reach us.",
    previewImage: img("website-preview.svg", "Marilicht website homepage", 1200, 750),
    storeUrl: "https://marilicht.social/#products-heading",
    storeLabel: "Browse products",
  },
  socials: [
    { id: "s_ig", platform: "instagram", url: "https://www.instagram.com/" },
    { id: "s_fb", platform: "facebook", url: "https://www.facebook.com/" },
    { id: "s_tt", platform: "tiktok", url: "https://www.tiktok.com/" },
    { id: "s_x", platform: "x", url: "https://x.com/" },
    { id: "s_yt", platform: "youtube", url: "https://www.youtube.com/" },
  ],
  products: [
    {
      id: "p_75cl",
      name: "Premium Table Water",
      description: "Our signature bottle. Crisp, clean and ready for the table, the office or the road.",
      size: "75cl · pack of 12",
      price: "₦2,700",
      image: img("bottle-75cl.svg", "75cl bottle of Marilicht Premium Table Water", 400, 600),
      orderUrl: "",
      badge: "Popular",
    },
    {
      id: "p_50cl",
      name: "Handy Bottle",
      description: "A smaller bottle for bags, lunchboxes and meetings.",
      size: "50cl · pack of 20",
      price: "₦2,500",
      image: img("bottle-50cl.svg", "50cl bottle of Marilicht table water", 400, 600),
      orderUrl: "",
      badge: "",
    },
    {
      id: "p_15l",
      name: "Family Bottle",
      description: "Keeps the fridge stocked for the whole household.",
      size: "1.5L · pack of 6",
      price: "₦2,400",
      image: img("bottle-1-5l.svg", "1.5 litre bottle of Marilicht table water", 400, 600),
      orderUrl: "",
      badge: "",
    },
    {
      id: "p_5l",
      name: "Kitchen Jug",
      description: "An easy-grip jug for cooking, kettles and long weekends.",
      size: "5L",
      price: "₦1,200",
      image: img("jug-5l.svg", "5 litre Marilicht water jug", 400, 600),
      orderUrl: "",
      badge: "",
    },
    {
      id: "p_189",
      name: "Dispenser Refill",
      description: "Swap your empty dispenser bottle for a sealed refill.",
      size: "18.9L",
      price: "₦1,500",
      image: img("dispenser-18-9l.svg", "18.9 litre Marilicht dispenser bottle", 400, 600),
      orderUrl: "",
      badge: "",
    },
  ],
  contact: {
    whatsapp: SAMPLE_WHATSAPP,
    whatsappMessage: "Hello Marilicht, I'd like to place an order.",
    phone: SAMPLE_WHATSAPP,
    email: "hello@example.com",
    address: "123 Sample Street, Lagos",
    mapsUrl: "",
    hours: [
      { day: 0, open: "08:00", close: "18:00", closed: false },
      { day: 1, open: "08:00", close: "18:00", closed: false },
      { day: 2, open: "08:00", close: "18:00", closed: false },
      { day: 3, open: "08:00", close: "18:00", closed: false },
      { day: 4, open: "08:00", close: "18:00", closed: false },
      { day: 5, open: "09:00", close: "15:00", closed: false },
      { day: 6, open: "09:00", close: "15:00", closed: true },
    ],
    hoursNote: "Message us on WhatsApp to confirm delivery times.",
  },
  promotions: [
    {
      id: "pr_announce",
      kind: "announcement",
      title: "Now taking orders for home and office delivery",
      body: "",
      image: null,
      ctaLabel: "",
      url: "",
      active: true,
    },
    {
      id: "pr_bulk",
      kind: "offer",
      title: "Bulk order pricing",
      body: "Ordering for an office, a shop or an event? Message us with the quantity and we'll send you a quote.",
      image: img("promo-refill.svg", "Marilicht dispenser bottle on an aqua background", 1200, 600),
      ctaLabel: "Ask on WhatsApp",
      url: "",
      active: true,
    },
    {
      id: "pr_office",
      kind: "banner",
      title: "Water for your office",
      body: "Regular deliveries for teams of every size.",
      image: null,
      ctaLabel: "Ask us",
      url: "",
      active: true,
    },
  ],
  links: [
    {
      id: "l_regular",
      label: "Set up a regular delivery",
      description: "Tell us what you need and how often",
      url: waLink("Hello Marilicht, I'd like to set up a regular delivery."),
    },
    {
      id: "l_events",
      label: "Order for an event",
      description: "Weddings, conferences and parties",
      url: waLink("Hello Marilicht, I'd like to order water for an event."),
    },
    {
      id: "l_range",
      label: "See the full range",
      description: "Bottles, packs and dispenser refills",
      url: "https://marilicht.social/#products-heading",
    },
  ],
  appearance: {
    primary: "#0A2342",
    accent: "#3CC3E3",
    background: "depth",
    buttonShape: "pill",
    buttonFill: "solid",
    cardStyle: "glass",
    font: "tide",
  },
};
