import { ArrowUpRight } from "lucide-react";
import { SOCIAL_META } from "@/components/icons/brand";
import type { SocialLink, SocialPlatform } from "@/lib/types";
import { displayUrl, normalizeUrl } from "@/lib/utils";

/** What to say when a link has no visible handle (e.g. a platform home page). */
const ACTION: Record<SocialPlatform, string> = {
  instagram: "Follow us on Instagram",
  tiktok: "Watch us on TikTok",
  facebook: "Like our page on Facebook",
  youtube: "Watch us on YouTube",
  whatsapp: "Chat with us on WhatsApp",
  x: "Follow us on X",
  snapchat: "Add us on Snapchat",
  linkedin: "Connect with us on LinkedIn",
  telegram: "Join us on Telegram",
  custom: "Visit",
};

/** "@marilicht" from instagram.com/marilicht, linkedin.com/company/marilicht, tiktok.com/@marilicht… */
function handleFor(social: SocialLink): string {
  if (social.platform === "custom") return displayUrl(social.url);
  if (social.platform === "whatsapp") return ACTION.whatsapp;
  try {
    const url = new URL(normalizeUrl(social.url));
    const parts = url.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    if (!last) return ACTION[social.platform];
    const handle = decodeURIComponent(last);
    return handle.startsWith("@") ? handle : `@${handle}`;
  } catch {
    return ACTION[social.platform];
  }
}

/**
 * Social profiles as large, tappable cards (in the owner's chosen order),
 * complementing the compact icon row in the header.
 */
export function SocialCards({ socials }: { socials: SocialLink[] }) {
  if (!socials.length) return null;
  return (
    <section aria-labelledby="socials-heading" data-section="socials">
      <h2 id="socials-heading" className="bp-display mb-4 text-[28px] @3xl:text-[32px]">
        Follow us
      </h2>
      <ul className="grid gap-2.5 @3xl:grid-cols-2">
        {socials.map((social) => {
          const meta = SOCIAL_META[social.platform];
          const title = social.platform === "custom" ? social.label || "Link" : meta.label;
          return (
            <li key={social.id}>
              <a
                href={normalizeUrl(social.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="bp-card group flex items-center gap-4 p-3 pr-4"
              >
                <span
                  className="grid size-12 shrink-0 place-items-center rounded-[calc(var(--bp-radius-card)*0.6)] shadow-sm"
                  style={{ background: meta.brand, color: social.platform === "snapchat" ? "#111111" : "#FFFFFF" }}
                >
                  <meta.Icon size={22} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[16px] font-semibold">{title}</span>
                  <span className="bp-muted block truncate text-[14px]">{handleFor(social)}</span>
                </span>
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--bp-tint)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                  <ArrowUpRight size={18} strokeWidth={1.75} />
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
