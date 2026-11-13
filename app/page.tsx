import type { Metadata } from "next";
import { BusinessPage } from "@/components/public/business-page";
import { deepen } from "@/lib/color";
import { SITE_NAME, SITE_URL } from "@/lib/config";
import { getPublicPage } from "@/lib/data/public";

export async function generateMetadata(): Promise<Metadata> {
  const { content } = await getPublicPage();
  const { profile } = content;
  const description = profile.tagline || profile.description.slice(0, 160);
  const image = profile.cover?.url ?? profile.logo?.url;
  return {
    title: { absolute: profile.name || SITE_NAME },
    description,
    alternates: { canonical: SITE_URL },
    openGraph: { title: profile.name, description, url: SITE_URL, siteName: SITE_NAME, images: image ? [{ url: image }] : undefined },
    icons: profile.logo?.url ? { icon: profile.logo.url, apple: profile.logo.url } : undefined,
  };
}

/**
 * The public site. Shows the published page; until the owner publishes for
 * the first time it shows the sample Marilicht page instead of an empty one.
 * The published page is cached and tagged; publishing from the dashboard
 * expires the tag, so visitors see the real content immediately.
 */
export default async function HomePage() {
  const { content } = await getPublicPage();
  return (
    <>
      {/* React hoists this into <head>: tints the mobile browser chrome to the brand */}
      <meta name="theme-color" content={deepen(content.appearance.primary, 13)} />
      <BusinessPage content={content} pageUrl={SITE_URL} />
    </>
  );
}
