import { ShieldX } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getViewer } from "@/lib/auth/session";
import { SITE_HOST, SITE_NAME } from "@/lib/config";

export const metadata = { title: "No access", robots: { index: false } };

/** Shown to anyone signed in who isn't the administrator. */
export default function DeniedPage() {
  return (
    <main className="grid min-h-svh place-items-center bg-paper px-6">
      <div className="max-w-sm text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-danger-soft text-danger">
          <ShieldX size={24} strokeWidth={1.75} />
        </span>
        <h1 className="mt-6 text-[24px] font-semibold tracking-[-0.02em] text-ink">This account can&apos;t manage {SITE_NAME}</h1>
        <Suspense fallback={<p className="mt-3 h-5" />}>
          <Who />
        </Suspense>
        <div className="mt-8 flex flex-col items-center gap-3">
          <SignOutButton />
          <Link href="/" className="text-[13px] text-muted hover:text-ink">
            Go to {SITE_HOST}
          </Link>
        </div>
      </div>
    </main>
  );
}

async function Who() {
  const viewer = await getViewer();
  return (
    <p className="mt-3 text-[15px] leading-relaxed text-muted">
      {viewer ? (
        <>
          You&apos;re signed in as <strong className="font-medium text-ink">{viewer.email}</strong>, which isn&apos;t the administrator account.
        </>
      ) : (
        "Only the site administrator can open the dashboard."
      )}
    </p>
  );
}
