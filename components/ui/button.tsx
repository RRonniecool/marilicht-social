import { Loader2 } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "signal" | "soft";
export type ButtonSize = "sm" | "md" | "lg" | "icon" | "icon-sm";

const base =
  "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-medium transition-[background-color,box-shadow,color,transform,opacity] duration-150 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-white shadow-[0_1px_0_rgb(255_255_255/0.12)_inset,0_1px_2px_rgb(22_26_43/0.2),0_4px_12px_-4px_rgb(22_26_43/0.4)] hover:bg-[#232842]",
  secondary: "bg-surface text-ink ring-1 ring-line shadow-xs hover:bg-[#fafbfc] hover:ring-[#d6d9e1]",
  ghost: "text-ink-2 hover:bg-ink/[0.05] hover:text-ink",
  danger: "bg-danger text-white shadow-xs hover:bg-[#bd3030]",
  signal: "bg-signal text-white shadow-[0_1px_0_rgb(255_255_255/0.18)_inset,0_4px_12px_-4px_rgb(46_91_255/0.6)] hover:bg-signal-ink",
  soft: "bg-ink/[0.05] text-ink hover:bg-ink/[0.08]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 rounded-sm px-3 text-[13px]",
  md: "h-10 rounded-md px-4 text-[14px]",
  lg: "h-12 rounded-md px-5 text-[15px]",
  icon: "size-10 rounded-md",
  "icon-sm": "size-8 rounded-sm",
};

type Common = { variant?: ButtonVariant; size?: ButtonSize; loading?: boolean; icon?: ReactNode; className?: string; children?: ReactNode };

export function buttonClass({ variant = "secondary", size = "md", className }: Pick<Common, "variant" | "size" | "className">) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({ variant, size, loading, icon, className, children, disabled, ...rest }: Common & ComponentProps<"button">) {
  return (
    <button type="button" className={buttonClass({ variant, size, className })} disabled={disabled || loading} {...rest}>
      {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

export function ButtonLink({ variant, size, icon, className, children, ...rest }: Common & ComponentProps<typeof Link>) {
  return (
    <Link className={buttonClass({ variant, size, className })} {...rest}>
      {icon}
      {children}
    </Link>
  );
}
