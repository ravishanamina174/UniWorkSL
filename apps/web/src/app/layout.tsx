import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { hasClerkConfiguration } from "@/lib/clerk-config";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "UniWork | Local tasks, student opportunity",
  description: "UniWork connects Sri Lankan university students with people who need help with small, physical tasks.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const page = <ThemeProvider>{children}</ThemeProvider>;
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <a className="skip-link" href="#main-content">Skip to content</a>
        {hasClerkConfiguration() ? <ClerkProvider>{page}</ClerkProvider> : page}
      </body>
    </html>
  );
}
