import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Panel: the standard editing surface                                  */
/* ------------------------------------------------------------------ */

export function Panel({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("rounded-xl bg-surface shadow-sm ring-1 ring-line/70", className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 px-5 pb-1 pt-5 sm:px-6">
          <div className="min-w-0">
            {title && <h2 className="text-[15.5px] font-semibold tracking-[-0.01em] text-ink">{title}</h2>}
            {description && <p className="mt-1 max-w-[60ch] text-[13.5px] leading-relaxed text-muted">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn("px-5 pb-5 pt-4 sm:px-6 sm:pb-6", bodyClassName)}>{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Status pill                                                          */
/* ------------------------------------------------------------------ */

const tones = {
  live: "bg-success-soft text-success",
  draft: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-ink/[0.05] text-ink-2",
  signal: "bg-signal-soft text-signal-ink",
} as const;

export function Pill({ tone = "neutral", children, dot, className }: { tone?: keyof typeof tones; children: ReactNode; dot?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[12px] font-medium", tones[tone], className)}>
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Empty state                                                          */
/* ------------------------------------------------------------------ */

export function EmptyState({ icon, title, description, action, className }: { icon: ReactNode; title: string; description: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center rounded-lg border border-dashed border-line px-6 py-10 text-center", className)}>
      <span className="grid size-12 place-items-center rounded-full bg-paper text-ink-2 ring-1 ring-line">{icon}</span>
      <h3 className="mt-4 text-[15px] font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-[42ch] text-[13.5px] leading-relaxed text-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} aria-hidden="true" />;
}
