"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { discardDraftAction, publishAction, saveDraftAction } from "@/app/dashboard/actions";
import { useToast } from "@/components/ui/toast";
import { pageContentSchema, type EditorState, type PageContent } from "@/lib/types";

export type SaveStatus = "saved" | "dirty" | "saving" | "error" | "invalid";

export type ViewerSummary = { name: string; email: string; isAdmin: boolean; imageUrl?: string; source: "clerk" | "dev" };

type EditorContextValue = {
  viewer: ViewerSummary;
  publishedAt: string | null;
  draft: PageContent;
  published: PageContent | null;
  update: (recipe: (draft: PageContent) => void) => void;
  status: SaveStatus;
  lastSavedAt: string | null;
  errors: Record<string, string>;
  errorFor: (path: string) => string | null;
  hasUnpublishedChanges: boolean;
  publishing: boolean;
  publish: () => Promise<boolean>;
  discard: () => Promise<void>;
  /** Permanent public address (QR codes, sharing). */
  pageUrl: string;
  pageLabel: string;
};

const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used inside <EditorProvider>");
  return ctx;
}

const AUTOSAVE_DELAY = 900;

function validate(content: PageContent) {
  const parsed = pageContentSchema.safeParse(content);
  if (parsed.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path.join(".");
    errors[key] ??= issue.message;
  }
  return errors;
}

export function EditorProvider({
  initial,
  viewer,
  pageUrl,
  pageLabel,
  children,
}: {
  initial: EditorState;
  viewer: ViewerSummary;
  pageUrl: string;
  pageLabel: string;
  children: ReactNode;
}) {
  const toast = useToast();
  const [publishedAt, setPublishedAt] = useState<string | null>(initial.publishedAt ?? null);
  const [draft, setDraft] = useState(initial.draft);
  const [published, setPublished] = useState(initial.published);
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(initial.draftUpdatedAt ?? initial.publishedAt ?? null);
  // Errors stay hidden until a save or publish is attempted, then update live.
  const [showErrors, setShowErrors] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const version = useRef(0);
  const savedVersion = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const latest = useRef(initial.draft);
  const saveRef = useRef<() => Promise<boolean>>(async () => true);
  const scheduleSave = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => saveRef.current(), AUTOSAVE_DELAY);
  }, []);

  const errors = useMemo(() => (showErrors ? validate(draft) : {}), [showErrors, draft]);

  const save = useCallback(async () => {
    clearTimeout(timer.current);
    const target = version.current;
    if (target === savedVersion.current) return true;
    const content = latest.current;
    const found = validate(content);
    if (Object.keys(found).length) {
      setShowErrors(true);
      setStatus("invalid");
      return false;
    }
    setStatus("saving");
    const result = await saveDraftAction(content);
    if (!result.ok) {
      setStatus("error");
      toast({ tone: "error", title: "Couldn't save your changes", description: result.error });
      return false;
    }
    savedVersion.current = Math.max(savedVersion.current, target);
    setLastSavedAt(result.data.updatedAt);
    // More edits may have landed while we were saving.
    setStatus(version.current === savedVersion.current ? "saved" : "dirty");
    if (version.current !== savedVersion.current) scheduleSave();
    return true;
  }, [toast, scheduleSave]);

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  const update = useCallback(
    (recipe: (draft: PageContent) => void) => {
      const next = structuredClone(latest.current);
      recipe(next);
      latest.current = next;
      setDraft(next);
      version.current += 1;
      setStatus("dirty");
      scheduleSave();
    },
    [scheduleSave],
  );

  // Protect unsaved work.
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (status === "dirty" || status === "saving" || status === "invalid") event.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [status]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const publish = useCallback(async () => {
    clearTimeout(timer.current);
    const content = latest.current;
    const found = validate(content);
    if (Object.keys(found).length) {
      setShowErrors(true);
      setStatus("invalid");
      toast({ tone: "error", title: "Fix the highlighted fields first", description: Object.values(found)[0] });
      return false;
    }
    setPublishing(true);
    const target = version.current;
    const result = await publishAction(content);
    setPublishing(false);
    if (!result.ok) {
      toast({ tone: "error", title: "Couldn't publish", description: result.error });
      return false;
    }
    savedVersion.current = Math.max(savedVersion.current, target);
    setPublished(structuredClone(content));
    setPublishedAt(result.data.publishedAt);
    setLastSavedAt(result.data.publishedAt);
    setStatus(version.current === savedVersion.current ? "saved" : "dirty");
    toast({
      tone: "success",
      title: "Published",
      description: "Your page is live with these changes.",
      action: { label: "View page", onClick: () => window.open("/", "_blank", "noopener") },
    });
    return true;
  }, [toast]);

  const discard = useCallback(async () => {
    clearTimeout(timer.current);
    const result = await discardDraftAction();
    if (!result.ok) {
      toast({ tone: "error", title: "Couldn't discard changes", description: result.error });
      return;
    }
    version.current += 1;
    savedVersion.current = version.current;
    latest.current = result.data.draft;
    setDraft(result.data.draft);
    setPublished(result.data.published);
    setShowErrors(false);
    setStatus("saved");
    toast({ tone: "info", title: "Changes discarded", description: "Your draft now matches the live page." });
  }, [toast]);

  const hasUnpublishedChanges = useMemo(() => !published || JSON.stringify(published) !== JSON.stringify(draft), [draft, published]);

  const value = useMemo<EditorContextValue>(
    () => ({
      viewer,
      publishedAt,
      draft,
      published,
      update,
      status,
      lastSavedAt,
      errors,
      errorFor: (path) => errors[path] ?? null,
      hasUnpublishedChanges,
      publishing,
      publish,
      discard,
      pageUrl,
      pageLabel,
    }),
    [viewer, publishedAt, draft, published, update, status, lastSavedAt, errors, hasUnpublishedChanges, publishing, publish, discard, pageUrl, pageLabel],
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}
