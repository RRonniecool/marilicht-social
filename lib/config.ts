/**
 * Site-wide configuration. Everything that differs between local development
 * and production is read here so the rest of the app never touches
 * process.env directly.
 */

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "Marilicht";

/**
 * The permanent public address. QR codes encode this, so it is a constant
 * rather than an environment variable: no deployment setting can make a
 * QR code point anywhere else.
 */
export const SITE_URL = "https://marilicht.social";

/** Human-readable host used in UI copy, e.g. "marilicht.social". */
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "");

export const isSanityConfigured = Boolean(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && process.env.NEXT_PUBLIC_SANITY_DATASET,
);

export const isClerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

export const isProduction = process.env.NODE_ENV === "production";

/**
 * Local development sign-in. Only active when Clerk is not configured AND
 * the app is not running a production build, so it can never ship.
 */
export const isDevAuth = !isClerkConfigured && !isProduction;

/**
 * Local JSON storage (.data/). Development only: a production build with
 * Sanity missing refuses to serve content instead of falling back to it.
 */
export const isLocalStore = !isSanityConfigured && !isProduction;
