"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/**
 * Modal dialog. On phones it rises from the bottom as a sheet; on larger
 * screens it is a centred panel. Escape and the backdrop close it.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab" && panel.current) {
        const focusable = panel.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => {
      panel.current?.querySelector<HTMLElement>("input, textarea, select, button[data-autofocus]")?.focus();
    });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      cancelAnimationFrame(raf);
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-[#0d1020]/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
            className={cn(
              "relative flex max-h-[92svh] w-full flex-col overflow-hidden rounded-t-xl bg-surface shadow-pop sm:rounded-xl",
              { sm: "sm:max-w-[420px]", md: "sm:max-w-[560px]", lg: "sm:max-w-[760px]" }[size],
            )}
          >
            <div className="flex items-start justify-between gap-4 border-b border-line-2 px-5 pb-4 pt-5 sm:px-6">
              <div>
                <h2 id={titleId} className="text-[17px] font-semibold tracking-[-0.01em] text-ink">
                  {title}
                </h2>
                {description && <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{description}</p>}
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className="-mr-1.5 -mt-1 rounded-sm p-1.5 text-faint hover:bg-ink/5 hover:text-ink">
                <X size={18} />
              </button>
            </div>
            <div className="scroll-thin flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
            {footer && (
              <div className="flex flex-col-reverse gap-2 border-t border-line-2 bg-paper/60 px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:px-6">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
