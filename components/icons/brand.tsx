import type { SVGProps } from "react";
import { Link2 } from "lucide-react";
import type { SocialPlatform } from "@/lib/types";

/**
 * Lucide v1 ships no brand marks, so these are drawn on the same 24px grid
 * with the same 1.75 stroke so they sit naturally beside Lucide icons.
 */

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 20, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const InstagramIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5.2" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
  </Base>
);

export const FacebookIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M15.2 7.6h-1.5c-1.3 0-1.9.7-1.9 2V21" />
    <path d="M9.4 12.8h5.2" />
  </Base>
);

export const YouTubeIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
    <path d="M10.2 9.4v5.2l4.4-2.6z" fill="currentColor" />
  </Base>
);

export const WhatsAppIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3.6 20.4l1.2-3.7A8.6 8.6 0 1 1 8 19.5z" />
    <path d="M9.1 8.6c-.2 3.6 2.7 6.5 6.3 6.3l.9-1.3-1.8-1-.9.7a3.9 3.9 0 0 1-2.4-2.4l.7-.9-1-1.8z" />
  </Base>
);

export const XIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4.5 4h4L19.5 20h-4z" />
    <path d="M19.3 4l-6.4 7M11.1 13L4.7 20" />
  </Base>
);

export const TikTokIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M13.8 3.5v11.2a3.6 3.6 0 1 1-3.6-3.6" />
    <path d="M13.8 3.5c.4 2.6 2.2 4.4 5 4.7" />
  </Base>
);

export const SnapchatIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3.2c-2.9 0-4.8 2.1-4.8 4.9v2.1l-1.5-.4c-.5-.1-.8.5-.4.8l1.6 1.1c-.6 1.6-1.8 2.9-3.3 3.5.2.6 1.2.9 2.2 1 .2.6.2 1.1.6 1.2.7.1 1.5-.3 2.5.1 1 .4 1.8 1.4 3.1 1.4s2.1-1 3.1-1.4c1-.4 1.8 0 2.5-.1.4-.1.4-.6.6-1.2 1-.1 2-.4 2.2-1-1.5-.6-2.7-1.9-3.3-3.5l1.6-1.1c.4-.3.1-.9-.4-.8l-1.5.4V8.1c0-2.8-1.9-4.9-4.8-4.9z" />
  </Base>
);

export const LinkedInIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <path d="M7.8 10.4v6" />
    <path d="M7.8 7.4v.05" strokeWidth={2.4} />
    <path d="M11.3 16.4v-6" />
    <path d="M11.3 13c0-1.6 1-2.7 2.5-2.7s2.4 1 2.4 2.6v3.5" />
  </Base>
);

export const TelegramIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M21 4.2L3 11.1l6.1 2.3L17.6 7.3l-6.3 7.4 5.6 5.1z" />
    <path d="M9.1 13.4v5.4l2.6-3.1" />
  </Base>
);

export const CustomLinkIcon = ({ size = 20, ...p }: IconProps) => <Link2 size={size} strokeWidth={1.75} {...(p as object)} />;

export const SOCIAL_META: Record<
  SocialPlatform,
  { label: string; Icon: (p: IconProps) => React.ReactElement; placeholder: string; brand: string }
> = {
  instagram: { label: "Instagram", Icon: InstagramIcon, placeholder: "instagram.com/yourbusiness", brand: "#E1306C" },
  tiktok: { label: "TikTok", Icon: TikTokIcon, placeholder: "tiktok.com/@yourbusiness", brand: "#111111" },
  facebook: { label: "Facebook", Icon: FacebookIcon, placeholder: "facebook.com/yourbusiness", brand: "#1877F2" },
  youtube: { label: "YouTube", Icon: YouTubeIcon, placeholder: "youtube.com/@yourbusiness", brand: "#FF0033" },
  whatsapp: { label: "WhatsApp", Icon: WhatsAppIcon, placeholder: "wa.me/2348012345678", brand: "#25D366" },
  x: { label: "X", Icon: XIcon, placeholder: "x.com/yourbusiness", brand: "#111111" },
  snapchat: { label: "Snapchat", Icon: SnapchatIcon, placeholder: "snapchat.com/add/yourbusiness", brand: "#F7D800" },
  linkedin: { label: "LinkedIn", Icon: LinkedInIcon, placeholder: "linkedin.com/company/yourbusiness", brand: "#0A66C2" },
  telegram: { label: "Telegram", Icon: TelegramIcon, placeholder: "t.me/yourbusiness", brand: "#26A5E4" },
  custom: { label: "Link", Icon: CustomLinkIcon, placeholder: "https://", brand: "#5B6475" },
};
