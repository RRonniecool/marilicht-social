"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Check } from "lucide-react";
import type { ReactNode } from "react";
import { ColorField } from "@/components/ui/color-field";
import { Panel } from "@/components/ui/misc";
import { contrast, deepen, mix } from "@/lib/color";
import { FONT_PAIRINGS_DEF } from "@/lib/fonts";
import { businessTheme } from "@/lib/theme";
import { BACKGROUNDS, BUTTON_FILLS, BUTTON_SHAPES, CARD_STYLES, FONT_PAIRINGS, type Appearance } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useEditor } from "../editor-context";

const PALETTES: { name: string; primary: string; accent: string }[] = [
  { name: "Spring", primary: "#0A2342", accent: "#3CC3E3" },
  { name: "Lagoon", primary: "#06363F", accent: "#2DD4BF" },
  { name: "Glacier", primary: "#1B2A4A", accent: "#9CC9FF" },
  { name: "Citrus", primary: "#123524", accent: "#F2C14E" },
  { name: "Ember", primary: "#3B1F14", accent: "#E8A33D" },
  { name: "Orchid", primary: "#2A1B3D", accent: "#C084FC" },
  { name: "Atelier", primary: "#1C1C1C", accent: "#C9A27E" },
  { name: "Coral", primary: "#2B2D42", accent: "#FF7A6B" },
];

const PRIMARY_SWATCHES = ["#0A2342", "#06363F", "#123524", "#3B1F14", "#2A1B3D", "#1C1C1C", "#7A1E2C"];
const ACCENT_SWATCHES = ["#3CC3E3", "#2DD4BF", "#9CC9FF", "#F2C14E", "#E8A33D", "#FF7A6B", "#C084FC"];

const BG_LABELS: Record<Appearance["background"], { label: string; description: string }> = {
  depth: { label: "Depth", description: "Light, sinking into your brand color" },
  mist: { label: "Mist", description: "A soft tint of your accent" },
  light: { label: "Clean", description: "Plain white" },
  deep: { label: "Night", description: "Dark from top to bottom" },
};

