import { AtSign, Globe, LayoutGrid, Megaphone, Package, Palette, Phone, QrCode, Store, type LucideIcon } from "lucide-react";
import type { PageContent } from "@/lib/types";

export type NavItem = {
  href: string;
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
  group: "home" | "page" | "brand";
  count?: (content: PageContent) => number;
};

export const NAV: NavItem[] = [
  {
    href: "/dashboard",
    label: "Overview",
    title: "Overview",
    description: "Your page at a glance.",
    icon: LayoutGrid,
    group: "home",
  },
  {
    href: "/dashboard/profile",
    label: "Business profile",
    title: "Business profile",
    description: "Your name, logo and the story customers see first.",
    icon: Store,
    group: "page",
  },
  {
    href: "/dashboard/website",
    label: "Website & store",
    title: "Website & store",
    description: "Send customers to your website and online shop.",
    icon: Globe,
    group: "page",
  },
  {
    href: "/dashboard/social",
    label: "Social media",
    title: "Social media",
    description: "Where customers can follow you. Drag to change the order.",
    icon: AtSign,
    group: "page",
    count: (c) => c.socials.length,
  },
  {
    href: "/dashboard/products",
    label: "Products",
    title: "Products",
    description: "Show what you sell. Customers can order each one on WhatsApp.",
    icon: Package,
    group: "page",
    count: (c) => c.products.length,
  },
  {
    href: "/dashboard/contact",
    label: "Contact & hours",
    title: "Contact & hours",
    description: "How customers reach you, and when you're open.",
    icon: Phone,
    group: "page",
  },
  {
    href: "/dashboard/promotions",
    label: "Promotions & links",
    title: "Promotions & links",
    description: "Offers, announcements and extra link buttons.",
    icon: Megaphone,
    group: "page",
    count: (c) => c.promotions.filter((p) => p.active).length + c.links.length,
  },
  {
    href: "/dashboard/appearance",
    label: "Appearance",
    title: "Appearance",
    description: "Colors, fonts and the shape of your page.",
    icon: Palette,
    group: "brand",
  },
  {
    href: "/dashboard/qr",
    label: "QR code",
    title: "QR code",
    description: "A permanent code for packaging, flyers and your shop counter.",
    icon: QrCode,
    group: "brand",
  },
];

export function navItemFor(pathname: string) {
  return NAV.find((item) => item.href === pathname) ?? NAV.find((item) => item.href !== "/dashboard" && pathname.startsWith(item.href)) ?? NAV[0];
}
