"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, Loader2, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { uploadImageAction } from "@/app/dashboard/actions";
import { imageSrc } from "@/lib/images";
import type { ImageRef } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useToast } from "./toast";

type Shape = "logo" | "wide" | "product" | "banner";

/** Must match the server limit in app/dashboard/actions.ts. */
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const frames: Record<Shape, string> = {
  logo: "size-24 rounded-full",
  wide: "aspect-[16/9] w-full rounded-lg",
  product: "aspect-[4/5] w-full rounded-lg",
  banner: "aspect-[2/1] w-full rounded-lg",
};

/**
 * Upload with an instant local preview: the chosen file shows immediately
 * while it uploads, then swaps to the stored copy without a flash.
 */
export function ImageField({
  label,
  hint,
  value,
  onChange,
  shape = "wide",
  className,
}: {
  label: string;
  hint?: string;
  value: ImageRef | null | undefined;
  onChange: (value: ImageRef | null) => void;
  shape?: Shape;
  className?: string;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const toast = useToast();

  useEffect(() => () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
  }, [localPreview]);

  async function upload(file: File) {
    if (!file.type.startsWith("image/")) {
      toast({ tone: "error", title: "That file isn't an image", description: "Use a PNG, JPG, WebP, GIF or AVIF file." });
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      const mb = (file.size / 1024 / 1024).toFixed(1);
      toast({ tone: "error", title: `That image is ${mb} MB`, description: "Images must be 4 MB or smaller. Export a smaller version and try again." });
      return;
    }
    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);
    setUploading(true);
    const body = new FormData();
    body.set("file", file);
    const result = await uploadImageAction(body);
    setUploading(false);
    if (!result.ok) {
      setLocalPreview(null);
      toast({ tone: "error", title: "Upload failed", description: result.error });
      return;
    }
    onChange({ ...result.data, alt: value?.alt ?? "" });
    // Keep the local preview until the stored image has loaded, avoiding a blank frame.
    const img = new Image();
    img.onload = img.onerror = () => setLocalPreview(null);
    img.src = imageSrc(result.data, 400);
  }

  const shown = localPreview ?? (value?.url ? imageSrc(value, 400) : null);
  const isLogo = shape === "logo";

  return (
    <div className={cn("min-w-0", className)}>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label htmlFor={id} className="text-[13.5px] font-medium text-ink">
          {label}
        </label>
      </div>
      <div className={cn("flex gap-4", isLogo ? "items-center" : "flex-col")}>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) upload(file);
          }}
          className={cn(
            "group relative shrink-0 overflow-hidden transition-all duration-200",
            frames[shape],
            shown ? "checker ring-1 ring-line" : "border border-dashed border-[#cdd1da] bg-paper",
            dragging && "border-signal bg-signal-soft ring-2 ring-signal",
          )}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {shown ? (
              <motion.img
                key={shown}
                src={shown}
                alt={value?.alt || ""}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className={cn("absolute inset-0 size-full", shape === "product" ? "object-contain p-3" : "object-cover")}
              />
            ) : (
              <motion.button
                key="empty"
                type="button"
                onClick={() => input.current?.click()}
                className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-muted transition-colors hover:text-ink"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {isLogo ? (
                  <ImagePlus size={22} strokeWidth={1.5} />
                ) : (
                  <>
                    <span className="grid size-10 place-items-center rounded-full bg-surface shadow-sm ring-1 ring-line">
                      <UploadCloud size={18} strokeWidth={1.75} />
                    </span>
                    <span className="mt-1 text-[13px] font-medium text-ink-2">Drop an image or click to upload</span>
                    <span className="text-[12px] text-faint">PNG, JPG or WebP up to 4 MB</span>
                  </>
                )}
              </motion.button>
            )}
          </AnimatePresence>

          {uploading && (
            <div className="absolute inset-0 grid place-items-center bg-white/55 backdrop-blur-[2px]">
              <span className="inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1.5 text-[12px] font-medium text-white shadow-md">
                <Loader2 size={13} className="animate-spin" />
                {isLogo ? "" : "Uploading"}
              </span>
            </div>
          )}

          {shown && !uploading && !isLogo && (
            <div className="absolute right-2 top-2 flex gap-1.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
              <button
                type="button"
                onClick={() => input.current?.click()}
                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white/95 px-3 text-[12.5px] font-medium text-ink shadow-md ring-1 ring-black/5 hover:bg-white"
              >
                <RefreshCw size={13} />
                Replace
              </button>
              <button
                type="button"
                onClick={() => onChange(null)}
                aria-label={`Remove ${label.toLowerCase()}`}
                className="grid size-8 place-items-center rounded-full bg-white/95 text-danger shadow-md ring-1 ring-black/5 hover:bg-white"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>

        {isLogo && (
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => input.current?.click()}
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-surface px-3 text-[13px] font-medium text-ink shadow-xs ring-1 ring-line hover:bg-paper"
              >
                <UploadCloud size={15} />
                {shown ? "Replace" : "Upload logo"}
              </button>
              {shown && (
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  className="inline-flex h-9 items-center rounded-md px-3 text-[13px] font-medium text-danger hover:bg-danger-soft"
                >
                  Remove
                </button>
              )}
            </div>
            {hint && <p className="text-[12.5px] leading-relaxed text-muted">{hint}</p>}
          </div>
        )}
      </div>
      {!isLogo && hint && <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{hint}</p>}
      <input
        ref={input}
        id={id}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
