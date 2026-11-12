"use client";

import { SignOutButton as ClerkSignOutButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { devSignOut } from "@/app/dev/actions";
import { cn } from "@/lib/utils";

/**
 * Signs out through Clerk, or through the development session when Clerk
 * isn't configured. `compact` renders an icon-only button.
 */
export function SignOutButton({ source, compact, className }: { source?: "clerk" | "dev"; compact?: boolean; className?: string }) {
  const clerk = source ? source === "clerk" : Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const button = (
    <button
      type={clerk ? "button" : "submit"}
      title="Sign out"
      className={cn(
        compact
          ? "grid size-8 place-items-center rounded-sm text-muted transition hover:bg-ink/5 hover:text-ink"
          : "inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-[14px] font-medium text-white hover:bg-[#232842]",
        className,
      )}
    >
      <LogOut size={16} />
      {compact ? <span className="sr-only">Sign out</span> : "Sign out"}
    </button>
  );
  if (!clerk) return <form action={devSignOut}>{button}</form>;
  return <ClerkSignOutButton redirectUrl="/sign-in">{button}</ClerkSignOutButton>;
}
