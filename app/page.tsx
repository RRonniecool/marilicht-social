import type { Metadata } from "next";
import { BusinessPage } from "@/components/public/business-page";
import { deepen } from "@/lib/color";
import { SITE_NAME, SITE_URL } from "@/lib/config";
import { getPublishedPage } from "@/lib/data/public";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedPage();
  if (!page) return { title: SITE_NAME };
  const { profile } = page.content;
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
 * The public site. The published page is cached and tagged; publishing from
 * the dashboard expires the tag, so visitors see changes immediately.
 */
export default async function HomePage() {
  const page = await getPublishedPage();

  if (!page) {
    return (
      <main className="grid min-h-svh place-items-center bg-paper px-6 text-center">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-ink">{SITE_NAME}</h1>
          <p className="mt-2 text-[15px] text-muted">Our page is coming soon.</p>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* React hoists this into <head>: tints the mobile browser chrome to the brand */}
      <meta name="theme-color" content={deepen(page.content.appearance.primary, 13)} />
      <BusinessPage content={page.content} pageUrl={SITE_URL} />
    </>
  );
}
