/* eslint-disable @next/next/no-img-element */
import { SignIn } from "@clerk/nextjs";
import { ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { devSignIn } from "@/app/dev/actions";
import { deepen } from "@/lib/color";
import { isClerkConfigured, isDevAuth, SITE_HOST, SITE_NAME } from "@/lib/config";
import { getPublishedPage } from "@/lib/data/public";
import { imageSrc } from "@/lib/images";
import { DEFAULT_APPEARANCE } from "@/lib/site";
import { initials } from "@/lib/utils";

export const metadata = { title: "Sign in", robots: { index: false } };

export default function SignInPage() {
  return (
    <main className="grid min-h-svh bg-paper lg:grid-cols-[1.05fr_1fr]">
      <BrandPanel />
      <div className="flex flex-col items-center justify-center px-5 py-12 sm:px-10">
        {isClerkConfigured ? (
          // Sign-up is hidden here and should be set to "Restricted" in Clerk, so nobody can register.
          <Suspense fallback={<div className="skeleton h-[380px] w-full max-w-[400px] rounded-xl" />}>
            <SignIn withSignUp={false} forceRedirectUrl="/dashboard" appearance={{ elements: { rootBox: "w-full max-w-[400px]", cardBox: "shadow-md", footerAction: { display: "none" } } }} />
          </Suspense>
        ) : isDevAuth ? (
          <DevSignIn />
        ) : (
          <div className="max-w-sm text-center">
            <h1 className="text-[20px] font-semibold text-ink">Sign-in isn&apos;t configured</h1>
            <p className="mt-2 text-[14px] text-muted">Add the Clerk keys to the environment to enable the dashboard.</p>
          </div>
        )}
        <Link href="/" className="mt-10 text-[13px] text-muted transition hover:text-ink">
          Back to {SITE_HOST}
        </Link>
      </div>
    </main>
  );
}

/** Wears the site's own published brand colors and logo. */
async function BrandPanel() {
  const page = await getPublishedPage();
  const appearance = page?.content.appearance ?? DEFAULT_APPEARANCE;
  const logo = page?.content.profile.logo;
  const name = page?.content.profile.name || SITE_NAME;
  const deep = deepen(appearance.primary, 13);
  return (
    <aside
      className="relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col"
      style={{ background: `radial-gradient(70% 55% at 85% 0%, ${appearance.accent}66, transparent 70%), linear-gradient(160deg, ${deep}, ${deepen(deep, 17)})` }}
    >
      <div className="relative flex items-center gap-3">
        <span className="grid size-11 place-items-center overflow-hidden rounded-full bg-white text-[14px] font-semibold" style={{ color: deep }}>
          {logo?.url ? <img src={imageSrc(logo, 44)} alt="" className="size-full object-cover" /> : initials(name)}
        </span>
        <span className="text-[17px] font-semibold">{name}</span>
      </div>
      <div className="relative mt-auto max-w-[440px]">
        <p className="text-[38px] font-semibold leading-[1.08] tracking-[-0.03em]">Manage your page.</p>
        <p className="mt-4 text-[16px] leading-relaxed text-white/70">
          Update products, prices, hours and offers. Publish when you&apos;re ready and {SITE_HOST} changes instantly. Your QR code keeps working.
        </p>
      </div>
    </aside>
  );
}

function DevSignIn() {
  return (
    <div className="w-full max-w-[400px]">
      <span className="grid size-11 place-items-center rounded-full bg-surface text-ink-2 shadow-sm ring-1 ring-line">
        <Lock size={18} />
      </span>
      <h1 className="mt-5 text-[24px] font-semibold tracking-[-0.02em] text-ink">Administrator sign-in</h1>
      <p className="mt-1.5 text-[14px] leading-relaxed text-muted">
        Development mode: Clerk isn&apos;t configured, so you can continue without a password. This screen never appears in production.
      </p>
      <form action={devSignIn} className="mt-6">
        <button
          type="submit"
          className="group flex h-12 w-full items-center justify-center gap-2 rounded-md bg-ink text-[15px] font-medium text-white shadow-md transition hover:bg-[#232842]"
        >
          Continue as administrator <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
        </button>
      </form>
    </div>
  );
}
