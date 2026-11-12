"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AtSign, Plus, Trash2 } from "lucide-react";
import { SOCIAL_META } from "@/components/icons/brand";
import { Input } from "@/components/ui/field";
import { EmptyState, Panel } from "@/components/ui/misc";
import { SortableList } from "@/components/ui/sortable";
import { SOCIAL_PLATFORMS, type SocialPlatform } from "@/lib/types";
import { cn, uid } from "@/lib/utils";
import { useEditor } from "../editor-context";

export function SocialSection() {
  const { draft, update, errorFor } = useEditor();
  const used = new Set(draft.socials.map((s) => s.platform));
  const available = SOCIAL_PLATFORMS.filter((p) => p === "custom" || !used.has(p));

  function add(platform: SocialPlatform) {
    const id = uid("s");
    update((d) => void d.socials.push({ id, platform, url: "", label: platform === "custom" ? "" : undefined }));
    requestAnimationFrame(() => document.getElementById(`social-${id}`)?.focus());
  }

  return (
    <div className="space-y-5">
      <Panel
        title="Your accounts"
        description="Shown as icons under your name, in this order."
        actions={draft.socials.length > 0 ? <span className="tabular text-[13px] text-muted">{draft.socials.length} linked</span> : null}
      >
        {draft.socials.length === 0 ? (
          <EmptyState
            icon={<AtSign size={20} />}
            title="No social accounts yet"
            description="Add the platforms where customers can follow you. Pick one below to start."
          />
        ) : (
          <SortableList
            items={draft.socials}
            onReorder={(socials) => update((d) => void (d.socials = socials))}
            renderItem={(social, handle, index) => {
              const meta = SOCIAL_META[social.platform];
              const error = errorFor(`socials.${index}.url`);
              return (
                <div className="flex items-center gap-2 rounded-lg bg-surface p-2 pr-2.5 ring-1 ring-line/80">
                  {handle}
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-md text-white"
                    style={{ background: meta.brand, color: social.platform === "snapchat" ? "#111" : "#fff" }}
                  >
                    <meta.Icon size={18} />
                  </span>
                  <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[minmax(0,140px)_1fr] sm:items-center">
                    {social.platform === "custom" ? (
                      <Input
                        value={social.label ?? ""}
                        placeholder="Label, e.g. Pinterest"
                        aria-label="Link label"
                        onChange={(e) => update((d) => void (d.socials[index].label = e.target.value))}
                        className="h-9"
                      />
                    ) : (
                      <span className="hidden truncate text-[14px] font-medium text-ink sm:block">{meta.label}</span>
                    )}
                    <Input
                      id={`social-${social.id}`}
                      value={social.url}
                      placeholder={meta.placeholder}
                      aria-label={`${meta.label} link`}
                      inputMode="url"
                      invalid={Boolean(error)}
                      onChange={(e) => update((d) => void (d.socials[index].url = e.target.value.trim()))}
                      className="h-9"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => update((d) => void d.socials.splice(index, 1))}
                    aria-label={`Remove ${social.label || meta.label}`}
                    className="grid size-9 shrink-0 place-items-center rounded-md text-faint transition hover:bg-danger-soft hover:text-danger"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            }}
          />
        )}
      </Panel>

      <Panel title="Add a platform" description="Each platform can be added once. Use “Other link” for anything else.">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <AnimatePresence initial={false}>
            {available.map((platform) => {
              const meta = SOCIAL_META[platform];
              return (
                <motion.button
                  key={platform}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  type="button"
                  onClick={() => add(platform)}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg bg-surface p-2.5 text-left ring-1 ring-line/80 transition hover:-translate-y-px hover:shadow-md hover:ring-[#d3d6de]",
                  )}
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-md bg-paper text-ink-2 transition group-hover:text-white" style={{ ["--brand" as string]: meta.brand }}>
                    <span className="grid size-full place-items-center rounded-md transition group-hover:bg-[var(--brand)]">
                      <meta.Icon size={17} />
                    </span>
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-ink">{platform === "custom" ? "Other link" : meta.label}</span>
                  <Plus size={15} className="text-faint group-hover:text-ink" />
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </Panel>
    </div>
  );
}
