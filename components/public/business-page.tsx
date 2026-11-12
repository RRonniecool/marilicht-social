/* eslint-disable @next/next/no-img-element -- images come from Sanity's CDN (already resized) or are SVG */
import {
  ArrowUpRight,
  Clock,
  Globe,
  Mail,
  MapPin,
  Megaphone,
  Navigation,
  Phone,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { SOCIAL_META, WhatsAppIcon } from "@/components/icons/brand";
import { SITE_NAME } from "@/lib/config";
import { groupHours } from "@/lib/hours";
import { imageSrc } from "@/lib/images";
import { defaultWhatsappMessage, SITE_COPY } from "@/lib/site";
import { businessTheme, themeAttributes } from "@/lib/theme";
import type { ImageRef, PageContent, Product, Promotion } from "@/lib/types";
import { cn, displayUrl, initials, normalizeUrl, whatsappLink } from "@/lib/utils";
import { HoursList, OpenStatusChip, ShareButton, StickyOrderBar } from "./interactive";

type Props = {
  content: PageContent;
  pageUrl: string;
  /** Rendering inside the dashboard preview (disables outbound navigation affordances). */
  preview?: boolean;
  className?: string;
};

export function BusinessPage({ content, pageUrl, preview, className }: Props) {
  const t = { copy: SITE_COPY };
  const { profile, contact } = content;
  const name = profile.name || SITE_NAME;
  const wa = whatsappLink(contact.whatsapp, contact.whatsappMessage || defaultWhatsappMessage(name));
  const announcement = content.promotions.find((p) => p.active && p.kind === "announcement");
  const promos = content.promotions.filter((p) => p.active && p.kind !== "announcement");
  const socials = content.socials.filter((s) => s.url.trim());
  const links = content.links.filter((l) => l.label.trim() && l.url.trim());
  const hasContact = Boolean(contact.whatsapp || contact.phone || contact.email || contact.address || contact.hours.length);
  const productHref = (p: Product) =>
    p.orderUrl
      ? normalizeUrl(p.orderUrl)
      : whatsappLink(contact.whatsapp, `Hello ${name}, I'd like to order: ${p.name}${p.size ? ` (${p.size})` : ""}.`);

  return (
    <div
      className={cn("bp relative isolate min-h-full", className)}
      style={businessTheme(content.appearance)}
      {...themeAttributes(content.appearance)}
      data-preview={preview ? "" : undefined}
    >
      <div className="mx-auto w-full max-w-[1200px] @3xl:grid @3xl:grid-cols-[minmax(340px,430px)_minmax(0,1fr)] @3xl:gap-10 @3xl:px-8 @3xl:pt-8 @5xl:gap-14">
        {/* ------------------------------------------------ Identity */}
        <aside className="@3xl:sticky @3xl:top-8 @3xl:self-start">
          <Hero
            content={content}
            name={name}
            whatsapp={wa}
            announcement={announcement}
            pageUrl={pageUrl}
            caustics
            socials={socials}
          />
        </aside>

        {/* ------------------------------------------------ Content */}
        <main className="relative space-y-14 px-5 pb-16 pt-10 @md:px-7 @3xl:px-0 @3xl:pt-2">
          {profile.description && (
            <section aria-label="About" data-section="about">
              <p className="bp-display max-w-[30ch] text-[25px] leading-[1.22] @md:text-[28px] @5xl:text-[32px]">
                {profile.description}
              </p>
            </section>
          )}

          {promos.length > 0 && (
            <section aria-label="Offers" className="space-y-3" data-section="promotions">
              {promos.map((promo) => (
                <PromotionCard key={promo.id} promo={promo} whatsapp={contact.whatsapp} name={name} />
              ))}
            </section>
          )}

          {content.products.length > 0 && (
            <section aria-labelledby="products-heading" data-section="products">
              <SectionHeading id="products-heading" title={t.copy.productsHeading} intro={t.copy.productsIntro} />
              <div className="bp-snap no-scrollbar -mx-5 flex gap-3.5 overflow-x-auto px-5 pb-2 @md:-mx-7 @md:px-7 @3xl:mx-0 @3xl:grid @3xl:grid-cols-2 @3xl:gap-4 @3xl:overflow-visible @3xl:px-0 @6xl:grid-cols-3">
                {content.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    href={productHref(product)}
                    verb={t.copy.orderVerb}
                    sizeLabel={t.copy.sizeLabel}
                  />
                ))}
              </div>
            </section>
          )}

          {links.length > 0 && (
            <section aria-label="Links" className="space-y-2.5" data-section="links">
              {links.map((link) => (
                <a
                  key={link.id}
                  href={normalizeUrl(link.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bp-card group flex items-center gap-4 px-5 py-4"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[16px] font-semibold">{link.label}</span>
                    {link.description && <span className="bp-muted block truncate text-[14px]">{link.description}</span>}
                  </span>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--bp-tint)] text-[var(--bp-text)] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <ArrowUpRight size={18} strokeWidth={1.75} />
                  </span>
                </a>
              ))}
            </section>
          )}

          {(content.website.url || content.website.storeUrl) && <WebsiteCard content={content} heading={t.copy.websiteHeading} />}
        </main>
      </div>

      {/* ------------------------------------------------ The deep end: contact */}
      {hasContact && (
        <div className="mt-4 @3xl:mt-16" data-section="contact">
          <WaterSurface />
          <section className="bp-deep -mt-px px-5 pb-10 pt-8 @md:px-7 @3xl:px-8" aria-labelledby="contact-heading">
            <div className="mx-auto max-w-[1200px]">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 id="contact-heading" className="bp-display text-[40px] @3xl:text-[56px]">
                  {t.copy.contactHeading}
                </h2>
                {contact.hours.length > 0 && <OpenStatusChip hours={contact.hours} className="bg-white/10 text-white" />}
              </div>

              <div className="mt-8 grid gap-10 @3xl:grid-cols-[1.1fr_1fr] @3xl:gap-16">
                <div className="space-y-2.5">
                  {contact.whatsapp && (
                    <ContactRow icon={<WhatsAppIcon size={20} />} label="WhatsApp" value={contact.whatsapp} href={wa} />
                  )}
                  {contact.phone && (
                    <ContactRow icon={<Phone size={19} strokeWidth={1.75} />} label="Call" value={contact.phone} href={`tel:${contact.phone.replace(/\s/g, "")}`} />
                  )}
                  {contact.email && (
                    <ContactRow icon={<Mail size={19} strokeWidth={1.75} />} label="Email" value={contact.email} href={`mailto:${contact.email}`} />
                  )}
                  {contact.address && (
                    <ContactRow
                      icon={<MapPin size={19} strokeWidth={1.75} />}
                      label="Address"
                      value={contact.address}
                      href={contact.mapsUrl ? normalizeUrl(contact.mapsUrl) : `https://maps.google.com/?q=${encodeURIComponent(contact.address)}`}
                      action={
                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white p-2.5 text-[13px] font-semibold text-[var(--bp-deep)] @md:px-3.5 @md:py-2">
                          <Navigation size={14} strokeWidth={2} />
                          <span className="sr-only @md:not-sr-only">Directions</span>
                        </span>
                      }
                    />
                  )}
                </div>

                {contact.hours.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 text-[15px] font-semibold text-white/90">
                      <Clock size={17} strokeWidth={1.75} />
                      Opening hours
                    </h3>
                    <div className="mt-2">
                      <HoursList groups={groupHours(contact.hours)} />
                    </div>
                    {contact.hoursNote && <p className="mt-4 text-[14px] text-white/60">{contact.hoursNote}</p>}
                  </div>
                )}
              </div>

              <Footer name={name} logo={profile.logo} pageUrl={pageUrl} />
            </div>
          </section>
        </div>
      )}
      {!hasContact && (
        <div className="px-5 pb-10">
          <Footer name={name} logo={profile.logo} pageUrl={pageUrl} light />
        </div>
      )}

      {wa && <StickyOrderBar href={wa} label="Order on WhatsApp" pageUrl={pageUrl} title={name} />}
    </div>
  );
}

