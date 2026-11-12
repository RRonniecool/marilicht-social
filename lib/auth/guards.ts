import "server-only";
import { redirect } from "next/navigation";
import { getViewer, type Viewer } from "./session";

export class AccessError extends Error {}

/**
 * For pages and layouts: signed-out visitors go to /sign-in; anyone signed
 * in who isn't the administrator goes to /denied (never back to sign-in,
 * which would loop because they already have a session).
 */
export async function requireAdmin(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in");
  if (!viewer.isAdmin) redirect("/denied");
  return viewer;
}

/** For server actions and route handlers: throws instead of redirecting. */
export async function assertAdmin(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer?.isAdmin) throw new AccessError("Only the site administrator can do this. Sign in again.");
  return viewer;
}
