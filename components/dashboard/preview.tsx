"use client";

import { ExternalLink, Monitor, Smartphone } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BusinessPage } from "@/components/public/business-page";
import { Segmented } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { useEditor } from "./editor-context";

const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 820 };

/** Scales a fixed-size device to fit whatever space its container has. */
function useFitScale(box: { width: number; height: number }, padding = 32) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.7);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setScale(Math.min(1, (width - padding) / box.width, (height - padding) / box.height));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [box.width, box.height, padding]);
  return { ref, scale };
}

/**
 * The live preview renders the real public page component from the
 * in-memory draft, so every keystroke shows exactly what customers will see.
 */
const SECTION_FOR_PATH: Record<string, string> = {
  "/dashboard/social": "socials",
  "/dashboard/website": "website",
  "/dashboard/products": "products",
  "/dashboard/contact": "contact",
  "/dashboard/promotions": "promotions",
};

export function LivePreview({ className, compact }: { className?: string; compact?: boolean }) {
  const { draft, pageUrl, pageLabel } = useEditor();
  const [mode, setMode] = useState<"phone" | "desktop">("phone");
  const pathname = usePathname();
  const frame = useRef<HTMLDivElement>(null);

  // Follow the editor: show the part of the page being edited.
  useEffect(() => {
    const scroller = frame.current?.querySelector<HTMLElement>("[data-preview-scroll-root]");
    if (!scroller) return;
    const target = SECTION_FOR_PATH[pathname];
    const el = target ? scroller.querySelector<HTMLElement>(`[data-section="${target}"]`) : null;
    const top = el ? el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - 24 : 0;
    scroller.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, [pathname, mode]);
  const box = mode === "phone" ? PHONE : DESKTOP;
  const bezel = mode === "phone" ? 12 : 0;
  const chrome = mode === "desktop" ? 36 : 0;
  const outer = { width: box.width + bezel * 2, height: box.height + bezel * 2 + chrome };
  const { ref, scale } = useFitScale(outer, compact ? 16 : 40);

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="flex items-center justify-between gap-3 px-1 pb-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-success opacity-50" />
            <span className="relative size-2 rounded-full bg-success" />
          </span>
          <p className="truncate text-[13px] font-medium text-ink-2">Live preview</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Segmented
            size="sm"
            value={mode}
            onChange={setMode}
            options={[
              { value: "phone", label: <span className="sr-only">Phone</span>, icon: <Smartphone size={14} /> },
              { value: "desktop", label: <span className="sr-only">Desktop</span>, icon: <Monitor size={14} /> },
            ]}
          />
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="Open the live page"
            className="grid size-8 place-items-center rounded-sm text-muted hover:bg-ink/5 hover:text-ink"
          >
            <ExternalLink size={15} />
            <span className="sr-only">Open the live page</span>
          </a>
        </div>
      </div>

      <div ref={(node) => { ref.current = node; frame.current = node; }} className="relative grid min-h-0 flex-1 place-items-center overflow-hidden rounded-xl bg-[radial-gradient(120%_80%_at_50%_0%,#ffffff_0%,#eceef2_70%)] ring-1 ring-line/70">
        <div style={{ width: outer.width * scale, height: outer.height * scale }} className="relative">
          <div
            className="absolute left-0 top-0 origin-top-left transition-[width,height] duration-300"
            style={{ width: outer.width, height: outer.height, transform: `scale(${scale})` }}
          >
            {mode === "phone" ? (
              <div className="relative size-full rounded-[58px] bg-[#0e1018] p-3 shadow-[0_0_0_1px_#2a2e3b_inset,0_0_0_2px_#05060a,0_40px_80px_-30px_rgba(10,14,30,0.55),0_18px_36px_-18px_rgba(10,14,30,0.4)]">
                <div className="relative size-full overflow-hidden rounded-[46px] bg-white">
                  <div className="pointer-events-none absolute left-1/2 top-2.5 z-40 h-[30px] w-[112px] -translate-x-1/2 rounded-full bg-black" />
                  <div className="scroll-thin no-scrollbar size-full overflow-y-auto overscroll-contain" data-preview-scroll-root data-device="phone">
                    <BusinessPage content={draft} pageUrl={pageUrl} preview />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex size-full flex-col overflow-hidden rounded-xl bg-white shadow-[0_0_0_1px_rgba(22,26,43,0.1),0_40px_80px_-30px_rgba(10,14,30,0.45)]">
                <div className="flex h-9 shrink-0 items-center gap-3 border-b border-line-2 bg-[#f6f7f9] px-4">
                  <span className="flex gap-1.5">
                    <span className="size-3 rounded-full bg-[#ff5f57]" />
                    <span className="size-3 rounded-full bg-[#febc2e]" />
                    <span className="size-3 rounded-full bg-[#28c840]" />
                  </span>
                  <span className="mx-auto w-[420px] truncate rounded-md bg-white px-3 py-1 text-center text-[13px] text-muted ring-1 ring-line-2">
                    {pageLabel}
                  </span>
                  <span className="w-[52px]" />
                </div>
                <div className="scroll-thin min-h-0 flex-1 overflow-y-auto" data-preview-scroll-root>
                  <BusinessPage content={draft} pageUrl={pageUrl} preview />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