/* ================================================================== */

function Hero({
  content,
  name,
  whatsapp,
  announcement,
  pageUrl,
  caustics,
  socials,
}: {
  content: PageContent;
  name: string;
  whatsapp: string;
  announcement?: Promotion;
  pageUrl: string;
  caustics: boolean;
  socials: PageContent["socials"];
}) {
  const { profile, contact } = content;
  return (
    <section className="relative isolate overflow-hidden bg-[var(--bp-deep)] text-white @3xl:rounded-[calc(var(--bp-radius-card)+8px)]">
      {/* Imagery */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        {profile.cover?.url ? (
          <img src={imageSrc(profile.cover, 900)} alt="" className="size-full object-cover" />
        ) : (
          <div
            className="size-full"
            style={{
              background:
                "radial-gradient(120% 80% at 70% 0%, color-mix(in srgb, var(--bp-accent) 75%, white) 0%, var(--bp-accent) 22%, var(--bp-primary) 62%, var(--bp-abyss) 100%)",
            }}
          />
        )}
        {caustics && (
          <>
            <div className="bp-caustics" />
            <div className="bp-caustics b" />
          </>
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--bp-abyss) 30%, transparent) 0%, transparent 28%, color-mix(in srgb, var(--bp-deep) 55%, transparent) 55%, var(--bp-deep) 92%)",
          }}
        />
      </div>

      <div className="flex min-h-[600px] flex-col px-5 pb-8 pt-5 @md:px-7 @3xl:min-h-[min(860px,calc(100svh-4rem))] @3xl:px-8 @3xl:pb-8">
        {/* Top bar */}
        <div className="bp-hero-top flex items-start justify-between gap-3">
          {announcement ? (
            <p className="inline-flex min-w-0 items-center gap-2 rounded-full bg-white/14 py-1.5 pl-2 pr-3.5 text-[13px] font-medium ring-1 ring-white/20 backdrop-blur-md">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white text-[var(--bp-deep)]">
                <Megaphone size={13} strokeWidth={2} />
              </span>
              <span className="truncate">{announcement.title}</span>
            </p>
          ) : (
            <span />
          )}
          <ShareButton
            url={pageUrl}
            title={name}
            iconOnly
            className="grid size-10 shrink-0 place-items-center rounded-full bg-white/14 ring-1 ring-white/20 backdrop-blur-md transition hover:bg-white/22"
          />
        </div>

        <div className="flex-1" />

        {/* Identity */}
        <div className="relative pt-24">
          <Logo logo={profile.logo} name={name} />
          <h1 className="bp-display mt-5 text-[46px] @md:text-[54px]">{name}</h1>
          {profile.tagline && <p className="mt-2 max-w-[32ch] text-[17px] leading-snug text-white/80">{profile.tagline}</p>}

          {(profile.location || contact.hours.length > 0) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.location && (
                <span className="bp-chip bg-white/12 text-white/90 ring-1 ring-white/15 backdrop-blur-md">
                  <MapPin size={14} strokeWidth={1.75} />
                  {profile.location}
                </span>
              )}
              {contact.hours.length > 0 && (
                <OpenStatusChip hours={contact.hours} className="bg-white/12 text-white/90 ring-1 ring-white/15 backdrop-blur-md" />
              )}
            </div>
          )}

          {socials.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Social media">
              {socials.map((social) => {
                const meta = SOCIAL_META[social.platform];
                return (
                  <li key={social.id}>
                    <a
                      href={normalizeUrl(social.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label || meta.label}
                      title={social.label || meta.label}
                      className="grid size-11 place-items-center rounded-full bg-white/12 text-white ring-1 ring-white/18 backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-[var(--bp-deep)]"
                    >
                      <meta.Icon size={20} />
                    </a>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-7 flex gap-2.5" data-hero-cta>
            {whatsapp ? (
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="bp-btn bp-btn-accent flex-1 whitespace-nowrap !px-4">
                <WhatsAppIcon size={20} />
                Order on WhatsApp
              </a>
            ) : contact.phone ? (
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="bp-btn bp-btn-accent flex-1">
                <Phone size={19} strokeWidth={1.75} />
                Call us
              </a>
            ) : null}
            {contact.phone && whatsapp && (
              <a
                href={`tel:${contact.phone.replace(/\s/g, "")}`}
                aria-label={`Call ${name}`}
                className="grid size-[52px] shrink-0 place-items-center rounded-[var(--bp-radius-btn)] bg-white/14 ring-1 ring-white/20 backdrop-blur-md transition hover:bg-white/22"
              >
                <Phone size={20} strokeWidth={1.75} />
              </a>
            )}
          </div>
        </div>
      </div>
      {/* Mobile: hero dissolves into the page like a surface seen from below */}
      <svg className="absolute inset-x-0 -bottom-px h-7 w-full text-[var(--bp-bg)] @3xl:hidden" viewBox="0 0 400 28" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 18 C 60 6 120 6 200 16 S 340 28 400 12 L400 28 L0 28 Z" fill="currentColor" />
      </svg>
    </section>
  );
}

function Logo({ logo, name }: { logo?: ImageRef | null; name: string }) {
  return (
    <div className="relative size-[92px] rounded-full bg-white/20 p-1 ring-1 ring-white/30 backdrop-blur-md">
      <div className="grid size-full place-items-center overflow-hidden rounded-full bg-white">
        {logo?.url ? (
          <img src={imageSrc(logo, 92)} alt={`${name} logo`} className="size-full object-cover" />
        ) : (
          <span className="bp-display text-[32px] text-[var(--bp-deep)]">{initials(name)}</span>
        )}
      </div>
    </div>
  );
}

function SectionHeading({ id, title, intro }: { id: string; title: string; intro?: string }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
      <h2 id={id} className="bp-display text-[34px] @3xl:text-[42px]">
        {title}
      </h2>
      {intro && <p className="bp-muted text-[15px]">{intro}</p>}
    </div>
  );
}

function ProductCard({ product, href, verb, sizeLabel }: { product: Product; href: string; verb: string; sizeLabel: string }) {
  return (
    <article className="bp-card bp-lift group relative flex w-[74%] max-w-[300px] shrink-0 flex-col overflow-hidden @md:w-[46%] @3xl:w-auto @3xl:max-w-none">
      <div
        className="relative aspect-[4/5] overflow-hidden"
        style={{
          background:
            "radial-gradient(70% 55% at 50% 58%, color-mix(in srgb, var(--bp-accent) 34%, white) 0%, transparent 70%), linear-gradient(180deg, color-mix(in srgb, var(--bp-accent) 10%, white), color-mix(in srgb, var(--bp-accent) 24%, white))",
        }}
      >
        {/* light ring behind the product */}
        <div className="absolute left-1/2 top-[56%] size-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70" aria-hidden="true" />
        <div className="absolute left-1/2 top-[56%] size-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/50" aria-hidden="true" />
        {product.image?.url ? (
          <img
            src={imageSrc(product.image, 300)}
            alt={product.image.alt || product.name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-contain p-3 pt-6 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <ShoppingBag size={40} strokeWidth={1.25} className="text-[var(--bp-deep)] opacity-30" />
          </div>
        )}
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-[var(--bp-deep)] px-2.5 py-1 text-[12px] font-semibold text-white">
            {product.badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4 pt-3.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="bp-display text-[23px] leading-[1.1]">{product.name}</h3>
          {product.price && <p className="tabular shrink-0 pt-1 text-[15px] font-semibold">{product.price}</p>}
        </div>
        {product.size && (
          <p className="bp-muted mt-1 text-[13.5px]">
            <span className="sr-only">{sizeLabel}: </span>
            {product.size}
          </p>
        )}
        {product.description && <p className="bp-muted mt-2 line-clamp-2 text-[14px] leading-snug">{product.description}</p>}
        <div className="flex-1" />
        {href && (
          <a href={href} target="_blank" rel="noopener noreferrer" className="bp-btn mt-4 min-h-11 w-full text-[14.5px]">
            {verb}
          </a>
        )}
      </div>
    </article>
  );
}

function PromotionCard({ promo, whatsapp, name }: { promo: Promotion; whatsapp: string; name: string }) {
  const href = promo.url ? normalizeUrl(promo.url) : whatsappLink(whatsapp, `Hello ${name}, I'd like to know more about "${promo.title}".`);
  if (promo.kind === "offer") {
    return (
      <article className="bp-card overflow-hidden">
        {promo.image?.url && (
          <div className="relative aspect-[2/1] overflow-hidden">
            <img src={imageSrc(promo.image, 600)} alt={promo.image.alt || ""} loading="lazy" className="size-full object-cover" />
            <span className="bp-chip absolute left-3 top-3 bg-white/90 text-[var(--bp-deep)] backdrop-blur">
              <Sparkles size={13} strokeWidth={2} />
              Special offer
            </span>
          </div>
        )}
        <div className="p-5">
          {!promo.image?.url && (
            <span className="bp-chip -ml-0.5 mb-3 bg-[var(--bp-tint)]">
              <Sparkles size={13} strokeWidth={2} />
              Special offer
            </span>
          )}
          <h3 className="bp-display text-[28px]">{promo.title}</h3>
          {promo.body && <p className="bp-muted mt-2 text-[15px]">{promo.body}</p>}
          {promo.ctaLabel && href && (
            <a href={href} target="_blank" rel="noopener noreferrer" className="bp-btn mt-4 w-full @md:w-auto">
              {promo.ctaLabel}
            </a>
          )}
        </div>
      </article>
    );
  }
  // Banner: compact and horizontal.
  const Tag = href ? "a" : "div";
  return (
    <Tag
      {...(href ? { href, target: "_blank", rel: "noopener noreferrer" } : {})}
      className="bp-card group flex items-center gap-4 overflow-hidden p-4 pr-5"
      style={{ background: "linear-gradient(120deg, var(--bp-tint-strong), var(--bp-tint))" }}
    >
      {promo.image?.url ? (
        <img src={imageSrc(promo.image, 80)} alt="" className="size-14 shrink-0 rounded-[calc(var(--bp-radius-card)/2)] object-cover" />
      ) : (
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--bp-deep)] text-white">
          <Megaphone size={20} strokeWidth={1.75} />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-semibold leading-snug">{promo.title}</span>
        {promo.body && <span className="bp-muted mt-0.5 block text-[14px] leading-snug">{promo.body}</span>}
      </span>
      {href && (
        <span className="hidden shrink-0 items-center gap-1 text-[14px] font-semibold @md:inline-flex">
          {promo.ctaLabel || "Learn more"}
          <ArrowUpRight size={16} strokeWidth={2} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      )}
      {href && <ArrowUpRight size={18} strokeWidth={1.75} className="shrink-0 @md:hidden" />}
    </Tag>
  );
}

function WebsiteCard({ content, heading }: { content: PageContent; heading: string }) {
  const { website } = content;
  const url = normalizeUrl(website.url);
  return (
    <section aria-labelledby="website-heading" data-section="website">
      <h2 id="website-heading" className="sr-only">
        {heading}
      </h2>
      <div className="bp-card overflow-hidden">
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer" className="group block p-2.5 pb-0">
            <div className="overflow-hidden rounded-[calc(var(--bp-radius-card)-6px)] ring-1 ring-[var(--bp-line)]">
              <div className="flex items-center gap-3 bg-[var(--bp-bg-2)] px-3 py-2">
                <span className="flex gap-1.5" aria-hidden="true">
                  <span className="size-2.5 rounded-full bg-[var(--bp-text)]/15" />
                  <span className="size-2.5 rounded-full bg-[var(--bp-text)]/15" />
                  <span className="size-2.5 rounded-full bg-[var(--bp-text)]/15" />
                </span>
                <span className="bp-muted flex min-w-0 flex-1 items-center justify-center gap-1.5 truncate rounded-full bg-[var(--bp-card)] px-3 py-1 text-[12px]">
                  <Globe size={12} strokeWidth={2} />
                  {displayUrl(website.url)}
                </span>
                <span className="w-[38px]" />
              </div>
              <div className="relative aspect-[16/10] overflow-hidden bg-[var(--bp-bg-2)]">
                {website.previewImage?.url ? (
                  <img
                    src={imageSrc(website.previewImage, 600)}
                    alt={website.previewImage.alt || `${website.title || "Website"} preview`}
                    loading="lazy"
                    className="size-full object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="grid size-full place-items-center">
                    <Globe size={44} strokeWidth={1} className="opacity-25" />
                  </div>
                )}
              </div>
            </div>
          </a>
        )}
        <div className="p-5">
          <h3 className="bp-display text-[26px]">{website.title || heading}</h3>
          {website.description && <p className="bp-muted mt-1.5 text-[15px]">{website.description}</p>}
          <div className="mt-4 flex flex-col gap-2.5 @md:flex-row">
            {url && (
              <a href={url} target="_blank" rel="noopener noreferrer" className="bp-btn flex-1">
                <Globe size={18} strokeWidth={1.75} />
                Visit website
              </a>
            )}
            {website.storeUrl && (
              <a
                href={normalizeUrl(website.storeUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="bp-btn flex-1 !border-current !bg-transparent !text-[var(--bp-text)]"
              >
                <ShoppingBag size={18} strokeWidth={1.75} />
                {website.storeLabel || "Online store"}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactRow({ icon, label, value, href, action }: { icon: React.ReactNode; label: string; value: string; href?: string; action?: React.ReactNode }) {
  return (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      className="group flex items-center gap-4 rounded-[var(--bp-radius-card)] bg-white/[0.06] p-3.5 pr-4 ring-1 ring-white/10 transition hover:bg-white/[0.1]"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--bp-accent)] text-[var(--bp-on-accent)]">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] text-white/60">{label}</span>
        <span className="block text-[15.5px] font-medium leading-snug text-white">{value}</span>
      </span>
      {action ?? <ArrowUpRight size={18} strokeWidth={1.75} className="shrink-0 text-white/50 transition group-hover:text-white" />}
    </a>
  );
}

function WaterSurface() {
  return (
    <svg className="bp-surface" viewBox="0 0 1200 48" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 30 C 150 8 300 8 450 26 S 750 46 900 24 S 1100 6 1200 20 L1200 48 L0 48 Z" fill="var(--bp-accent)" opacity="0.45" />
      <path d="M0 36 C 200 20 350 20 520 34 S 820 48 1000 32 S 1150 22 1200 28 L1200 48 L0 48 Z" fill="currentColor" />
    </svg>
  );
}

function Footer({ name, logo, pageUrl, light }: { name: string; logo?: ImageRef | null; pageUrl: string; light?: boolean }) {
  return (
    <footer className={cn("mt-14 flex flex-col items-center gap-5 border-t pt-8 text-center", light ? "border-[var(--bp-line)]" : "border-white/10")}>
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center overflow-hidden rounded-full bg-white">
          {logo?.url ? (
            <img src={imageSrc(logo, 36)} alt="" className="size-full object-cover" />
          ) : (
            <span className="text-[13px] font-bold text-[var(--bp-deep)]">{initials(name)}</span>
          )}
        </span>
        <span className="text-[15px] font-semibold">{name}</span>
      </div>
      <ShareButton
        url={pageUrl}
        title={name}
        label="Share this page"
        className={cn(
          "inline-flex h-11 items-center rounded-full px-5 text-[14px] font-semibold transition",
          light ? "bg-[var(--bp-tint)] hover:bg-[var(--bp-tint-strong)]" : "bg-white/10 text-white hover:bg-white/16",
        )}
      />
    </footer>
  );
}
