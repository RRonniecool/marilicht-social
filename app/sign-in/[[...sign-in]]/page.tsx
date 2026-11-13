/* eslint-disable @next/next/no-img-element */
import { ClerkFailed, SignIn } from "@clerk/nextjs";
import { ArrowRight, Lock } from "lucide-react";
import { Suspense } from "react";
import { devSignIn } from "@/app/dev/actions";
import { deepen, rgba } from "@/lib/color";
import { isClerkConfigured, isDevAuth, SITE_NAME } from "@/lib/config";
import { getPublicPage } from "@/lib/data/public";
import { imageSrc } from "@/lib/images";
import { DEFAULT_APPEARANCE } from "@/lib/site";
import { businessTheme, themeAttributes } from "@/lib/theme";
import type { Appearance, ImageRef } from "@/lib/types";
import { initials } from "@/lib/utils";

export const metadata = { title: "Sign in", robots: { index: false } };

/**
 * Administrator sign-in, dressed in the public site's own brand: the same
 * colors, display serif and water imagery as marilicht.social. Clerk's card
 * is themed only through its supported `appearance` variables and elements.
 */
export default async function SignInPage() {
  // Same brand as the public page (published content, or the sample until then).
  const page = await getPublicPage();
  const appearance = page.content.appearance ?? DEFAULT_APPEARANCE;
  const profile = page.content.profile;
  const name = profile?.name || SITE_NAME;

  return (
    <main className="bp min-h-svh lg:grid lg:grid-cols-[1.05fr_1fr]" style={businessTheme(appearance)} {...themeAttributes(appearance)}>
      <BrandPanel name={name} tagline={profile?.tagline} logo={profile?.logo} cover={profile?.cover} />

      <section className="relative flex flex-col items-center justify-center px-5 pb-16 pt-8 sm:px-10 lg:py-12">
        {isClerkConfigured ? (
          <Suspense fallback={<div className="h-[420px] w-full max-w-[420px] animate-pulse rounded-[24px] bg-white/70" />}>
            <SignIn withSignUp={false} forceRedirectUrl="/dashboard" appearance={clerkAppearance(appearance)} />
            {/* Clerk's script couldn't load (e.g. its domain isn't reachable): say so instead of showing nothing. */}
            <ClerkFailed>
              <div className="bp-card w-full max-w-[420px] p-8 text-center" role="alert">
                <h2 className="bp-display text-[30px]">Sign-in is unavailable</h2>
                <p className="bp-muted mt-2 text-[15px] leading-relaxed">
                  The secure sign-in service couldn&apos;t be reached. Check your connection and reload the page in a few minutes.
                </p>
              </div>
            </ClerkFailed>
          </Suspense>
        ) : isDevAuth ? (
          <DevSignIn />
        ) : (
          <div className="max-w-sm text-center">
            <h1 className="bp-display text-[30px]">Sign-in isn&apos;t configured</h1>
            <p className="bp-muted mt-2 text-[15px]">Add the Clerk keys to the environment to enable the dashboard.</p>
          </div>
        )}
      </section>
    </main>
  );
}

