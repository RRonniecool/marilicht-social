"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Link2, Megaphone, PanelTop, Plus, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Switch, TextField } from "@/components/ui/field";
import { ImageField } from "@/components/ui/image-field";
import { EmptyState, Panel, Pill } from "@/components/ui/misc";
import { SortableList } from "@/components/ui/sortable";
import type { Promotion, PromotionKind } from "@/lib/types";
import { cn, uid } from "@/lib/utils";
import { useEditor } from "../editor-context";

const KINDS: Record<PromotionKind, { label: string; description: string; icon: typeof Sparkles; tone: string }> = {
  offer: { label: "Special offer", description: "A large card with an image and a button", icon: Sparkles, tone: "bg-[#fff1e0] text-[#b25e09]" },
  announcement: { label: "Announcement", description: "A short line at the very top of your page", icon: Megaphone, tone: "bg-signal-soft text-signal-ink" },
  banner: { label: "Banner", description: "A compact strip that links somewhere", icon: PanelTop, tone: "bg-[#e9f7f1] text-success" },
};

export function PromotionsSection() {
  const { draft, update } = useEditor();
  const [open, setOpen] = useState<string | null>(null);

  function add(kind: PromotionKind) {
    const id = uid("pr");
    update((d) =>
      void d.promotions.unshift({
        id,
        kind,
        title: kind === "announcement" ? "New: …" : kind === "offer" ? "This week's offer" : "Something new",
        body: "",
        image: null,
        ctaLabel: kind === "offer" ? "Claim on WhatsApp" : "",
        url: "",
        active: true,
      }),
    );
    setOpen(id);
  }

  function addLink() {
    const id = uid("l");
    update((d) => void d.links.push({ id, label: "", description: "", url: "" }));
    requestAnimationFrame(() => document.getElementById(`link-${id}`)?.focus());
  }

  return (
    <div className="space-y-5">
      <Panel title="Promotions" description="Switch a promotion off to hide it without deleting it.">
        <div className="mb-4 grid gap-2 sm:grid-cols-3">
          {(Object.keys(KINDS) as PromotionKind[]).map((kind) => {
            const meta = KINDS[kind];
            return (
              <button
                key={kind}
                type="button"
                onClick={() => add(kind)}
                className="group flex items-start gap-3 rounded-lg bg-surface p-3 text-left ring-1 ring-line/80 transition hover:-translate-y-px hover:shadow-md hover:ring-[#d3d6de]"
              >
                <span className={cn("grid size-8 shrink-0 place-items-center rounded-md", meta.tone)}>
                  <meta.icon size={16} />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1 text-[13.5px] font-medium text-ink">
                    <Plus size={13} className="text-faint" /> {meta.label}
                  </span>
                  <span className="mt-0.5 block text-[12.5px] leading-snug text-muted">{meta.description}</span>
                </span>
              </button>
            );
          })}
        </div>

        {draft.promotions.length === 0 ? (
          <EmptyState icon={<Sparkles size={20} />} title="No promotions running" description="Add an offer, announcement or banner above. They appear near the top of your page." />
        ) : (
          <SortableList
            items={draft.promotions}
            onReorder={(promotions) => update((d) => void (d.promotions = promotions))}
            renderItem={(promo, handle, index) => (
              <PromotionRow promo={promo} index={index} handle={handle} open={open === promo.id} onToggle={() => setOpen(open === promo.id ? null : promo.id)} />
            )}
          />
        )}
      </Panel>

      <Panel
        title="Link buttons"
        description="Full-width buttons for anything else: menus, booking forms, reports, events."
        actions={
          draft.links.length > 0 && (
            <Button size="sm" variant="secondary" icon={<Plus size={14} />} onClick={addLink}>
              Add link
            </Button>
          )
        }
      >
        {draft.links.length === 0 ? (
          <EmptyState
            icon={<Link2 size={20} />}
            title="No link buttons yet"
            description="Add links to your booking form, catalogue or anything you want customers to find quickly."
            action={
              <Button variant="primary" icon={<Plus size={15} />} onClick={addLink}>
                Add link
              </Button>
            }
          />
        ) : (
          <SortableList
            items={draft.links}
            onReorder={(links) => update((d) => void (d.links = links))}
            renderItem={(link, handle, index) => (
              <div className="flex items-start gap-2 rounded-lg bg-surface p-2 pr-2.5 ring-1 ring-line/80">
                <div className="pt-0.5">{handle}</div>
                <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
                  <Input
                    id={`link-${link.id}`}
                    value={link.label}
                    placeholder="Button text"
                    aria-label="Button text"
                    className="h-9 font-medium"
                    onChange={(e) => update((d) => void (d.links[index].label = e.target.value))}
                  />
                  <Input
                    value={link.url}
                    placeholder="https://"
                    inputMode="url"
                    aria-label="Link address"
                    className="h-9"
                    onChange={(e) => update((d) => void (d.links[index].url = e.target.value.trim()))}
                  />
                  <Input
                    value={link.description}
                    placeholder="Short description (optional)"
                    aria-label="Description"
                    className="h-9 sm:col-span-2"
                    onChange={(e) => update((d) => void (d.links[index].description = e.target.value))}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => update((d) => void d.links.splice(index, 1))}
                  aria-label="Remove link"
                  className="grid size-9 shrink-0 place-items-center rounded-md text-faint transition hover:bg-danger-soft hover:text-danger"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          />
        )}
      </Panel>
    </div>
  );
}

function PromotionRow({ promo, index, handle, open, onToggle }: { promo: Promotion; index: number; handle: React.ReactNode; open: boolean; onToggle: () => void }) {
  const { update, errorFor } = useEditor();
  const meta = KINDS[promo.kind];
  const set = <K extends keyof Promotion>(key: K, value: Promotion[K]) => update((d) => void (d.promotions[index][key] = value));

  return (
    <div className={cn("overflow-hidden rounded-lg bg-surface ring-1 transition", open ? "shadow-md ring-[#d3d6de]" : "ring-line/80", !promo.active && "bg-paper/60")}>
      <div className="flex items-center gap-2 p-2 pr-3">
        {handle}
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-md", meta.tone, !promo.active && "opacity-50")}>
          <meta.icon size={16} />
        </span>
        <button type="button" onClick={onToggle} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <span className="min-w-0 flex-1">
            <span className={cn("block truncate text-[14.5px] font-medium", promo.active ? "text-ink" : "text-muted")}>{promo.title || "Untitled"}</span>
            <span className="block truncate text-[12.5px] text-muted">{meta.label}</span>
          </span>
          {!promo.active && <Pill>Hidden</Pill>}
          <ChevronDown size={17} className={cn("shrink-0 text-faint transition-transform duration-200", open && "rotate-180")} />
        </button>
        <Switch label={promo.active ? "Hide promotion" : "Show promotion"} checked={promo.active} onChange={(v) => set("active", v)} size="sm" />
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
            <div className="space-y-4 border-t border-line-2 p-4 sm:p-5">
              <TextField label="Title" value={promo.title} max={90} error={errorFor(`promotions.${index}.title`)} onChange={(v) => set("title", v)} />
              {promo.kind !== "announcement" && (
                <>
                  <TextField label="Details" optional multiline value={promo.body} max={280} error={errorFor(`promotions.${index}.body`)} onChange={(v) => set("body", v)} />
                  <ImageField
                    label={promo.kind === "offer" ? "Image" : "Thumbnail"}
                    hint={promo.kind === "offer" ? "Wide image, 1200 × 600 px." : "Small square image, optional."}
                    shape="banner"
                    value={promo.image}
                    onChange={(image) => set("image", image)}
                  />
                  <div className="grid gap-4 sm:grid-cols-[1fr_1.4fr]">
                    <TextField label="Button text" optional placeholder="Claim on WhatsApp" value={promo.ctaLabel} max={30} error={errorFor(`promotions.${index}.ctaLabel`)} onChange={(v) => set("ctaLabel", v)} />
                    <TextField
                      label="Button link"
                      optional
                      inputMode="url"
                      placeholder="Leave empty to open WhatsApp"
                      value={promo.url}
                      max={500}
                      error={errorFor(`promotions.${index}.url`)}
                      onChange={(v) => set("url", v.trim())}
                    />
                  </div>
                </>
              )}
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 size={14} />}
                  className="text-danger hover:bg-danger-soft hover:text-danger"
                  onClick={() => update((d) => void d.promotions.splice(index, 1))}
                >
                  Delete promotion
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
