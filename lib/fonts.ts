import {
  Bodoni_Moda,
  Cormorant_Garamond,
  Figtree,
  Hanken_Grotesk,
  Instrument_Sans,
  Jost,
  Schibsted_Grotesk,
  Young_Serif,
} from "next/font/google";
import type { FontPairing } from "@/lib/types";

/** Interface face for the dashboard and sign-in screens. */
export const uiFont = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-schibsted", display: "swap" });

/* Business page pairings. Only the default pairing is preloaded; the others
   download on demand when a business selects them. */
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-tide-display", display: "swap" });
const figtree = Figtree({ subsets: ["latin"], variable: "--font-tide-body", display: "swap" });
const bodoni = Bodoni_Moda({ subsets: ["latin"], variable: "--font-atelier-display", display: "swap", preload: false });
const jost = Jost({ subsets: ["latin"], variable: "--font-atelier-body", display: "swap", preload: false });
const youngSerif = Young_Serif({ subsets: ["latin"], weight: "400", variable: "--font-harbor-display", display: "swap", preload: false });
const instrumentSans = Instrument_Sans({ subsets: ["latin"], variable: "--font-harbor-body", display: "swap", preload: false });
const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-studio", display: "swap", preload: false });

/** Class list that registers every business font variable. */
export const businessFontVariables = [cormorant, figtree, bodoni, jost, youngSerif, instrumentSans, hanken]
  .map((font) => font.variable)
  .join(" ");

export type FontPairingDefinition = {
  id: FontPairing;
  label: string;
  description: string;
  display: string;
  body: string;
  /** Display weight that suits the face. */
  displayWeight: number;
  /** Optical tracking for the display face. */
  displayTracking: string;
};

export const FONT_PAIRINGS_DEF: Record<FontPairing, FontPairingDefinition> = {
  tide: {
    id: "tide",
    label: "Tide",
    description: "Refined serif with a clean sans",
    display: "var(--font-tide-display), Georgia, serif",
    body: "var(--font-tide-body), system-ui, sans-serif",
    displayWeight: 500,
    displayTracking: "-0.01em",
  },
  atelier: {
    id: "atelier",
    label: "Atelier",
    description: "High-contrast fashion serif",
    display: "var(--font-atelier-display), Didot, serif",
    body: "var(--font-atelier-body), system-ui, sans-serif",
    displayWeight: 500,
    displayTracking: "-0.02em",
  },
  harbor: {
    id: "harbor",
    label: "Harbor",
    description: "Warm, friendly and classic",
    display: "var(--font-harbor-display), Georgia, serif",
    body: "var(--font-harbor-body), system-ui, sans-serif",
    displayWeight: 400,
    displayTracking: "-0.015em",
  },
  studio: {
    id: "studio",
    label: "Studio",
    description: "Confident modern grotesk",
    display: "var(--font-studio), system-ui, sans-serif",
    body: "var(--font-studio), system-ui, sans-serif",
    displayWeight: 650,
    displayTracking: "-0.035em",
  },
};
