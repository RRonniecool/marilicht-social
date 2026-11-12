"use client";

/* eslint-disable @next/next/no-img-element */
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  CloudOff,
  ExternalLink,
  Eye,
  Loader2,
  RotateCcw,
  UploadCloud,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/config";
import { imageSrc } from "@/lib/images";
import { cn, formatRelative, initials } from "@/lib/utils";
import { useEditor } from "./editor-context";
import { NAV, navItemFor, type NavItem } from "./nav";
import { LivePreview } from "./preview";

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const current = navItemFor(pathname);
  const [previewOpen, setPreviewOpen] = useState(false);
  const showDocked = !["/dashboard", "/dashboard/qr"].includes(current.href);

  useEffect(() => {
    document.getElementById("dashboard-main")?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="flex h-svh overflow-hidden bg-paper">
      <Sidebar current={current} />

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader current={current} />
        <TopBar current={current} docked={showDocked} onPreview={() => setPreviewOpen(true)} />

        <div className="flex min-h-0 flex-1">
          <main id="dashboard-main" className="scroll-thin min-w-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[760px] px-4 pb-32 pt-5 sm:px-6 lg:pb-16 lg:pt-8">
              <div className="mb-6 hidden lg:block">
                <h1 className="text-[26px] font-semibold tracking-[-0.025em] text-ink">{current.title}</h1>
                <p className="mt-1 text-[14.5px] text-muted">{current.description}</p>
              </div>
              {/* CSS (not JS) entrance, so server-rendered content is never hidden before hydration */}
              <div key={pathname} className="animate-fade-in">
                {children}
              </div>
            </div>
          </main>

          {/* Docked preview on wide screens */}
          {showDocked && (
            <aside className="hidden w-[min(440px,32vw)] shrink-0 border-l border-line/70 bg-paper p-5 pt-5 xl:flex">
              <LivePreview className="h-full w-full" />
            </aside>
          )}
        </div>
      </div>

      <MobileActionBar onPreview={() => setPreviewOpen(true)} />
      <PreviewSheet open={previewOpen} onClose={() => setPreviewOpen(false)} />
    </div>
  );
}

/* ================================================================== */
/* Sidebar                                                             */
/* ================================================================== */

