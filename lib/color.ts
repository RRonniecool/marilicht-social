/** Small color toolkit used to derive accessible theme tokens from two brand colors. */

export type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB {
  const clean = hex.replace("#", "");
  const value = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean.padEnd(6, "0");
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) || 0) as RGB;
}

export function rgbToHex([r, g, b]: RGB) {
  return `#${[r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("")}`;
}

/** Linear mix: amount 0 → a, 1 → b. */
export function mix(a: string, b: string, amount: number) {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  return rgbToHex([0, 1, 2].map((i) => x[i] + (y[i] - x[i]) * amount) as RGB);
}

export function luminance(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

export const isDark = (hex: string) => luminance(hex) < 0.22;

/** Picks whichever of the two candidates reads better on the background. */
export function readableOn(bg: string, light = "#FFFFFF", dark = "#0B1420") {
  return contrast(bg, light) >= contrast(bg, dark) ? light : dark;
}

export function rgba(hex: string, alpha: number) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Darkens until the color reaches the requested contrast against white. */
export function deepen(hex: string, target = 12) {
  let color = hex;
  for (let i = 0; i < 20 && contrast(color, "#FFFFFF") < target; i++) color = mix(color, "#000000", 0.12);
  return color;
}
