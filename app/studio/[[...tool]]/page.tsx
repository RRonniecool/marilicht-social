import { NextStudio } from "next-sanity/studio";
import { Suspense } from "react";
import config from "@/sanity.config";
import { requireAdmin } from "@/lib/auth/guards";
import { isSanityConfigured } from "@/lib/config";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <main className="grid min-h-svh place-items-center bg-paper px-6 text-center">
        <div className="max-w-md">
          <h1 className="text-[22px] font-semibold text-ink">Sanity isn&apos;t connected yet</h1>
          <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
            Set NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET and SANITY_API_WRITE_TOKEN to use the Studio. Until then, content is
            stored locally in the .data folder.
          </p>
        </div>
      </main>
    );
  }
  return (
    <Suspense fallback={null}>
      <AdminStudio />
    </Suspense>
  );
}

/** Only the administrator may open the Studio (Sanity also requires its own login). */
async function AdminStudio() {
  await requireAdmin();
  return <NextStudio config={config} />;
}
