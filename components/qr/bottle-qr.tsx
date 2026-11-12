import { QRCodeSVG } from "qrcode.react";
import { forwardRef } from "react";
import { mix } from "@/lib/color";

/** Artboard of the bottle design, in SVG user units. */
export const BOTTLE_WIDTH = 600;
export const BOTTLE_HEIGHT = 1230;

/** QR placement on the label (pure white panel with a quiet zone so it always scans). */
const QR_PANEL = { x: 145, y: 672, size: 310, pad: 20 };
const QR_SIZE = QR_PANEL.size - QR_PANEL.pad * 2;

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "'Segoe UI', Helvetica, Arial, sans-serif";

/** A droplet mark for the middle of the code, used when no logo has been uploaded. */
export function dropletMarkDataUrl(navy: string, sky: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#fff"/><circle cx="50" cy="50" r="42" fill="${navy}"/><path d="M50 18 C 61 33 70 45 70 58 A 20 20 0 0 1 30 58 C 30 45 39 33 50 18 Z" fill="#fff"/><path d="M31 60 C 38 54 44 64 51 59 C 57 55 63 57 69 60 A 19 19 0 0 1 31 60 Z" fill="${sky}"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

type Props = {
  url: string;
  name: string;
  label: string;
  /** Label badge and text. */
  navy: string;
  /** Code modules (defaults to navy). */
  codeColor?: string;
  /** Splashes, water and highlights. */
  sky: string;
  /** Data URL for the middle of the code, or null for none. */
  centerImage: string | null;
  centerRatio: number;
  idPrefix: string;
};

/**
 * The QR code on a Marilicht bottle: white ridged cap, clear PET body with
 * crown-wave shoulders, and a label carrying the brand badge and a large,
 * high-contrast code. Plain SVG, so the same markup is the preview, the SVG
 * download and the source of the PNG.
 */
export const BottleQr = forwardRef<SVGSVGElement, Props>(function BottleQr(
  { url, name, label, navy, codeColor, sky, centerImage, centerRatio, idPrefix },
  ref,
) {
  const id = (s: string) => `${idPrefix}-${s}`;
  const royal = mix(navy, sky, 0.22);
  const gold = "#D7B24E";
  const goldLight = "#F3DE97";
  const clear = mix(sky, "#ffffff", 0.62);

  // Bottle silhouette, centred on x = 300: long neck, rounded shoulders, straight body.
  const body =
    "M 232 248 L 368 248 L 368 262 C 368 334 500 352 500 470 L 500 1140 Q 500 1190 450 1190 L 150 1190 Q 100 1190 100 1140 L 100 470 C 100 352 232 334 232 262 Z";

  // Crown-wave emboss around the shoulder, like the real bottle.
  const scallops = (y: number, amp: number, step = 42) => {
    let d = `M 80 ${y}`;
    for (let x = 80; x < 520; x += step) d += ` Q ${x + step / 2} ${y - amp} ${x + step} ${y}`;
    return d;
  };

  const qrX = QR_PANEL.x + QR_PANEL.pad;
  const qrY = QR_PANEL.y + QR_PANEL.pad;
  const center = centerImage
    ? { src: centerImage, width: QR_SIZE * centerRatio, height: QR_SIZE * centerRatio, excavate: true }
    : undefined;

  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox={`0 0 ${BOTTLE_WIDTH} ${BOTTLE_HEIGHT}`}
      role="img"
      aria-label={`QR code for ${label}, shaped like a ${name} bottle`}
    >
      <defs>
        {/* Clear PET: almost white in the middle, a hint of blue at the curved edges */}
        <linearGradient id={id("plastic")} x1="0" x2="1">
          <stop offset="0" stopColor={clear} stopOpacity="0.85" />
          <stop offset="0.14" stopColor="#F2FAFE" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.3" />
          <stop offset="0.86" stopColor="#F2FAFE" stopOpacity="0.55" />
          <stop offset="1" stopColor={clear} stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id={id("water")} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={mix(sky, "#ffffff", 0.7)} stopOpacity="0.22" />
          <stop offset="1" stopColor={sky} stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id={id("shine")} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.3" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id("cap")} x1="0" x2="1">
          <stop offset="0" stopColor="#D5DBE3" />
          <stop offset="0.42" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#C6CED8" />
        </linearGradient>
        <linearGradient id={id("label")} x1="0" x2="1">
          <stop offset="0" stopColor={mix(sky, "#ffffff", 0.6)} />
          <stop offset="0.14" stopColor="#FFFFFF" />
          <stop offset="0.86" stopColor="#FFFFFF" />
          <stop offset="1" stopColor={mix(sky, "#ffffff", 0.6)} />
        </linearGradient>
        <linearGradient id={id("badge")} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={royal} />
          <stop offset="1" stopColor={navy} />
        </linearGradient>
        <linearGradient id={id("gold")} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor={goldLight} />
          <stop offset="0.5" stopColor={gold} />
          <stop offset="1" stopColor={goldLight} />
        </linearGradient>
        <radialGradient id={id("shadow")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={navy} stopOpacity="0.3" />
          <stop offset="1" stopColor={navy} stopOpacity="0" />
        </radialGradient>
        <clipPath id={id("bottle")}>
          <path d={body} />
        </clipPath>
        <clipPath id={id("badgeClip")}>
          <ellipse cx="300" cy="580" rx="150" ry="60" />
        </clipPath>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="300" cy="1202" rx="215" ry="18" fill={`url(#${id("shadow")})`} />

      {/* Bottle body with water */}
      <path d={body} fill={`url(#${id("plastic")})`} />
      <g clipPath={`url(#${id("bottle")})`}>
        <path d="M 0 300 C 120 288 200 312 300 300 S 480 288 600 300 L 600 1230 L 0 1230 Z" fill={`url(#${id("water")})`} />
        <path d="M 0 300 C 120 288 200 312 300 300 S 480 288 600 300" fill="none" stroke="#fff" strokeOpacity="0.9" strokeWidth="2.5" />
        {/* Crown-wave shoulders */}
        <path d={scallops(408, 30)} fill="none" stroke="#fff" strokeOpacity="0.9" strokeWidth="5" />
        <path d={scallops(415, 30)} fill="none" stroke={navy} strokeOpacity="0.09" strokeWidth="3" />
        <path d={scallops(446, 20)} fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="3" />
        {/* Grip ribs below the label */}
        {[1090, 1116, 1142].map((y) => (
          <g key={y}>
            <path d={`M 90 ${y} Q 300 ${y + 10} 510 ${y}`} fill="none" stroke="#fff" strokeOpacity="0.8" strokeWidth="4" />
            <path d={`M 90 ${y + 5} Q 300 ${y + 15} 510 ${y + 5}`} fill="none" stroke={navy} strokeOpacity="0.07" strokeWidth="2" />
          </g>
        ))}

        {/* Label */}
        <rect x="90" y="500" width="420" height="560" fill={`url(#${id("label")})`} />
        <rect x="90" y="500" width="420" height="5" fill={sky} />
        <rect x="90" y="1055" width="420" height="5" fill={sky} />
        {/* Splashes at the label edges */}
        <g fill={sky}>
          <path d="M 100 720 C 136 700 146 660 130 620 C 166 656 168 710 138 750 C 126 766 112 772 100 776 Z" opacity="0.5" />
          <path d="M 100 870 C 144 850 158 810 148 772 C 178 812 176 870 138 904 Z" opacity="0.3" />
          <path d="M 500 720 C 464 700 454 660 470 620 C 434 656 432 710 462 750 C 474 766 488 772 500 776 Z" opacity="0.5" />
          <path d="M 500 870 C 456 850 442 810 452 772 C 422 812 424 870 462 904 Z" opacity="0.3" />
          <circle cx="122" cy="800" r="6" opacity="0.55" />
          <circle cx="132" cy="940" r="4" opacity="0.45" />
          <circle cx="478" cy="800" r="6" opacity="0.55" />
          <circle cx="468" cy="940" r="4" opacity="0.45" />
        </g>
        {/* Reflections on the clear plastic */}
        <rect x="128" y="290" width="20" height="200" fill={`url(#${id("shine")})`} opacity="0.9" />
        <rect x="128" y="1066" width="20" height="110" fill={`url(#${id("shine")})`} opacity="0.75" />
        <rect x="446" y="360" width="9" height="130" fill={`url(#${id("shine")})`} opacity="0.6" />
      </g>
      <path d={body} fill="none" stroke={navy} strokeOpacity="0.16" strokeWidth="2" />

      {/* Neck ring and ridged cap */}
      <rect x="212" y="170" width="176" height="20" rx="8" fill="#EEF5F9" stroke={navy} strokeOpacity="0.14" />
      <rect x="232" y="190" width="136" height="60" fill={`url(#${id("plastic")})`} />
      <rect x="222" y="40" width="156" height="134" rx="16" fill={`url(#${id("cap")})`} stroke={navy} strokeOpacity="0.12" />
      {Array.from({ length: 17 }, (_, i) => (
        <line key={i} x1={232 + i * 8.5} y1="52" x2={232 + i * 8.5} y2="164" stroke={navy} strokeOpacity="0.07" strokeWidth="2.5" />
      ))}
      <rect x="222" y="40" width="156" height="20" rx="10" fill="#fff" fillOpacity="0.85" />
      <text x="300" y="118" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontWeight="700" fontSize="22" fill={navy} fillOpacity="0.3">
        {name}
      </text>

      {/* Brand badge: navy oval, gold rim, crown wave, droplet, script name */}
      <ellipse cx="300" cy="580" rx="160" ry="70" fill={`url(#${id("gold")})`} />
      <ellipse cx="300" cy="580" rx="150" ry="60" fill={`url(#${id("badge")})`} />
      <g clipPath={`url(#${id("badgeClip")})`}>
        <path
          d="M 150 554 L 186 538 L 214 554 L 244 530 L 272 550 L 300 520 L 328 550 L 356 530 L 386 554 L 414 538 L 450 554 L 450 508 L 150 508 Z"
          fill={mix(sky, "#ffffff", 0.35)}
          opacity="0.9"
        />
        <path d="M 150 560 Q 300 538 450 560" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="2" />
      </g>
      <path d="M 300 520 C 309 533 316 542 316 552 A 16 16 0 0 1 284 552 C 284 542 291 533 300 520 Z" fill="#fff" />
      <path d="M 285 554 C 291 549 296 557 302 553 C 306 550 311 552 315 554 A 15 15 0 0 1 285 554 Z" fill={sky} />
      <text
        x="300"
        y="600"
        textAnchor="middle"
        fontFamily={SERIF}
        fontStyle="italic"
        fontWeight="700"
        fontSize={name.length > 10 ? 40 : 48}
        fill="#fff"
        stroke={mix(sky, "#ffffff", 0.3)}
        strokeWidth="1.5"
        paintOrder="stroke"
      >
        {name}
      </text>
      <text x="300" y="624" textAnchor="middle" fontFamily={SANS} fontSize="12" letterSpacing="2.5" fill={mix(sky, "#ffffff", 0.5)}>
        PREMIUM TABLE WATER
      </text>

      {/* The code: white panel, quiet zone, high contrast */}
      <rect x={QR_PANEL.x} y={QR_PANEL.y} width={QR_PANEL.size} height={QR_PANEL.size} rx="22" fill="#FFFFFF" stroke={navy} strokeOpacity="0.12" strokeWidth="2" />
      <QRCodeSVG
        value={url}
        size={QR_SIZE}
        x={qrX}
        y={qrY}
        fgColor={codeColor ?? navy}
        bgColor="#FFFFFF"
        level={centerImage ? "H" : "M"}
        marginSize={0}
        imageSettings={center}
      />

      {/* Call to action */}
      <text x="300" y="1016" textAnchor="middle" fontFamily={SANS} fontSize="21" fontWeight="700" fill={navy}>
        Scan to order
      </text>
      <text x="300" y="1040" textAnchor="middle" fontFamily={SANS} fontSize="16" fill={navy} fillOpacity="0.7">
        {label}
      </text>
    </svg>
  );
});
