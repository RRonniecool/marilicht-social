"use client";

import { SignOutButton as ClerkSignOutButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { devSignOut } from "@/app/dev/actions";
import { cn } from "@/lib/utils";

type Variant = "solid" | "outline" | "icon";

const styles: Record<Variant, string> = {
  solid: "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-ink px-4 text-[14px] font-medium text-white hover:bg-[#232842]",
  outline:
    "inline-flex h-9 items-center justify-center gap-2 rounded-md bg-surface px-3 text-[13.5px] font-medium text-ink-2 shadow-xs ring-1 ring-line transition hover:bg-danger-soft hover:text-danger hover:ring-danger/30",
  icon: "grid size-8 place-items-center rounded-sm text-muted transition hover:bg-ink/5 hover:text-ink",
};

/**
 * Signs out through Clerk, or through the development session when Clerk
 * isn't configured. Clerk's own SignOutButton ends the session server-side
 * and then sends the person to /sign-in.
 */
export function SignOutButton({
  source,
  variant = "solid",
  compact,
  className,
}: {
  source?: "clerk" | "dev";
  variant?: Variant;
  /** @deprecated use variant="icon" */
  compact?: boolean;
  className?: string;
}) {
  const kind: Variant = compact ? "icon" : variant;
  const clerk = source ? source === "clerk" : Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const button = (
    <button type={clerk ? "button" : "submit"} title="Sign out" className={cn(styles[kind], className)}>
      <LogOut size={16} />
      {kind === "icon" ? <span className="sr-only">Sign out</span> : "Sign out"}
    </button>
  );
  if (!clerk) return <form action={devSignOut}>{button}</form>;
  return <ClerkSignOutButton redirectUrl="/sign-in">{button}</ClerkSignOutButton>;
}
