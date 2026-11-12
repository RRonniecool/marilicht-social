"use client";

/**
 * Sanity Studio, embedded at /studio. Day-to-day editing happens in the
 * dashboard at /dashboard; the Studio is there for direct content access.
 */
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemaTypes";

const SITE_DOC_ID = "sitePage";

export default defineConfig({
  name: "default",
  title: process.env.NEXT_PUBLIC_SITE_NAME ?? "Marilicht",
  basePath: "/studio",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "missing",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  plugins: [
    structureTool({
      // A single page: open it directly instead of showing a list.
      structure: (S) =>
        S.list()
          .title("Content")
          .items([S.listItem().title("Site page").id(SITE_DOC_ID).child(S.document().schemaType("sitePage").documentId(SITE_DOC_ID))]),
    }),
  ],
  schema: {
    types: schemaTypes,
    // Stop anyone creating a second page from the Studio's "new document" menu.
    templates: (templates) => templates.filter((t) => t.schemaType !== "sitePage"),
  },
});
