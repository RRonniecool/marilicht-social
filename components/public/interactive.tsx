"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Share2 } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/brand";
import { openStatus } from "@/lib/hours";
import type { OpeningHours } from "@/lib/types";
import { cn } from "@/lib/utils";

/* Ticks once a minute so "Open until…" stays correct on a page left open. */
function subscribeMinute(callback: () => void) {
  const id = setInterval(callback, 60_000);
  return () => clearInterval(id);
}
const getMinute = () => Math.floor(Date.now() / 60_000);
const getServerMinute = () => 0;

/** Live open/closed status computed in the visitor's local time. */
export function OpenStatusChip({ hours, className }: { hours: OpeningHours[]; className?: string }) {
  const minute = useSyncExternalStore(subscribeMinute, getMinute, getServerMinute);
  if (!minute) return null; // server render: time-dependent, so render on the client only
  const status = openStatus(hours);
  if (!status) return null;
  return (
    <span className={cn("bp-chip", className)}>
      <span className="relative flex size-2">
        {status.open && <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-60" />}
        <span className={cn("relative size-2 rounded-full", status.open ? "bg-emerald-400" : "bg-amber-300")} />
      </span>
      {status.label}
    </span>
  );
}

/** Index of today's row for the hours table (client only). */
export function useTodayIndex() {
  const minute = useSyncExternalStore(subscribeMinute, getMinute, getServerMinute);
  return minute ? (new Date().getDay() + 6) % 7 : -1;
}

export function HoursList({ groups }: { groups: { days: string; text: string; from: number; to: number }[] }) {
  const today = useTodayIndex();
  return (
    <ul className="divide-y divide-white/10">
      {groups.map((g) => {
        const isToday = today >= g.from && today <= g.to;
        return (
          <li key={g.days} className="flex items-baseline justify-between gap-4 py-3 text-[15px]">
            <span className={cn("flex items-center gap-2", isToday ? "font-semibold text-white" : "text-white/70")}>
              {g.days}
              {isToday && <span className="rounded-full bg-white/12 px-2 py-0.5 text-[11px] font-medium text-white/90">Today</span>}
            </span>
            <span className={cn("tabular text-right", isToday ? "font-semibold text-white" : "text-white/70", g.text === "Closed" && "text-white/45")}>
              {g.text}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** Native share sheet where supported, copy-to-clipboard otherwise. */
export function ShareButton({
  url,
  title,
  className,
  label,
  iconOnly,
}: {
  url: string;
  title: string;
  className?: string;
  label?: string;
  iconOnly?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function share() {
    try {
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      /* share sheet dismissed */
    }
  }

  return (
    <button type="button" onClick={share} className={className} aria-label={iconOnly ? "Share this page" : undefined}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={copied ? "copied" : "share"}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.15 }}
          className="inline-flex items-center gap-2"
        >
          {copied ? <Check size={18} strokeWidth={2} /> : <Share2 size={18} strokeWidth={1.75} />}
          {!iconOnly && (copied ? "Link copied" : label ?? "Share")}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

/**
 * Mobile order bar. Appears once the hero's order button scrolls out of
 * view, so the page never shows two identical calls to action at once.
 */
export function StickyOrderBar({ href, label, pageUrl, title }: { href: string; label: string; pageUrl: string; title: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current?.closest(".bp");
    const target = root?.querySelector("[data-hero-cta]");
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0), {
      threshold: 0,
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="pointer-events-none sticky bottom-0 z-30 h-0 @3xl:hidden">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="pointer-events-auto absolute inset-x-0 bottom-0 px-4 pb-[max(14px,env(safe-area-inset-bottom))]"
          >
            <div className="flex items-center gap-2 rounded-full bg-[var(--bp-abyss)]/85 p-1.5 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.55)] ring-1 ring-white/10 backdrop-blur-xl">
              <a href={href} target="_blank" rel="noopener noreferrer" className="bp-btn bp-btn-accent min-h-12 flex-1 !rounded-full">
                <WhatsAppIcon size={20} />
                {label}
              </a>
              <ShareButton
                url={pageUrl}
                title={title}
                iconOnly
                className="grid size-12 shrink-0 place-items-center rounded-full text-white/90 transition hover:bg-white/10"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