function Sidebar({ current }: { current: NavItem }) {
  const { draft } = useEditor();
  const groups: { id: NavItem["group"]; label?: string }[] = [
    { id: "home" },
    { id: "page", label: "Your page" },
    { id: "brand", label: "Brand & sharing" },
  ];
  return (
    <aside className="hidden w-[264px] shrink-0 flex-col border-r border-line/70 bg-[#fafbfc] lg:flex">
      <div className="flex h-16 items-center justify-between px-5">
        <span className="text-[15px] font-semibold tracking-[-0.01em] text-ink">Dashboard</span>
        <span className="rounded-full bg-ink/[0.05] px-2 py-0.5 text-[11.5px] font-medium text-muted">Admin</span>
      </div>

      <div className="px-3">
        <SiteCard />
      </div>

      <nav className="scroll-thin mt-4 flex-1 overflow-y-auto px-3 pb-4" aria-label="Dashboard">
        {groups.map((group) => (
          <div key={group.id} className="mb-4">
            {group.label && <p className="mb-1 px-3 text-[12px] font-medium text-faint">{group.label}</p>}
            <ul className="space-y-px">
              {NAV.filter((item) => item.group === group.id).map((item) => {
                const active = item.href === current.href;
                const count = item.count?.(draft);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex h-9 items-center gap-3 rounded-md px-3 text-[14px] transition-colors",
                        active ? "bg-surface font-medium text-ink shadow-sm ring-1 ring-line/80" : "text-ink-2 hover:bg-ink/[0.04] hover:text-ink",
                      )}
                    >
                      {active && <motion.span layoutId="nav-indicator" className="absolute -left-3 h-5 w-[3px] rounded-r-full bg-signal" />}
                      <item.icon size={17} strokeWidth={active ? 2 : 1.75} className={active ? "text-ink" : "text-muted group-hover:text-ink-2"} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {count ? <span className="tabular text-[12px] text-faint">{count}</span> : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <UserCard />
    </aside>
  );
}

function SiteLogo({ logo, name, className }: { logo?: { url: string } | null; name: string; className?: string }) {
  return (
    <span className={cn("grid shrink-0 place-items-center overflow-hidden rounded-[10px] bg-ink text-[12px] font-semibold text-white ring-1 ring-black/5", className)}>
      {logo?.url ? <img src={imageSrc(logo as never, 40)} alt="" className="size-full object-cover" /> : initials(name)}
    </span>
  );
}

/** The one site this dashboard manages, with a shortcut to the live page. */
function SiteCard() {
  const { draft, pageLabel } = useEditor();
  return (
    <a
      href="/"
      target="_blank"
      rel="noopener noreferrer"
      className="group flex w-full items-center gap-3 rounded-lg bg-surface p-2.5 text-left shadow-sm ring-1 ring-line/80 transition hover:ring-[#d3d6de]"
    >
      <SiteLogo logo={draft.profile.logo} name={draft.profile.name || SITE_NAME} className="size-9" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-semibold text-ink">{draft.profile.name || SITE_NAME}</span>
        <span className="block truncate text-[12px] text-muted">{pageLabel}</span>
      </span>
      <ExternalLink size={15} className="text-faint transition group-hover:text-ink" />
    </a>
  );
}

function UserCard() {
  const { viewer } = useEditor();
  return (
    <div className="flex items-center gap-3 border-t border-line/70 p-4">
      <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-signal-soft text-[12px] font-semibold text-signal-ink">
        {viewer.imageUrl ? <img src={viewer.imageUrl} alt="" className="size-full object-cover" /> : initials(viewer.name || viewer.email)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium text-ink">{viewer.name}</span>
        <span className="block truncate text-[12px] text-muted">{viewer.email}</span>
      </span>
      <SignOut />
    </div>
  );
}

function SignOut() {
  const { viewer } = useEditor();
  return <SignOutButton source={viewer.source} compact />;
}

/* ================================================================== */
/* Top bar: save status + publish                                      */
/* ================================================================== */

function TopBar({ current, docked, onPreview }: { current: NavItem; docked: boolean; onPreview: () => void }) {
  const isOverview = current.href === "/dashboard";
  return (
    <header className="hidden h-16 shrink-0 items-center justify-between gap-4 border-b border-line/70 bg-paper/80 px-6 backdrop-blur lg:flex">
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-[13.5px] text-muted">
        <Link href="/dashboard" className="hover:text-ink">
          Dashboard
        </Link>
        {!isOverview && (
          <>
            <span className="text-faint">/</span>
            <span className="truncate font-medium text-ink">{current.label}</span>
          </>
        )}
      </nav>
      <div className="flex items-center gap-3">
        <SaveIndicator />
        <Button variant="secondary" size="md" icon={<Eye size={16} />} onClick={onPreview} className={cn(docked && "xl:hidden")}>
          Preview
        </Button>
        <PublishControls />
      </div>
    </header>
  );
}

export function SaveIndicator({ compact }: { compact?: boolean }) {
  const { status, lastSavedAt, errors } = useEditor();
  const [, force] = useState(0);
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);
  const errorCount = Object.keys(errors).length;
  const content = {
    saved: { icon: <Check size={14} strokeWidth={2.5} className="text-success" />, text: lastSavedAt ? `Draft saved ${formatRelative(lastSavedAt)}` : "All changes saved" },
    dirty: { icon: <span className="size-1.5 rounded-full bg-warn" />, text: "Unsaved changes" },
    saving: { icon: <Loader2 size={14} className="animate-spin" />, text: "Saving…" },
    error: { icon: <CloudOff size={14} className="text-danger" />, text: "Not saved" },
    invalid: { icon: <AlertCircle size={14} className="text-danger" />, text: `Fix ${errorCount} field${errorCount === 1 ? "" : "s"} to save` },
  }[status];
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={status}
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -3 }}
        transition={{ duration: 0.15 }}
        className={cn("inline-flex items-center gap-1.5 whitespace-nowrap text-[13px]", status === "invalid" || status === "error" ? "text-danger" : "text-muted")}
        role="status"
      >
        {content.icon}
        {compact && status === "saved" ? "Saved" : content.text}
      </motion.span>
    </AnimatePresence>
  );
}

export function PublishControls({ block }: { block?: boolean }) {
  const { hasUnpublishedChanges, publishing, publish, discard, published } = useEditor();
  const [justPublished, setJustPublished] = useState(false);

  async function onPublish() {
    const ok = await publish();
    if (ok) {
      setJustPublished(true);
      setTimeout(() => setJustPublished(false), 2200);
    }
  }

  return (
    <div className={cn("flex items-center gap-2", block && "flex-1")}>
      {hasUnpublishedChanges && published && !publishing && (
        <Button
          variant="ghost"
          size={block ? "icon" : "icon"}
          onClick={() => {
            if (confirm("Discard all unpublished changes? Your page will go back to the live version.")) discard();
          }}
          title="Discard unpublished changes"
          aria-label="Discard unpublished changes"
        >
          <RotateCcw size={16} />
        </Button>
      )}
      <button
        type="button"
        onClick={onPublish}
        disabled={publishing || (!hasUnpublishedChanges && !justPublished)}
        className={cn(
          "relative inline-flex h-10 items-center justify-center gap-2 overflow-hidden rounded-md px-4 text-[14px] font-medium transition-all duration-200",
          block && "flex-1",
          justPublished
            ? "bg-success text-white"
            : hasUnpublishedChanges
              ? "bg-ink text-white shadow-[0_1px_0_rgb(255_255_255/0.12)_inset,0_4px_12px_-4px_rgb(22_26_43/0.45)] hover:bg-[#232842] active:scale-[0.98]"
              : "bg-ink/[0.06] text-muted",
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={publishing ? "publishing" : justPublished ? "done" : hasUnpublishedChanges ? "publish" : "live"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16 }}
            className="inline-flex items-center gap-2"
          >
            {publishing ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Publishing
              </>
            ) : justPublished ? (
              <>
                <Check size={16} strokeWidth={2.5} /> Published
              </>
            ) : hasUnpublishedChanges ? (
              <>
                <UploadCloud size={16} /> Publish
                <span className="size-1.5 rounded-full bg-[#7fa2ff]" aria-hidden="true" />
              </>
            ) : (
              <>
                <Check size={15} /> Up to date
              </>
            )}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
}

/* ================================================================== */
/* Mobile                                                              */
/* ================================================================== */

function MobileHeader({ current }: { current: NavItem }) {
  const { draft } = useEditor();
  const tabs = useRef<HTMLDivElement>(null);
  useEffect(() => {
    tabs.current?.querySelector<HTMLElement>('[aria-current="page"]')?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [current.href]);

  return (
    <header className="shrink-0 border-b border-line/70 bg-surface/90 backdrop-blur lg:hidden">
      <div className="flex h-14 items-center gap-3 px-4">
        <SiteLogo logo={draft.profile.logo} name={draft.profile.name || SITE_NAME} className="size-8" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14.5px] font-semibold leading-tight text-ink">{current.title}</p>
          <SaveIndicator compact />
        </div>
        <SignOut />
      </div>
      <div ref={tabs} className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-2.5">
        {NAV.map((item) => {
          const active = item.href === current.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition-colors",
                active ? "bg-ink text-white" : "bg-ink/[0.05] text-ink-2",
              )}
            >
              <item.icon size={14} strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}

function MobileActionBar({ onPreview }: { onPreview: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-surface/92 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl lg:hidden">
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="md" icon={<Eye size={16} />} onClick={onPreview}>
          Preview
        </Button>
        <PublishControls block />
      </div>
    </div>
  );
}

function PreviewSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex flex-col bg-[#eceef2]/96 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Page preview"
        >
          <motion.div
            className="mx-auto flex h-full w-full max-w-[1100px] flex-col p-3 pt-3 sm:p-6"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
          >
            <div className="mb-2 flex justify-end">
              <Button variant="secondary" size="sm" icon={<X size={15} />} onClick={onClose}>
                Close
              </Button>
            </div>
            <LivePreview className="min-h-0 flex-1" compact />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
