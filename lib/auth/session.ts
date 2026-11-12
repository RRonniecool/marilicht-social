import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { isClerkConfigured, isDevAuth } from "@/lib/config";

export type Viewer = {
  id: string;
  email: string;
  name: string;
  imageUrl?: string;
  /** True only for the site administrator. */
  isAdmin: boolean;
  source: "clerk" | "dev";
};

export const DEV_SESSION_COOKIE = "marilicht_dev_session";

function adminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * The signed-in person, resolved once per request. Admin rights are decided
 * here, on the server only. Someone is the administrator when either:
 *   - their Clerk user has publicMetadata.role === "admin" (only settable
 *     from the Clerk dashboard or backend API, never by the user), or
 *   - their primary email is verified and listed in ADMIN_EMAILS.
 */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  if (isClerkConfigured) {
    const { auth, currentUser } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    if (!userId) return null;
    const user = await currentUser();
    if (!user) return null;
    const primary = user.primaryEmailAddress;
    const email = primary?.emailAddress?.toLowerCase() ?? "";
    const verified = primary?.verification?.status === "verified";
    const isAdmin = (user.publicMetadata as { role?: string })?.role === "admin" || (verified && adminEmails().includes(email));
    return {
      id: user.id,
      email,
      name: [user.firstName, user.lastName].filter(Boolean).join(" ") || email,
      imageUrl: user.imageUrl,
      isAdmin,
      source: "clerk",
    };
  }

  // Local development without Clerk keys: a single administrator session.
  if (!isDevAuth) return null;
  if ((await cookies()).get(DEV_SESSION_COOKIE)?.value !== "admin") return null;
  return { id: "dev_admin", email: "admin@localhost", name: "Administrator", isAdmin: true, source: "dev" };
});
