import type { CSSProperties } from "react";
import { contrast, deepen, isDark, mix, readableOn, rgba } from "@/lib/color";
import { FONT_PAIRINGS_DEF } from "@/lib/fonts";
import type { Appearance } from "@/lib/types";

/**
 * Turns a business's appearance settings into CSS custom properties. The
 * public page and the dashboard preview both render through these tokens,
 * so a color change is a single style update with no re-layout.
 */
export function businessTheme(appearance: Appearance): CSSProperties {
  const { primary, accent, background } = appearance;
  const deep = deepen(primary, 13);
  const abyss = mix(deep, "#000000", 0.35);
  const dark = background === "deep";

  const bg = {
    depth: mix(accent, "#FFFFFF", 0.9),
    mist: mix(accent, "#FFFFFF", 0.93),
    light: "#FFFFFF",
    deep: abyss,
  }[background];
  const bg2 = {
    depth: mix(accent, "#FFFFFF", 0.78),
    mist: mix(primary, "#FFFFFF", 0.9),
    light: mix(primary, "#FFFFFF", 0.95),
    deep: deep,
  }[background];

  const text = dark ? "#F2F7FA" : contrast(deep, bg) > 7 ? deep : "#0B1420";
  const muted = dark ? rgba("#F2F7FA", 0.7) : rgba(text, 0.66);

  // Main action color: brand primary on light pages, accent on dark ones
  // (a navy button on a navy page would disappear).
  const action = dark ? accent : isDark(primary) || contrast(primary, bg) > 3 ? primary : deep;
  const onAction = readableOn(action);
  // Accent used for text/icons must still pass contrast on the background.
  let accentInk = accent;
  for (let i = 0; i < 12 && contrast(accentInk, bg) < 3.2; i++) accentInk = mix(accentInk, dark ? "#FFFFFF" : "#000000", 0.12);

  const font = FONT_PAIRINGS_DEF[appearance.font] ?? FONT_PAIRINGS_DEF.tide;

  const radius = { pill: "999px", rounded: "14px", square: "4px" }[appearance.buttonShape];
  const cardRadius = { pill: "28px", rounded: "20px", square: "6px" }[appearance.buttonShape];

  return {
    "--bp-primary": primary,
    "--bp-accent": accent,
    "--bp-accent-ink": accentInk,
    "--bp-on-accent": readableOn(accent),
    "--bp-deep": deep,
    "--bp-abyss": abyss,
    "--bp-on-deep": "#F2F7FA",
    "--bp-bg": bg,
    "--bp-bg-2": bg2,
    "--bp-text": text,
    "--bp-muted": muted,
    "--bp-line": dark ? rgba("#FFFFFF", 0.12) : rgba(deep, 0.1),
    "--bp-tint": dark ? rgba(accent, 0.16) : rgba(accent, 0.16),
    "--bp-tint-strong": dark ? rgba(accent, 0.28) : rgba(accent, 0.26),
    "--bp-action": action,
    "--bp-on-action": onAction,
    "--bp-card": dark ? rgba("#FFFFFF", 0.06) : "#FFFFFF",
    "--bp-card-glass": dark ? rgba("#FFFFFF", 0.07) : rgba("#FFFFFF", 0.62),
    "--bp-shadow": dark
      ? "0 1px 0 rgba(255,255,255,0.06) inset, 0 20px 40px -24px rgba(0,0,0,0.6)"
      : `0 1px 2px ${rgba(deep, 0.06)}, 0 12px 32px -18px ${rgba(deep, 0.28)}`,
    "--bp-radius-btn": radius,
    "--bp-radius-card": cardRadius,
    "--bp-font-display": font.display,
    "--bp-font-body": font.body,
    "--bp-display-weight": String(font.displayWeight),
    "--bp-display-tracking": font.displayTracking,
  } as CSSProperties;
}

export function themeAttributes(appearance: Appearance) {
  return {
    "data-bg": appearance.background,
    "data-card": appearance.cardStyle,
    "data-fill": appearance.buttonFill,
    "data-shape": appearance.buttonShape,
  } as const;
}
