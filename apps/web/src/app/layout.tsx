import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UniWork | Local tasks, student opportunity",
  description: "A foundation for connecting Sri Lankan university students with local tasks.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