export function AppearanceSection() {
  const { draft, update } = useEditor();
  const a = draft.appearance;
  const set = <K extends keyof Appearance>(key: K, value: Appearance[K]) => update((d) => void (d.appearance[key] = value));
  const accentContrast = contrast(a.accent, "#FFFFFF");

  return (
    <div className="space-y-5">
      <Panel title="Color palette" description="Start from a palette, then fine-tune your exact brand colors below.">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PALETTES.map((p) => {
            const active = p.primary === a.primary && p.accent === a.accent;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => update((d) => void Object.assign(d.appearance, { primary: p.primary, accent: p.accent }))}
                aria-pressed={active}
                className={cn(
                  "group relative overflow-hidden rounded-lg text-left ring-1 transition hover:-translate-y-px hover:shadow-md",
                  active ? "ring-2 ring-signal" : "ring-line/80",
                )}
              >
                <span className="relative flex h-16 items-end p-2" style={{ background: `linear-gradient(140deg, ${deepen(p.primary, 13)} 45%, ${p.accent} 140%)` }}>
                  <span className="h-2 w-10 rounded-full" style={{ background: p.accent }} />
                  {active && (
                    <motion.span layoutId="palette-check" className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-white text-signal">
                      <Check size={12} strokeWidth={3} />
                    </motion.span>
                  )}
                </span>
                <span className="block bg-surface px-2.5 py-2 text-[13px] font-medium text-ink">{p.name}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-6 space-y-5">
          <ColorField
            label="Brand color"
            hint="Used for the header, buttons and the contact section. Darker colors work best."
            value={a.primary}
            onChange={(v) => set("primary", v)}
            swatches={PRIMARY_SWATCHES}
          />
          <ColorField
            label="Accent color"
            hint="Used for your main order button and highlights."
            value={a.accent}
            onChange={(v) => set("accent", v)}
            swatches={ACCENT_SWATCHES}
          />
          {accentContrast < 1.25 && (
            <p className="flex items-start gap-2 rounded-md bg-warn-soft p-3 text-[13px] text-warn">
              <AlertTriangle size={15} className="mt-px shrink-0" />
              This accent is very close to white, so highlights may be hard to see on light backgrounds.
            </p>
          )}
        </div>
      </Panel>

      <Panel title="Background" description="Sets the mood of the whole page.">
        <TileGrid>
          {BACKGROUNDS.map((bg) => (
            <Tile key={bg} active={a.background === bg} onClick={() => set("background", bg)} label={BG_LABELS[bg].label} description={BG_LABELS[bg].description}>
              <MiniPage appearance={{ ...a, background: bg }} />
            </Tile>
          ))}
        </TileGrid>
      </Panel>

      <Panel title="Buttons">
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-[13.5px] font-medium text-ink">Shape</p>
            <TileGrid cols={3}>
              {BUTTON_SHAPES.map((shape) => (
                <Tile key={shape} compact active={a.buttonShape === shape} onClick={() => set("buttonShape", shape)} label={{ pill: "Pill", rounded: "Rounded", square: "Sharp" }[shape]}>
                  <span
                    className="mx-auto block h-7 w-[78%]"
                    style={{ background: deepen(a.primary, 13), borderRadius: { pill: 999, rounded: 8, square: 2 }[shape] }}
                  />
                </Tile>
              ))}
            </TileGrid>
          </div>
          <div>
            <p className="mb-2 text-[13.5px] font-medium text-ink">Style</p>
            <TileGrid cols={3}>
              {BUTTON_FILLS.map((fill) => {
                const deep = deepen(a.primary, 13);
                const style =
                  fill === "solid"
                    ? { background: deep }
                    : fill === "soft"
                      ? { background: mix(a.accent, "#FFFFFF", 0.7) }
                      : { boxShadow: `inset 0 0 0 1.5px ${deep}` };
                return (
                  <Tile key={fill} compact active={a.buttonFill === fill} onClick={() => set("buttonFill", fill)} label={{ solid: "Solid", soft: "Soft", outline: "Outline" }[fill]}>
                    <span className="mx-auto block h-7 w-[78%]" style={{ ...style, borderRadius: { pill: 999, rounded: 8, square: 2 }[a.buttonShape] }} />
                  </Tile>
                );
              })}
            </TileGrid>
          </div>
        </div>
      </Panel>

      <Panel title="Cards" description="How products, links and offers sit on the page.">
        <TileGrid>
          {CARD_STYLES.map((card) => (
            <Tile
              key={card}
              active={a.cardStyle === card}
              onClick={() => set("cardStyle", card)}
              label={{ raised: "Raised", outlined: "Outlined", glass: "Glass", flat: "Flat" }[card]}
            >
              <MiniCards appearance={{ ...a, cardStyle: card }} />
            </Tile>
          ))}
        </TileGrid>
      </Panel>

      <Panel title="Typography" description="Headings use the display face; everything else uses its partner.">
        <TileGrid cols={2}>
          {FONT_PAIRINGS.map((font) => {
            const def = FONT_PAIRINGS_DEF[font];
            return (
              <Tile key={font} active={a.font === font} onClick={() => set("font", font)} label={def.label} description={def.description}>
                <span className="block px-3 text-left" style={{ fontFamily: def.display, fontWeight: def.displayWeight, letterSpacing: def.displayTracking, color: deepen(a.primary, 13) }}>
                  <span className="block text-[30px] leading-none">{draft.profile.name.split(" ")[0] || "Aa"}</span>
                  <span className="mt-1.5 block text-[12px] tracking-normal text-muted" style={{ fontFamily: def.body, fontWeight: 400 }}>
                    Fresh every morning
                  </span>
                </span>
              </Tile>
            );
          })}
        </TileGrid>
      </Panel>
    </div>
  );
}

function TileGrid({ children, cols = 4 }: { children: ReactNode; cols?: 2 | 3 | 4 }) {
  return <div className={cn("grid gap-2.5", { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-2 sm:grid-cols-4" }[cols])}>{children}</div>;
}

function Tile({
  active,
  onClick,
  label,
  description,
  children,
  compact,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  description?: string;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg bg-surface text-left ring-1 transition duration-150 hover:-translate-y-px hover:shadow-md",
        active ? "ring-2 ring-signal" : "ring-line/80 hover:ring-[#d3d6de]",
      )}
    >
      <span className={cn("flex items-center bg-paper", compact ? "h-14" : "h-24")}>
        <span className="w-full">{children}</span>
      </span>
      <span className="flex items-start justify-between gap-2 px-3 py-2.5">
        <span className="min-w-0">
          <span className="block text-[13px] font-medium text-ink">{label}</span>
          {description && <span className="mt-0.5 block text-[12px] leading-snug text-muted">{description}</span>}
        </span>
        <span className={cn("mt-0.5 grid size-4 shrink-0 place-items-center rounded-full transition", active ? "bg-signal text-white" : "ring-1 ring-[#cdd1da]")}>
          {active && <Check size={10} strokeWidth={3.5} />}
        </span>
      </span>
    </button>
  );
}

/** A thumbnail of the page using the real theme tokens. */
function MiniPage({ appearance }: { appearance: Appearance }) {
  const theme = businessTheme(appearance) as Record<string, string>;
  const bgImage =
    appearance.background === "depth" ? `linear-gradient(180deg, ${theme["--bp-bg"]} 0%, ${theme["--bp-bg"]} 55%, ${theme["--bp-deep"]} 56%)` : undefined;
  return (
    <span className="mx-auto block h-[84px] w-[64px] overflow-hidden rounded-[8px] shadow-sm ring-1 ring-black/5" style={{ background: bgImage ?? theme["--bp-bg"] }}>
      <span className="block h-7" style={{ background: theme["--bp-deep"] }} />
      <span className="mx-1.5 mt-1.5 block h-2 rounded-full" style={{ background: theme["--bp-accent"] }} />
      <span className="mx-1.5 mt-1 block h-1.5 w-8 rounded-full opacity-40" style={{ background: theme["--bp-text"] }} />
      <span className="mx-1.5 mt-1 block h-1.5 w-6 rounded-full opacity-40" style={{ background: theme["--bp-text"] }} />
    </span>
  );
}

function MiniCards({ appearance }: { appearance: Appearance }) {
  const theme = businessTheme(appearance) as Record<string, string>;
  const card: React.CSSProperties =
    appearance.cardStyle === "raised"
      ? { background: "#fff", boxShadow: "0 4px 10px -4px rgba(10,20,40,0.3)" }
      : appearance.cardStyle === "outlined"
        ? { boxShadow: `inset 0 0 0 1px ${theme["--bp-line"]}` }
        : appearance.cardStyle === "glass"
          ? { background: "rgba(255,255,255,0.55)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.9)", backdropFilter: "blur(6px)" }
          : { background: theme["--bp-bg-2"] };
  return (
    <span className="relative mx-auto flex h-[84px] w-[84%] items-center justify-center gap-1.5 overflow-hidden rounded-[8px] px-2" style={{ background: `radial-gradient(80% 70% at 30% 20%, ${theme["--bp-accent"]}66, ${theme["--bp-bg"]})` }}>
      {[0, 1].map((i) => (
        <span key={i} className="flex h-[64px] flex-1 flex-col rounded-[6px] p-1.5" style={card}>
          <span className="block flex-1 rounded-[3px]" style={{ background: `${theme["--bp-accent"]}44` }} />
          <span className="mt-1 block h-1.5 w-3/4 rounded-full opacity-50" style={{ background: theme["--bp-text"] }} />
        </span>
      ))}
    </span>
  );
}
