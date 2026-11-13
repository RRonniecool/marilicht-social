import "server-only";
import { existsSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { EditorState, ImageRef, PageContent } from "@/lib/types";
import { uid } from "@/lib/utils";
import { normalizeContent } from "./normalize";
import type { Repository } from "./repository";
import { seedContent } from "./seed";

/**
 * Development-only store: one JSON file in .data/ that mirrors the Sanity
 * model (a draft and a published version of the site page). Vercel's
 * filesystem is read-only, so production always uses Sanity.
 */

type Store = { draft: PageContent | null; published: PageContent | null; draftUpdatedAt?: string; publishedAt?: string };

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "site.json");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

let queue: Promise<unknown> = Promise.resolve();
/** Serialises writes so concurrent server actions don't clobber the file. */
function exclusive<T>(fn: () => Promise<T>): Promise<T> {
  const next = queue.then(fn, fn);
  queue = next.catch(() => undefined);
  return next;
}

async function load(): Promise<Store> {
  if (!existsSync(STORE_FILE)) {
    // Like Sanity: nothing is published until the owner publishes. The public
    // page shows the sample meanwhile, and the dashboard starts from it.
    const fresh: Store = { draft: null, published: null };
    await save(fresh);
    return fresh;
  }
  return JSON.parse(await readFile(STORE_FILE, "utf8")) as Store;
}

async function save(store: Store) {
  await mkdir(DATA_DIR, { recursive: true });
  const tmp = `${STORE_FILE}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(store, null, 2));
  await rename(tmp, STORE_FILE);
}

export function createLocalRepository(): Repository {
  return {
    kind: "local",

    async getPublishedPage() {
      const store = await load();
      return store.published ? { content: normalizeContent(store.published), publishedAt: store.publishedAt } : null;
    },

    async getEditorState(): Promise<EditorState> {
      const store = await load();
      const published = store.published ? normalizeContent(store.published) : null;
      return {
        draft: store.draft ? normalizeContent(store.draft) : (published ?? normalizeContent(seedContent)),
        published,
        hasUnpublishedChanges: Boolean(store.draft) || !published,
        draftUpdatedAt: store.draftUpdatedAt,
        publishedAt: store.publishedAt,
      };
    },

    saveDraft(content) {
      return exclusive(async () => {
        const store = await load();
        const updatedAt = new Date().toISOString();
        await save({ ...store, draft: content, draftUpdatedAt: updatedAt });
        return { updatedAt };
      });
    },

    publish() {
      return exclusive(async () => {
        const store = await load();
        const publishedAt = new Date().toISOString();
        await save({ draft: null, published: store.draft ?? store.published ?? normalizeContent(seedContent), publishedAt });
        return { publishedAt };
      });
    },

    discardDraft() {
      return exclusive(async () => {
        const store = await load();
        await save({ ...store, draft: null, draftUpdatedAt: undefined });
      });
    },

    async uploadImage(file: File): Promise<ImageRef> {
      await mkdir(UPLOAD_DIR, { recursive: true });
      const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
      const name = `${uid()}.${ext}`;
      await writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
      return { url: `/api/media/${name}`, alt: "" };
    },
  };
}
