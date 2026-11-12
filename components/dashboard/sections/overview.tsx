"use client";

import { motion } from "framer-motion";
import { ArrowRight, AtSign, Check, Copy, ExternalLink, Link2, Megaphone, Package, QrCode, Sparkles } from "lucide-react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { WhatsAppIcon } from "@/components/icons/brand";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { deepen } from "@/lib/color";
import { SITE_NAME } from "@/lib/config";
import { cn, formatRelative } from "@/lib/utils";
import { useEditor } from "../editor-context";
import { PublishControls } from "../shell";

export function OverviewSection() {
  const { draft, publishedAt, pageUrl, pageLabel, hasUnpublishedChanges, published } = useEditor();
  const toast = useToast();
  const deep = deepen(draft.appearance.primary, 13);
  const name = draft.profile.name || SITE_NAME;

  const status = published ? { tone: "live" as const, label: "Live" } : { tone: "draft" as const, label: "Not published yet" };

  async function copy() {
    await navigator.clipboard.writeText(pageUrl);
    toast({ tone: "success", title: "Link copied", description: pageLabel });
  }

  const checklist = [
    { done: Boolean(draft.profile.logo?.url), label: "Add your logo", href: "/dashboard/profile" },
    { done: draft.profile.description.length >= 60, label: "Describe your business in a sentence or two", href: "/dashboard/profile" },
    { done: Boolean(draft.profile.cover?.url), label: "Upload a cover image", href: "/dashboard/profile" },
    { done: Boolean(draft.contact.whatsapp), label: "Add a WhatsApp number for orders", href: "/dashboard/contact" },
    { done: draft.products.length >= 3, label: "Show at least three products", href: "/dashboard/products" },
    { done: draft.socials.length >= 2, label: "Link two or more social accounts", href: "/dashboard/social" },
    { done: draft.contact.hours.some((h) => !h.closed), label: "Set your opening hours", href: "/dashboard/contact" },
    { done: Boolean(draft.website.url || draft.website.storeUrl), label: "Link your website or online store", href: "/dashboard/website" },
  ];
  const done = checklist.filter((c) => c.done).length;
  const progress = done / checklist.length;

  const stats = [
    { label: "Products", value: draft.products.length, icon: Package, href: "/dashboard/products" },
    { label: "Social accounts", value: draft.socials.length, icon: AtSign, href: "/dashboard/social" },
    { label: "Active promotions", value: draft.promotions.filter((p) => p.active).length, icon: Megaphone, href: "/dashboard/promotions" },
    { label: "Link buttons", value: draft.links.length, icon: Link2, href: "/dashboard/promotions" },
  ];

  return (
    <div className="space-y-5">
      <div className="lg:hidden">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-ink">Hello, {name}</h1>
      </div>

      {/* The page card wears the business's own colors */}
      <section
        className="relative overflow-hidden rounded-xl text-white shadow-md"
        style={{
          background: `radial-gradient(90% 120% at 100% 0%, ${draft.appearance.accent}55 0%, transparent 55%), linear-gradient(135deg, ${deep}, ${deepen(deep, 16)})`,
        }}
      >
        <div className="relative flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:p-7">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone={status.tone} dot className="bg-white/12 text-white">
                {status.label}
              </Pill>
              {publishedAt && <span className="text-[12.5px] text-white/60">Published {formatRelative(publishedAt)}</span>}
            </div>
            <p className="mt-4 text-[13px] text-white/60">Your page address</p>
            <p className="mt-0.5 truncate text-[24px] font-semibold tracking-[-0.02em] sm:text-[28px]">{pageLabel}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copy}
                className="inline-flex h-9 items-center gap-2 rounded-md bg-white px-3.5 text-[13.5px] font-medium text-ink shadow-sm transition hover:bg-white/90 active:scale-[0.98]"
              >
                <Copy size={15} /> Copy link
              </button>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-md bg-white/12 px-3.5 text-[13.5px] font-medium ring-1 ring-white/20 transition hover:bg-white/20"
              >
                <ExternalLink size={15} /> Open page
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${name}: ${pageUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-md bg-white/12 px-3.5 text-[13.5px] font-medium ring-1 ring-white/20 transition hover:bg-white/20"
              >
                <WhatsAppIcon size={16} /> Share on WhatsApp
              </a>
            </div>
          </div>
          <Link
            href="/dashboard/qr"
            className="group flex shrink-0 items-center gap-4 self-start rounded-lg bg-white p-3 text-ink shadow-lg transition hover:-translate-y-0.5 sm:flex-col sm:gap-2 sm:self-auto"
          >
            <QRCodeSVG value={pageUrl} size={104} fgColor={deep} marginSize={0} level="M" />
            <span className="inline-flex items-center gap-1 text-[12.5px] font-medium text-ink-2 group-hover:text-ink">
              <QrCode size={14} /> QR code
            </span>
          </Link>
        </div>
      </section>

      {hasUnpublishedChanges && (
        <section
          className="animate-fade-in flex flex-col gap-3 rounded-xl bg-signal-soft p-4 ring-1 ring-signal/15 sm:flex-row sm:items-center sm:p-5"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-signal shadow-sm">
            <Sparkles size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14.5px] font-semibold text-ink">{published ? "You have unpublished changes" : "Your page isn't live yet"}</p>
            <p className="text-[13.5px] text-ink-2">
              {published ? "Customers still see the previous version. Publish when you're ready." : "Publish to make it visible at your address."}
            </p>
          </div>
          <div className="hidden lg:block">
            <PublishControls />
          </div>
        </section>
      )}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group rounded-xl bg-surface p-4 shadow-sm ring-1 ring-line/70 transition hover:ring-[#d3d6de]"
          >
            <stat.icon size={17} strokeWidth={1.75} className="text-muted group-hover:text-ink" />
            <p className="tabular mt-3 text-[26px] font-semibold leading-none tracking-[-0.02em] text-ink">{stat.value}</p>
            <p className="mt-1.5 text-[13px] text-muted">{stat.label}</p>
          </Link>
        ))}
      </section>

      <section className="rounded-xl bg-surface shadow-sm ring-1 ring-line/70">
        <header className="flex items-center gap-4 px-5 pb-2 pt-5 sm:px-6">
          <ProgressRing value={progress} />
          <div>
            <h2 className="text-[15.5px] font-semibold text-ink">{done === checklist.length ? "Your page is complete" : "Finish your page"}</h2>
            <p className="text-[13.5px] text-muted">
              {done} of {checklist.length} done. Complete pages get more orders.
            </p>
          </div>
        </header>
        <ul className="px-2 pb-2 sm:px-3">
          {checklist.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2.5 text-[14px] transition-colors",
                  item.done ? "text-muted" : "text-ink hover:bg-paper",
                )}
              >
                <span
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-full",
                    item.done ? "bg-success text-white" : "ring-[1.5px] ring-inset ring-[#c9cdd6]",
                  )}
                >
                  {item.done && <Check size={12} strokeWidth={3} />}
                </span>
                <span className={cn("flex-1", item.done && "line-through decoration-faint")}>{item.label}</span>
                {!item.done && <ArrowRight size={15} className="text-faint transition group-hover:translate-x-0.5 group-hover:text-ink" />}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="pb-2 text-center text-[13px] text-muted">
        Need to make changes? Pick a section from the menu. Edits save as a draft automatically.
      </p>
      <div className="flex justify-center lg:hidden">
        <Button variant="ghost" size="sm" onClick={copy} icon={<Copy size={14} />}>
          Copy page link
        </Button>
      </div>
    </div>
  );
}

function ProgressRing({ value }: { value: number }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 44 44" className="size-11 shrink-0 -rotate-90" aria-hidden="true">
      <circle cx="22" cy="22" r={r} fill="none" stroke="var(--color-line)" strokeWidth="4" />
      <motion.circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        stroke={value === 1 ? "var(--color-success)" : "var(--color-signal)"}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - value) }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}
