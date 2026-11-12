import { ClerkProvider } from "@clerk/nextjs";
import { isClerkConfigured, SITE_NAME } from "@/lib/config";

/** Wraps the app in Clerk only when keys exist, so local development works without an account. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (!isClerkConfigured) return <>{children}</>;
  return (
    <ClerkProvider
      appearance={{
        variables: { colorPrimary: "#161a2b", fontFamily: "var(--font-schibsted)", borderRadius: "10px" },
      }}
      // Clerk's supported way to change its wording: speak as Marilicht, not as a generic app.
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            titleCombined: "Welcome back",
            subtitle: `Sign in to manage ${SITE_NAME}`,
            subtitleCombined: `Sign in to manage ${SITE_NAME}`,
          },
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
