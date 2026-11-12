"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "success" | "error" | "info";
type Toast = { id: number; tone: Tone; title: string; description?: string; action?: { label: string; onClick: () => void } };
type ToastInput = Omit<Toast, "id">;

const ToastContext = createContext<((toast: ToastInput) => void) | null>(null);

export function useToast() {
  const push = useContext(ToastContext);
  if (!push) throw new Error("useToast must be used inside <Toaster>");
  return push;
}

const icons = {
  success: <CheckCircle2 size={18} className="text-[#34d399]" />,
  error: <AlertCircle size={18} className="text-[#f87171]" />,
  info: <Info size={18} className="text-[#93b4ff]" />,
};

export function Toaster({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((all) => all.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (toast: ToastInput) => {
      const id = ++counter.current;
      setToasts((all) => [...all.slice(-2), { ...toast, id }]);
      setTimeout(() => dismiss(id), toast.tone === "error" ? 6500 : 3800);
    },
    [dismiss],
  );

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-end sm:p-6"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 500, damping: 36 }}
              className="pointer-events-auto flex w-full max-w-[380px] items-start gap-3 rounded-lg bg-ink px-4 py-3 text-white shadow-pop"
            >
              <span className="mt-px shrink-0">{icons[toast.tone]}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium leading-snug">{toast.title}</p>
                {toast.description && <p className="mt-0.5 text-[13px] leading-snug text-white/65">{toast.description}</p>}
              </div>
              {toast.action && (
                <button
                  type="button"
                  onClick={() => {
                    toast.action?.onClick();
                    dismiss(toast.id);
                  }}
                  className="shrink-0 rounded-sm px-2 py-0.5 text-[13px] font-semibold text-[#93b4ff] hover:bg-white/10"
                >
                  {toast.action.label}
                </button>
              )}
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss"
                className={cn("-mr-1 shrink-0 rounded-sm p-0.5 text-white/50 hover:bg-white/10 hover:text-white")}
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
