"use client";

import { Check, Pipette } from "lucide-react";
import { useId, useState } from "react";
import { readableOn } from "@/lib/color";
import { cn } from "@/lib/utils";

const HEX = /^#[0-9a-fA-F]{6}$/;

/**
 * Brand color input: curated swatches for one-tap choices, a hex field for
 * exact brand values, and the system picker for everything else.
 */
export function ColorField({
  label,
  hint,
  value,
  onChange,
  swatches,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  swatches: string[];
}) {
  const id = useId();
  // While typing, show the raw text; otherwise mirror the saved value.
  const [typing, setTyping] = useState<string | null>(null);
  const text = typing ?? value;

  function commit(next: string) {
    const normalized = next.startsWith("#") ? next : `#${next}`;
    if (HEX.test(normalized)) onChange(normalized.toUpperCase());
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13.5px] font-medium text-ink">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <label
          className="relative grid size-10 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-md shadow-xs ring-1 ring-black/10 transition-transform hover:scale-[1.04]"
          style={{ background: value, color: readableOn(value) }}
          title="Pick any color"
        >
          <Pipette size={15} strokeWidth={2} className="opacity-80" />
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label={`${label}: open color picker`}
          />
        </label>
        <div className="relative w-[118px]">
          <input
            id={id}
            value={text}
            onChange={(e) => {
              setTyping(e.target.value);
              commit(e.target.value);
            }}
            onBlur={() => setTyping(null)}
            spellCheck={false}
            maxLength={7}
            className="tabular h-10 w-full rounded-md bg-surface px-3 font-mono text-[13.5px] uppercase text-ink shadow-xs ring-1 ring-line focus:outline-none focus:ring-2 focus:ring-signal"
          />
        </div>
        <div className="no-scrollbar flex min-w-0 gap-1.5 overflow-x-auto py-1 pl-1">
          {swatches.map((swatch) => {
            const active = swatch.toUpperCase() === value.toUpperCase();
            return (
              <button
                key={swatch}
                type="button"
                onClick={() => onChange(swatch.toUpperCase())}
                aria-label={`Use ${swatch}`}
                aria-pressed={active}
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full ring-1 ring-black/10 transition-transform duration-150 hover:scale-110",
                  active && "ring-2 ring-signal ring-offset-2",
                )}
                style={{ background: swatch, color: readableOn(swatch) }}
              >
                {active && <Check size={13} strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      </div>
      {hint && <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{hint}</p>}
    </div>
  );
}
