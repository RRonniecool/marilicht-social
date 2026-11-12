"use client";

import { forwardRef, useId, useLayoutEffect, useRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Field: label, helper text, error and character counter              */
/* ------------------------------------------------------------------ */

export function Field({
  label,
  hint,
  error,
  count,
  max,
  optional,
  children,
  className,
  htmlFor,
  aside,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  count?: number;
  max?: number;
  optional?: boolean;
  children: ReactNode;
  className?: string;
  htmlFor?: string;
  aside?: ReactNode;
}) {
  const over = max !== undefined && count !== undefined && count > max;
  return (
    <div className={cn("group/field min-w-0", className)}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-[13.5px] font-medium text-ink">
          {label}
          {optional && <span className="ml-1.5 font-normal text-faint">Optional</span>}
        </label>
        {aside}
        {max !== undefined && count !== undefined && count > max * 0.7 && (
          <span className={cn("tabular text-[12px]", over ? "font-medium text-danger" : "text-faint")}>
            {count}/{max}
          </span>
        )}
      </div>
      {children}
      {error ? (
        <p className="mt-1.5 text-[12.5px] text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export const inputClass =
  "block w-full min-w-0 rounded-md bg-surface px-3.5 text-[14.5px] text-ink shadow-xs ring-1 ring-line transition-[box-shadow,background-color] duration-150 placeholder:text-faint hover:ring-[#d3d6de] focus:outline-none focus:ring-2 focus:ring-signal aria-[invalid=true]:ring-danger disabled:bg-paper disabled:text-muted";

type InputProps = ComponentProps<"input"> & { leading?: ReactNode; trailing?: ReactNode; invalid?: boolean };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ leading, trailing, className, invalid, ...rest }, ref) {
  if (!leading && !trailing) {
    return <input ref={ref} aria-invalid={invalid || undefined} className={cn(inputClass, "h-10", className)} {...rest} />;
  }
  return (
    <div className="relative">
      {leading && <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-faint">{leading}</span>}
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(inputClass, "h-10", leading && "pl-9", trailing && "pr-10", className)}
        {...rest}
      />
      {trailing && <span className="absolute inset-y-0 right-0 flex items-center pr-2">{trailing}</span>}
    </div>
  );
});

/** Textarea that grows with its content. */
export function Textarea({ className, value, invalid, ...rest }: ComponentProps<"textarea"> & { invalid?: boolean }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      rows={3}
      aria-invalid={invalid || undefined}
      className={cn(inputClass, "resize-none py-2.5 leading-relaxed", className)}
      {...rest}
    />
  );
}

/** Text field bound to a value with label + counter in one call. */
export function TextField({
  label,
  hint,
  value,
  onChange,
  max,
  optional,
  multiline,
  error,
  leading,
  className,
  ...rest
}: {
  label: ReactNode;
  hint?: ReactNode;
  value: string;
  onChange: (value: string) => void;
  max?: number;
  optional?: boolean;
  multiline?: boolean;
  error?: string | null;
  leading?: ReactNode;
  className?: string;
} & Omit<ComponentProps<"input">, "value" | "onChange" | "className">) {
  const id = useId();
  return (
    <Field label={label} hint={hint} max={max} count={value.length} optional={optional} error={error} htmlFor={id} className={className}>
      {multiline ? (
        <Textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={rest.placeholder} invalid={Boolean(error)} />
      ) : (
        <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} leading={leading} invalid={Boolean(error)} {...rest} />
      )}
    </Field>
  );
}

/* ------------------------------------------------------------------ */
/* Switch                                                              */
/* ------------------------------------------------------------------ */

export function Switch({
  checked,
  onChange,
  label,
  size = "md",
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200",
        size === "md" ? "h-6 w-10" : "h-5 w-8",
        checked ? "bg-success" : "bg-[#d5d8e0]",
      )}
    >
      <span
        className={cn(
          "inline-block rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.25)] transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          size === "md" ? "size-5" : "size-4",
          checked ? (size === "md" ? "translate-x-[18px]" : "translate-x-[14px]") : "translate-x-0.5",
        )}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Segmented control                                                   */
/* ------------------------------------------------------------------ */

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
  size = "md",
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: ReactNode; icon?: ReactNode }[];
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <div role="radiogroup" className={cn("inline-flex rounded-md bg-ink/[0.05] p-0.5", className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[7px] font-medium transition-all duration-150",
              size === "md" ? "h-8 px-3 text-[13px]" : "h-7 px-2.5 text-[12.5px]",
              active ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink",
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