/** The public page's hero, condensed: cover, water light, logo and name. */
function BrandPanel({ name, tagline, logo, cover }: { name: string; tagline?: string; logo?: ImageRef | null; cover?: ImageRef | null }) {
  return (
    <aside className="relative isolate overflow-hidden bg-[var(--bp-deep)] text-white">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        {cover?.url ? (
          <img src={imageSrc(cover, 900)} alt="" className="size-full object-cover" />
        ) : (
          <div
            className="size-full"
            style={{ background: "radial-gradient(120% 80% at 70% 0%, color-mix(in srgb, var(--bp-accent) 75%, white) 0%, var(--bp-accent) 22%, var(--bp-primary) 62%, var(--bp-abyss) 100%)" }}
          />
        )}
        <div className="bp-caustics" />
        <div className="bp-caustics b" />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, color-mix(in srgb, var(--bp-abyss) 30%, transparent) 0%, transparent 30%, color-mix(in srgb, var(--bp-deep) 60%, transparent) 60%, var(--bp-deep) 100%)" }}
        />
      </div>

      <div className="flex min-h-[260px] flex-col justify-end px-6 pb-8 pt-10 sm:px-10 lg:min-h-svh lg:px-14 lg:pb-14">
        <span className="grid size-[72px] place-items-center rounded-full bg-white/20 p-1 ring-1 ring-white/30 backdrop-blur-md lg:size-[92px]">
          <span className="grid size-full place-items-center overflow-hidden rounded-full bg-white">
            {logo?.url ? (
              <img src={imageSrc(logo, 92)} alt={`${name} logo`} className="size-full object-cover" />
            ) : (
              <span className="bp-display text-[28px] text-[var(--bp-deep)]">{initials(name)}</span>
            )}
          </span>
        </span>
        <h1 className="bp-display mt-5 text-[44px] lg:text-[64px]">{name}</h1>
        {tagline && <p className="mt-2 max-w-[34ch] text-[16px] leading-snug text-white/80 lg:text-[18px]">{tagline}</p>}
        <span className="bp-chip mt-5 self-start bg-white/12 text-white/90 ring-1 ring-white/15 backdrop-blur-md">
          <Lock size={13} strokeWidth={2} />
          Administrator access
        </span>
      </div>

      {/* On phones the hero sits on top; a water-surface edge joins it to the form */}
      <svg className="absolute inset-x-0 -bottom-px h-6 w-full text-[var(--bp-bg)] lg:hidden" viewBox="0 0 400 24" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 14 C 60 4 120 4 200 12 S 340 24 400 10 L400 24 L0 24 Z" fill="currentColor" />
      </svg>
    </aside>
  );
}

/**
 * Clerk theming through its supported appearance API only. Clerk's own
 * footer ("Secured by Clerk", and "Development mode" on development
 * instances) is controlled by the Clerk instance and is left untouched.
 */
function clerkAppearance(appearance: Appearance) {
  const deep = deepen(appearance.primary, 13);
  const display = "var(--font-tide-display), Georgia, serif";
  const body = "var(--font-tide-body), system-ui, sans-serif";
  return {
    layout: {
      // The brand panel already shows the logo.
      logoPlacement: "none" as const,
      socialButtonsVariant: "blockButton" as const,
    },
    variables: {
      colorPrimary: deep,
      colorPrimaryForeground: "#FFFFFF",
      colorForeground: deep,
      colorMutedForeground: rgba(deep, 0.62),
      colorBackground: "#FFFFFF",
      colorInput: "#FFFFFF",
      colorInputForeground: deep,
      colorBorder: rgba(deep, 0.22),
      colorRing: appearance.accent,
      colorShadow: rgba(deep, 0.35),
      fontFamily: body,
      fontFamilyButtons: body,
      borderRadius: "12px",
    },
    elements: {
      rootBox: { width: "100%", maxWidth: "420px" },
      cardBox: { width: "100%", borderRadius: "24px", boxShadow: `0 1px 2px ${rgba(deep, 0.06)}, 0 30px 60px -30px ${rgba(deep, 0.4)}` },
      headerTitle: { fontFamily: display, fontWeight: 500, fontSize: "32px", letterSpacing: "-0.01em", lineHeight: 1.05 },
      headerSubtitle: { fontSize: "15px" },
      formButtonPrimary: { borderRadius: "999px", height: "46px", fontSize: "15px", fontWeight: 600, boxShadow: "none" },
      socialButtonsBlockButton: { borderRadius: "999px", height: "44px", boxShadow: `inset 0 0 0 1px ${rgba(deep, 0.2)}` },
      formFieldInput: { height: "44px", borderRadius: "12px", backgroundColor: rgba(deep, 0.025), boxShadow: `inset 0 0 0 1px ${rgba(deep, 0.2)}` },
      // Sign-up isn't offered (withSignUp={false}; Clerk's sign-up mode should be Restricted).
      footerAction: { display: "none" },
    },
  };
}

function DevSignIn() {
  return (
    <div className="bp-card w-full max-w-[420px] p-8">
      <h1 className="bp-display text-[32px]">Administrator sign-in</h1>
      <p className="bp-muted mt-2 text-[14.5px] leading-relaxed">
        Development mode: Clerk isn&apos;t configured, so you can continue without a password. This screen never appears in production.
      </p>
      <form action={devSignIn} className="mt-6">
        <button type="submit" className="bp-btn group w-full">
          Continue as administrator <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
        </button>
      </form>
    </div>
  );
}
