import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);

/**
 * Attaches the Clerk session to each request. It deliberately does no
 * path-based protection (Clerk recommends against it): every dashboard page,
 * the Studio and every server action check for the administrator on the
 * server themselves (lib/auth/guards.ts), and redirect or refuse otherwise.
 */
const clerk = clerkMiddleware();

export default function proxy(request: NextRequest, event: Parameters<typeof clerk>[1]) {
  if (!clerkEnabled) return NextResponse.next();
  return clerk(request, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
