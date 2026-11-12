import { ClerkProvider } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/config";

/** Wraps the app in Clerk only when keys exist, so local development works without an account. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (!isClerkConfigured) return <>{children}</>;
  return (
    <ClerkProvider
      appearance={{
        variables: { colorPrimary: "#161a2b", fontFamily: "var(--font-schibsted)", borderRadius: "10px" },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
