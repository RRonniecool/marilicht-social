import { Toaster } from "@/components/ui/toast";
import { requireAdmin } from "@/lib/auth/guards";
import { SITE_HOST, SITE_URL } from "@/lib/config";
import { getRepository } from "@/lib/data/repository";
import { EditorProvider } from "./editor-context";
import { DashboardShell } from "./shell";

/** Server-side gate: only the administrator gets past requireAdmin(). */
export async function DashboardFrame({ children }: { children: React.ReactNode }) {
  const viewer = await requireAdmin();
  const repo = await getRepository();
  const state = await repo.getEditorState();

  return (
    <Toaster>
      <EditorProvider
        initial={state}
        viewer={{ name: viewer.name, email: viewer.email, isAdmin: viewer.isAdmin, imageUrl: viewer.imageUrl, source: viewer.source }}
        pageUrl={SITE_URL}
        pageLabel={SITE_HOST}
      >
        <DashboardShell>{children}</DashboardShell>
      </EditorProvider>
    </Toaster>
  );
}
