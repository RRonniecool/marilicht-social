"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isDevAuth } from "@/lib/config";
import { DEV_SESSION_COOKIE } from "@/lib/auth/session";

/** Development-only sign-in, used when Clerk keys are not configured. */
export async function devSignIn() {
  if (!isDevAuth) throw new Error("Development sign-in is disabled");
  (await cookies()).set(DEV_SESSION_COOKIE, "admin", { httpOnly: true, sameSite: "lax", path: "/" });
  redirect("/dashboard");
}

export async function devSignOut() {
  if (!isDevAuth) return;
  (await cookies()).delete(DEV_SESSION_COOKIE);
  redirect("/sign-in");
}
