import Link from "next/link";
import { SITE_NAME } from "@/lib/config";

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center bg-paper px-6">
      <div className="max-w-sm text-center">
        <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-ink">There&apos;s no page here</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">The link may be out of date. Everything about {SITE_NAME} is on our main page.</p>
        <Link href="/" className="mt-8 inline-flex h-10 items-center rounded-md bg-ink px-4 text-[14px] font-medium text-white hover:bg-[#232842]">
          Go to {SITE_NAME}
        </Link>
      </div>
    </main>
  );
}
