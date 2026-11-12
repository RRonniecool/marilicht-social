import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth-provider";
import { SITE_NAME, SITE_URL } from "@/lib/config";
import { businessFontVariables, uiFont } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${uiFont.variable} ${businessFontVariables} h-full`}>
      <body className="min-h-full">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
