"use client";

import { Download, FileImage, FileCode2, Lock } from "lucide-react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Segmented, Switch } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { deepen, readableOn } from "@/lib/color";
import { imageSrc } from "@/lib/images";
import type { ImageRef } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  url: string;
  label: string;
  name: string;
  logo?: ImageRef | null;
  primary: string;
  accent: string;
  fileName: string;
  compact?: boolean;
};

const EXPORT_SIZE = 1024;

/** Loads the logo as a data URL so it can be embedded in downloads (PNG canvas + standalone SVG). */
function useDataUrl(src: string | null) {
  const [loaded, setLoaded] = useState<{ src: string; data: string | null } | null>(null);
  useEffect(() => {
    let cancelled = false;
    if (!src) return;
    fetch(src)
      .then((r) => r.blob())
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          }),
      )
      .then((value) => !cancelled && setLoaded({ src, data: value }))
      .catch(() => !cancelled && setLoaded({ src, data: null }));
    return () => {
      cancelled = true;
    };
  }, [src]);
  return src && loaded?.src === src ? loaded.data : null;
}

export function QrStudio({ url, label, name, logo, primary, accent, fileName, compact }: Props) {
  const deep = deepen(primary, 13);
  const colors = Array.from(new Set([deep, "#111111", deepen(accent, 4.5)]));
  const [fg, setFg] = useState(deep);
  const [bg, setBg] = useState<"white" | "tint">("white");
  const [withLogo, setWithLogo] = useState(Boolean(logo?.url));
  const [logoSize, setLogoSize] = useState<"s" | "m">("s");
  const [framed, setFramed] = useState(true);
  const canvasHost = useRef<HTMLDivElement>(null);
  const svgHost = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const id = useId();

  const logoData = useDataUrl(withLogo && logo?.url ? imageSrc(logo, 256) : null);
  const background = bg === "white" ? "#FFFFFF" : "#F1F7FA";
  const logoRatio = logoSize === "s" ? 0.2 : 0.26;

  const imageSettings = (size: number) =>
    logoData ? { src: logoData, height: size * logoRatio, width: size * logoRatio, excavate: true } : undefined;

  function triggerDownload(href: string, extension: string) {
    const a = document.createElement("a");
    a.href = href;
    a.download = `${fileName}-qr.${extension}`;
    a.click();
  }

  async function downloadPng() {
    const qr = canvasHost.current?.querySelector("canvas");
    if (!qr) return;
    // Give the canvas a frame to finish drawing the logo.
    await new Promise((r) => setTimeout(r, 60));
    if (!framed) {
      triggerDownload(qr.toDataURL("image/png"), "png");
    } else {
      const pad = 96;
      const footer = 230;
      const out = document.createElement("canvas");
      out.width = EXPORT_SIZE + pad * 2;
      out.height = EXPORT_SIZE + pad * 2 + footer;
      const ctx = out.getContext("2d")!;
      ctx.fillStyle = background;
      ctx.beginPath();
      ctx.roundRect(0, 0, out.width, out.height, 64);
      ctx.fill();
      ctx.drawImage(qr, pad, pad);
      ctx.textAlign = "center";
      ctx.fillStyle = fg;
      ctx.font = "600 64px system-ui, -apple-system, Segoe UI, sans-serif";
      ctx.fillText(name, out.width / 2, EXPORT_SIZE + pad + 120);
      ctx.globalAlpha = 0.7;
      ctx.font = "400 42px system-ui, -apple-system, Segoe UI, sans-serif";
      ctx.fillText(label, out.width / 2, EXPORT_SIZE + pad + 190);
      triggerDownload(out.toDataURL("image/png"), "png");
    }
    toast({ tone: "success", title: "PNG downloaded", description: "Ready for print and social posts." });
  }

  function downloadSvg() {
    const svg = svgHost.current?.querySelector("svg");
    if (!svg) return;
    const inner = svg.innerHTML;
    const view = svg.getAttribute("viewBox") ?? "0 0 33 33";
    const [, , w] = view.split(" ").map(Number);
    let markup: string;
    if (!framed) {
      markup = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${view}" width="1024" height="1024" shape-rendering="crispEdges">${inner}</svg>`;
    } else {
      const pad = w * 0.09;
      const total = w + pad * 2;
      const footer = w * 0.22;
      const esc = (s: string) => s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]!);
      markup = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${total} ${total + footer}" width="1240" height="${Math.round((1240 * (total + footer)) / total)}">
<rect width="${total}" height="${total + footer}" rx="${w * 0.06}" fill="${background}"/>
<g transform="translate(${pad} ${pad})" shape-rendering="crispEdges">${inner}</g>
<text x="${total / 2}" y="${w + pad + footer * 0.5}" text-anchor="middle" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-weight="600" font-size="${w * 0.062}" fill="${fg}">${esc(name)}</text>
<text x="${total / 2}" y="${w + pad + footer * 0.82}" text-anchor="middle" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="${w * 0.04}" fill="${fg}" fill-opacity="0.7">${esc(label)}</text>
</svg>`;
    }
    const blob = new Blob([markup], { type: "image/svg+xml" });
    const href = URL.createObjectURL(blob);
    triggerDownload(href, "svg");
    setTimeout(() => URL.revokeObjectURL(href), 1000);
    toast({ tone: "success", title: "SVG downloaded", description: "Vector file, sharp at any size." });
  }

  return (
    <div className={cn("grid gap-6", !compact && "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]")}>
      {/* Preview */}
      <div className="flex flex-col items-center justify-center rounded-xl bg-[radial-gradient(100%_100%_at_50%_0%,#ffffff,#eef0f4)] p-6 ring-1 ring-line/70 sm:p-10">
        <div
          className="w-full max-w-[300px] rounded-[22px] p-6 shadow-[0_24px_60px_-28px_rgba(22,26,43,0.45)] ring-1 ring-black/5 transition-colors duration-300"
          style={{ background }}
        >
          <div ref={svgHost} className="aspect-square w-full [&_svg]:size-full">
            <QRCodeSVG
              value={url}
              size={256}
              fgColor={fg}
              bgColor={background}
              level={logoData ? "H" : "M"}
              marginSize={0}
              imageSettings={imageSettings(256)}
              title={`QR code for ${label}`}
            />
          </div>
          {framed && (
            <div className="mt-5 text-center" style={{ color: fg }}>
              <p className="truncate text-[17px] font-semibold">{name}</p>
              <p className="truncate text-[13px] opacity-70">{label}</p>
            </div>
          )}
        </div>
        <p className="mt-5 inline-flex items-center gap-1.5 text-center text-[12.5px] text-muted">
          <Lock size={13} /> Always opens {label}
        </p>
      </div>

      {/* Hidden high-resolution canvas for PNG export */}
      <div ref={canvasHost} className="hidden" aria-hidden="true">
        <QRCodeCanvas
          value={url}
          size={EXPORT_SIZE}
          fgColor={fg}
          bgColor={background}
          level={logoData ? "H" : "M"}
          marginSize={0}
          imageSettings={imageSettings(EXPORT_SIZE)}
        />
      </div>

      {/* Controls */}
      <div className="space-y-5">
        <div>
          <p id={`${id}-color`} className="mb-2 text-[13.5px] font-medium text-ink">
            Code color
          </p>
          <div className="flex gap-2" role="radiogroup" aria-labelledby={`${id}-color`}>
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={fg === c}
                aria-label={c}
                onClick={() => setFg(c)}
                className={cn("size-9 rounded-full ring-1 ring-black/10 transition hover:scale-105", fg === c && "ring-2 ring-signal ring-offset-2")}
                style={{ background: c, color: readableOn(c) }}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[13.5px] font-medium text-ink">Background</p>
          <Segmented value={bg} onChange={setBg} options={[{ value: "white", label: "White" }, { value: "tint", label: "Soft tint" }]} />
        </div>

        <div className="space-y-3 rounded-lg bg-paper p-4 ring-1 ring-line/70">
          <label className="flex items-center justify-between gap-4">
            <span>
              <span className="block text-[13.5px] font-medium text-ink">Logo in the center</span>
              <span className="block text-[12.5px] text-muted">{logo?.url ? "Uses extra error correction so it still scans." : "Upload a logo in Business profile first."}</span>
            </span>
            <Switch label="Show logo" checked={withLogo && Boolean(logo?.url)} onChange={setWithLogo} />
          </label>
          {withLogo && logo?.url && (
            <Segmented size="sm" value={logoSize} onChange={setLogoSize} options={[{ value: "s", label: "Small logo" }, { value: "m", label: "Larger logo" }]} />
          )}
          <label className="flex items-center justify-between gap-4 border-t border-line pt-3">
            <span>
              <span className="block text-[13.5px] font-medium text-ink">Name and address underneath</span>
              <span className="block text-[12.5px] text-muted">Helps people know where the code goes.</span>
            </span>
            <Switch label="Show name and address" checked={framed} onChange={setFramed} />
          </label>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button variant="primary" size="lg" icon={<FileImage size={17} />} onClick={downloadPng}>
            Download PNG
          </Button>
          <Button variant="secondary" size="lg" icon={<FileCode2 size={17} />} onClick={downloadSvg}>
            Download SVG
          </Button>
        </div>
        <p className="flex items-start gap-2 text-[12.5px] leading-relaxed text-muted">
          <Download size={14} className="mt-0.5 shrink-0" />
          PNG for social media and messaging. SVG for printers and signage; it stays sharp at any size.
        </p>
      </div>
    </div>
  );
}
