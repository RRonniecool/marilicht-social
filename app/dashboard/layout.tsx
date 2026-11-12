import { Suspense } from "react";
import { DashboardFrame } from "@/components/dashboard/frame";
import { DashboardSkeleton } from "@/components/dashboard/skeleton";
import { SITE_NAME } from "@/lib/config";

export const metadata = {
  title: { default: "Dashboard", template: `%s · ${SITE_NAME} dashboard` },
  robots: { index: false, follow: false },
};

/**
 * The frame checks the session, so it streams in behind a skeleton; the
 * skeleton is part of the static shell and appears instantly.
 */
export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardFrame>{children}</DashboardFrame>
    </Suspense>
  );
}
