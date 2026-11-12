"use client";

import { Panel } from "@/components/ui/misc";
import { QrStudio } from "@/components/qr/qr-studio";
import { SITE_NAME } from "@/lib/config";
import { slugify } from "@/lib/utils";
import { useEditor } from "../editor-context";

export function QrSection() {
  const { draft, pageUrl, pageLabel, published } = useEditor();
  // The code encodes the permanent address, never page content, so it stays valid forever.
  const source = published ?? draft;
  return (
    <div className="space-y-5">
      <Panel
        title="Your permanent QR code"
        description="Print it on bottles, flyers, delivery vans and your counter. Whatever you change on your page later, this code keeps working."
      >
        <QrStudio
          url={pageUrl}
          label={pageLabel}
          name={draft.profile.name || SITE_NAME}
          logo={source.profile.logo ?? draft.profile.logo}
          primary={draft.appearance.primary}
          accent={draft.appearance.accent}
          fileName={slugify(SITE_NAME) || "qr"}
        />
      </Panel>
    </div>
  );
}
